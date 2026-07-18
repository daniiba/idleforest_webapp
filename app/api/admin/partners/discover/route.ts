import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PartnerDiscoveryCandidate } from '@/lib/partner-leads'

export const maxDuration = 180

const ADMIN_SESSION_COOKIE = 'admin_session'
const DEFAULT_RESULT_COUNT = 6
const MAX_RESULT_COUNT = 8
const nullableInteger = { type: ['integer', 'null'] }

const candidateSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        url: { type: 'string' },
        name: { type: 'string' },
        summary: { type: 'string' },
        location: { type: 'string' },
        country_code: { type: 'string' },
        category: { type: 'array', items: { type: 'string' } },
        delivery_model: {
            type: 'string',
            enum: ['direct_operator', 'land_owner_manager', 'project_network', 'grantmaker_funder', 'research_education', 'advocacy', 'mixed', 'unknown'],
        },
        discovery_score: { type: 'integer', minimum: 0, maximum: 100 },
        community_platform: { type: 'string' },
        community_size: nullableInteger,
        community_source_url: { type: 'string' },
        activity_status: { type: 'string', enum: ['active', 'irregular', 'inactive', 'unknown'] },
        activity_signal: { type: 'string' },
        why_fit: { type: 'string' },
        verification_gaps: { type: 'array', items: { type: 'string' } },
        sources: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                },
                required: ['title', 'url'],
            },
        },
    },
    required: [
        'url', 'name', 'summary', 'location', 'country_code', 'category', 'delivery_model',
        'discovery_score', 'community_platform', 'community_size', 'community_source_url',
        'activity_status', 'activity_signal', 'why_fit', 'verification_gaps', 'sources',
    ],
}

const responseSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        candidates: { type: 'array', items: candidateSchema },
    },
    required: ['candidates'],
}

function normalizeUrl(input: string) {
    const candidate = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http(s) URLs are supported')
    url.hash = ''
    return url.toString()
}

function normalizeHost(input: string) {
    try {
        return new URL(normalizeUrl(input)).hostname.toLowerCase().replace(/^www\./, '')
    } catch {
        return ''
    }
}

function getOutputText(payload: Record<string, unknown>) {
    if (typeof payload.output_text === 'string') return payload.output_text
    const output = Array.isArray(payload.output) ? payload.output : []
    for (const item of output) {
        if (!item || typeof item !== 'object' || (item as { type?: string }).type !== 'message') continue
        const content = (item as { content?: unknown }).content
        if (!Array.isArray(content)) continue
        for (const part of content) {
            if (part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string') {
                return (part as { text: string }).text
            }
        }
    }
    return ''
}

function compactText(value: string, maxLength: number) {
    const normalized = value.replace(/\s+/g, ' ').trim()
    if (normalized.length <= maxLength) return normalized
    const clipped = normalized.slice(0, maxLength)
    const lastSpace = clipped.lastIndexOf(' ')
    return `${clipped.slice(0, lastSpace > maxLength * 0.65 ? lastSpace : maxLength).trim()}…`
}

function isHttpUrl(value: string) {
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
        return false
    }
}

function cleanCandidate(candidate: PartnerDiscoveryCandidate): PartnerDiscoveryCandidate | null {
    let url: string
    try {
        url = normalizeUrl(candidate.url)
    } catch {
        return null
    }

    const host = normalizeHost(url)
    if (['facebook.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'x.com', 'twitter.com'].some(domain => host === domain || host.endsWith(`.${domain}`))) {
        return null
    }

    const communitySize = candidate.community_size !== null && Number.isFinite(candidate.community_size)
        ? Math.max(0, Math.round(candidate.community_size))
        : null

    if (communitySize !== null && (communitySize < 4_000 || communitySize > 500_000)) return null

    return {
        ...candidate,
        url,
        name: compactText(candidate.name, 70),
        summary: compactText(candidate.summary, 150),
        location: compactText(candidate.location, 60),
        country_code: /^[A-Za-z]{2}$/.test(candidate.country_code) ? candidate.country_code.toUpperCase() : 'XX',
        category: candidate.category.slice(0, 3).map(value => compactText(value, 40)),
        discovery_score: Math.max(0, Math.min(100, Math.round(candidate.discovery_score))),
        community_platform: compactText(candidate.community_platform, 30) || 'Unknown',
        community_size: communitySize,
        community_source_url: isHttpUrl(candidate.community_source_url) ? candidate.community_source_url : '',
        activity_signal: compactText(candidate.activity_signal, 100),
        why_fit: compactText(candidate.why_fit, 120),
        verification_gaps: candidate.verification_gaps.slice(0, 2).map(value => compactText(value, 80)),
        sources: candidate.sources.filter(source => isHttpUrl(source.url)).slice(0, 5),
    }
}

export async function POST(request: NextRequest) {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET
    const cookieStore = await cookies()
    if (!sessionSecret || cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== sessionSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 503 })
    }

    let focus = ''
    let count = DEFAULT_RESULT_COUNT
    try {
        const body = await request.json() as { focus?: unknown; count?: unknown }
        focus = typeof body.focus === 'string' ? body.focus.replace(/\s+/g, ' ').trim().slice(0, 240) : ''
        if (body.count !== undefined) {
            const requestedCount = Number(body.count)
            if (!Number.isFinite(requestedCount)) throw new Error('count must be a number')
            count = Math.max(3, Math.min(MAX_RESULT_COUNT, Math.round(requestedCount)))
        }
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid discovery input' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: existing, error: existingError } = await admin.from('partner_leads').select('url').limit(500)
    if (existingError && existingError.code !== '42P01') {
        return NextResponse.json({ error: existingError.message }, { status: 500 })
    }
    const existingHosts = new Set((existing || []).map(item => normalizeHost(item.url)).filter(Boolean))
    const exclusionList = Array.from(existingHosts).slice(0, 250)
    const today = new Date().toISOString().slice(0, 10)

    const instructions = `You find new potential conservation partners for IdleForest using live web search.

Return exactly ${count} credible organizations when possible. Find official organization websites, not directories, articles, social profiles, or projects without their own organization.

Mandatory fit:
- Mission: reforestation, landscape restoration, animal conservation, animal rewilding, or conservation land acquisition.
- Audience: credible evidence that at least one individual platform has 4,000–500,000 followers or members. Never combine platforms. If a likely fit has no defensible current number, community_size must be null and the gap must be explicit.
- Activity: recent and regular public work, preferably within 90 days.
- Prefer direct field operators and land owners/managers over large umbrella funds or global institutions.

Discovery score (100): mission 35, qualifying audience signal 25, recent activity 20, direct delivery 10, public contactability 10. This is a preliminary discovery score, not the final partner qualification score.

Rules:
- Today is ${today}. Use recent primary sources and official profiles wherever possible.
- Exclude any organization whose domain appears in the exclusion list.
- Do not invent follower counts, activity, projects, or locations. Use null/unknown and add a verification gap.
- summary, why_fit, and activity_signal must each be one short factual sentence, never a paragraph.
- location must be only "City/Region, Country" and country_code must be ISO alpha-2.
- community_source_url must directly support the audience number; return an empty string when no number is defensible.
- Include 2–5 direct evidence links per candidate, including the official website.
- Rank candidates best-first and diversify organizations and geographies.
- Do not perform deep financial research or draft outreach during discovery.`

    const input = [
        focus ? `Search focus from the team: ${focus}` : 'Search focus: worldwide; diversify across eligible conservation categories.',
        exclusionList.length ? `Already in the pipeline — exclude these domains:\n${exclusionList.join('\n')}` : 'The current pipeline is empty.',
    ].join('\n\n')

    let openAIResponse: Response
    try {
        openAIResponse = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.OPENAI_PARTNER_MODEL || 'gpt-5.6',
                instructions,
                input,
                tools: [{ type: 'web_search', search_context_size: 'high' }],
                reasoning: { effort: 'medium' },
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'idleforest_partner_discovery',
                        strict: true,
                        schema: responseSchema,
                    },
                },
                include: ['web_search_call.action.sources'],
                store: false,
            }),
            signal: AbortSignal.timeout(165_000),
        })
    } catch (error) {
        console.error('Partner discovery request failed:', error)
        return NextResponse.json({ error: 'Partner discovery timed out or could not reach the AI service.' }, { status: 502 })
    }

    const payload = await openAIResponse.json() as Record<string, unknown>
    if (!openAIResponse.ok) {
        const apiError = payload.error as { message?: string } | undefined
        console.error('OpenAI partner discovery error:', payload)
        return NextResponse.json({ error: apiError?.message || 'AI partner discovery failed.' }, { status: 502 })
    }

    try {
        const parsed = JSON.parse(getOutputText(payload)) as { candidates: PartnerDiscoveryCandidate[] }
        if (!Array.isArray(parsed.candidates)) throw new Error('Discovery returned an invalid shortlist')

        const seen = new Set(existingHosts)
        const candidates = parsed.candidates
            .map(cleanCandidate)
            .filter((candidate): candidate is PartnerDiscoveryCandidate => candidate !== null)
            .filter(candidate => {
                const host = normalizeHost(candidate.url)
                if (!host || seen.has(host)) return false
                seen.add(host)
                return true
            })
            .sort((a, b) => b.discovery_score - a.discovery_score)
            .slice(0, count)

        return NextResponse.json({ candidates })
    } catch (error) {
        console.error('Could not parse partner discovery:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not parse the discovery shortlist.' }, { status: 500 })
    }
}
