import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PartnerAnalysis, PartnerLead } from '@/lib/partner-leads'

export const maxDuration = 300

const ADMIN_SESSION_COOKIE = 'admin_session'
const MAX_URLS = 12

const nullableInteger = { type: ['integer', 'null'] }

const partnerSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        url: { type: 'string' },
        name: { type: 'string' },
        logo_url: { type: ['string', 'null'] },
        score: { type: 'integer', minimum: 0, maximum: 100 },
        recommendation: { type: 'string', enum: ['strong_fit', 'potential_fit', 'not_a_fit'] },
        category: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
        structure: { type: 'string' },
        location: { type: 'string' },
        team_model: { type: 'string' },
        operator_type: { type: 'string' },
        financial_model: { type: 'array', items: { type: 'string' } },
        financial_situation: { type: 'string' },
        sponsors: { type: 'array', items: { type: 'string' } },
        communities: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    platform: { type: 'string' },
                    handle: { type: 'string' },
                    followers: nullableInteger,
                    url: { type: 'string' },
                },
                required: ['platform', 'handle', 'followers', 'url'],
            },
        },
        contacts: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    type: { type: 'string' },
                    value: { type: 'string' },
                    label: { type: 'string' },
                },
                required: ['type', 'value', 'label'],
            },
        },
        socials: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    type: { type: 'string' },
                    value: { type: 'string' },
                    label: { type: 'string' },
                },
                required: ['type', 'value', 'label'],
            },
        },
        activity_summary: { type: 'string' },
        last_activity: { type: 'string' },
        fit_reasons: { type: 'array', items: { type: 'string' } },
        risks: { type: 'array', items: { type: 'string' } },
        outreach_angle: { type: 'string' },
        outreach_subject: { type: 'string' },
        outreach_message: { type: 'string' },
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
        confidence: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: [
        'url', 'name', 'logo_url', 'score', 'recommendation', 'category', 'summary',
        'structure', 'location', 'team_model', 'operator_type', 'financial_model',
        'financial_situation', 'sponsors', 'communities', 'contacts', 'socials',
        'activity_summary', 'last_activity', 'fit_reasons', 'risks', 'outreach_angle',
        'outreach_subject', 'outreach_message', 'sources', 'confidence',
    ],
}

const responseSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        partners: { type: 'array', items: partnerSchema },
    },
    required: ['partners'],
}

function normalizeUrl(input: string) {
    const candidate = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http(s) URLs are supported')
    url.hash = ''
    return url.toString()
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

function uniqueByUrl<T extends { url: string }>(items: T[]) {
    const seen = new Set<string>()
    return items.filter(item => {
        if (!item.url || seen.has(item.url)) return false
        seen.add(item.url)
        return true
    })
}

function cleanAnalysis(analysis: PartnerAnalysis, submittedUrl: string): PartnerAnalysis {
    const urlMatches = (() => {
        try {
            return new URL(submittedUrl).hostname.replace(/^www\./, '') === new URL(analysis.url).hostname.replace(/^www\./, '')
        } catch {
            return false
        }
    })()
    const canonicalUrl = urlMatches ? analysis.url : submittedUrl

    return {
        ...analysis,
        url: canonicalUrl,
        name: analysis.name.trim() || new URL(submittedUrl).hostname,
        logo_url: analysis.logo_url || null,
        score: Math.max(0, Math.min(100, Math.round(analysis.score))),
        communities: analysis.communities.filter(item => item.url && item.platform),
        contacts: analysis.contacts.filter(item => item.value && item.type),
        socials: analysis.socials.filter(item => item.value),
        sources: uniqueByUrl(analysis.sources).slice(0, 12),
        confidence: Math.max(0, Math.min(1, analysis.confidence)),
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
        return NextResponse.json(
            { error: 'OPENAI_API_KEY is not configured on the server.' },
            { status: 503 }
        )
    }

    let urls: string[]
    try {
        const body = await request.json() as { urls?: unknown }
        if (!Array.isArray(body.urls)) throw new Error('urls must be an array')
        urls = Array.from(new Set(body.urls.map(value => normalizeUrl(String(value))))).slice(0, MAX_URLS)
        if (!urls.length) throw new Error('Add at least one URL')
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Invalid URL input' },
            { status: 400 }
        )
    }

    const today = new Date().toISOString().slice(0, 10)
    const instructions = `You are IdleForest's partnership research analyst. Research every submitted organization using live web search and return one record per URL.

Qualification criteria:
- The organization must work in reforestation, landscape restoration, animal conservation, animal rewilding, or conservation land acquisition.
- A target partner has at least 4,000 and no more than 500,000 followers or members on at least one individual platform. Never combine audiences across platforms.
- Verify recent, regular public activity and state the latest dated activity you can establish.
- Establish structure (company, NGO, university, individual, etc.), country/location, volunteers versus paid staff, whether it directly performs conservation or is a network/fund/manager, financial model and current financial situation, official sponsors/partnerships, social profiles, and public professional contact information.

Scoring rubric (100 points): mission/category 25, one qualifying community 20, recency/regularity 15, direct conservation delivery 15, financial/funding fit 10, public contactability 5, credibility/transparency/partnerships 10. A strong_fit normally scores 75+ and must satisfy both mission and community requirements. Use potential_fit for credible but incomplete evidence. Use not_a_fit when a mandatory requirement clearly fails.

Rules:
- Today is ${today}. Prefer recent primary sources, official profiles, current reports, registries, and reputable reporting.
- Do not guess. Use "Unknown — not publicly verified" for unsupported facts and add the gap to risks.
- Record each platform separately with its own follower count. Use null when a count cannot be verified.
- Financial situation must distinguish verified facts from reasonable inference.
- Contacts must be public organization/professional channels only; never infer private addresses.
- Source links must directly support the record and should include the official website plus the best evidence for community, activity, and finances.
- Draft a concise, warm outreach email from IdleForest. Reference a specific verified project or strength and propose a low-friction introductory call. Do not make unsupported claims or promise funding.
- Return the submitted organization URL in the url field.`

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
                input: `Research these potential partners:\n${urls.map((url, index) => `${index + 1}. ${url}`).join('\n')}`,
                tools: [{ type: 'web_search', search_context_size: 'medium' }],
                reasoning: { effort: 'medium' },
                text: {
                    format: {
                        type: 'json_schema',
                        name: 'idleforest_partner_analysis',
                        strict: true,
                        schema: responseSchema,
                    },
                },
                include: ['web_search_call.action.sources'],
                store: false,
            }),
            signal: AbortSignal.timeout(280_000),
        })
    } catch (error) {
        console.error('Partner research request failed:', error)
        return NextResponse.json({ error: 'The research request timed out or could not reach the AI service.' }, { status: 502 })
    }

    const payload = await openAIResponse.json() as Record<string, unknown>
    if (!openAIResponse.ok) {
        const apiError = payload.error as { message?: string } | undefined
        console.error('OpenAI partner research error:', payload)
        return NextResponse.json({ error: apiError?.message || 'AI research failed.' }, { status: 502 })
    }

    try {
        const parsed = JSON.parse(getOutputText(payload)) as { partners: PartnerAnalysis[] }
        if (!Array.isArray(parsed.partners) || !parsed.partners.length) {
            throw new Error('The analysis returned no partner records')
        }

        const analyses = parsed.partners
            .slice(0, urls.length)
            .map((item, index) => cleanAnalysis(item, urls[index]))
        const admin = createAdminClient()
        const saved: PartnerLead[] = []

        for (const analysis of analyses) {
            const { data, error } = await admin
                .from('partner_leads')
                .upsert(analysis, { onConflict: 'url' })
                .select('*')
                .single()

            if (error) throw error
            saved.push(data as PartnerLead)
        }

        return NextResponse.json({ partners: saved })
    } catch (error) {
        console.error('Could not parse or save partner research:', error)
        const databaseError = error as { code?: string; message?: string }
        if (databaseError.code === '42P01') {
            return NextResponse.json(
                { error: 'Partner storage is not initialized yet. Apply the 20260718 partner leads migration, then try again.' },
                { status: 503 }
            )
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : databaseError.message || 'Could not save the AI analysis.' },
            { status: 500 }
        )
    }
}
