import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
    PartnerDiscoveryCandidate,
    PartnerDiscoveryStatus,
    PartnerDiscoveryUsage,
    PartnerResearchTrack,
} from '@/lib/partner-leads'

export const maxDuration = 180

const ADMIN_SESSION_COOKIE = 'admin_session'
const DEFAULT_RESULT_COUNT = 6
const MAX_RESULT_COUNT = 8
const MAX_EXCLUDED_URLS = 200
const nullableInteger = { type: ['integer', 'null'] }
const nullableNumber = { type: ['number', 'null'] }
const nullableString = { type: ['string', 'null'] }

const modelPricing: Record<string, { input: number; cachedInput: number; output: number }> = {
    'gpt-5.6-sol': { input: 5, cachedInput: 0.5, output: 30 },
    'gpt-5.6-terra': { input: 2.5, cachedInput: 0.25, output: 15 },
    'gpt-5.6-luna': { input: 1, cachedInput: 0.1, output: 6 },
}

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
        accessibility_score: { type: 'integer', minimum: 0, maximum: 100 },
        accessibility_tier: { type: 'string', enum: ['ready_now', 'nurture', 'unlikely_now', 'unknown'] },
        accessibility_summary: { type: 'string' },
        state_dependency: { type: 'string', enum: ['low', 'medium', 'high', 'unknown'] },
        small_company_signal: { type: 'string', enum: ['positive', 'negative', 'unknown'] },
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
        fundraising_platform: { type: 'string' },
        fundraising_model: {
            type: 'string',
            enum: ['recurring_membership', 'long_running_campaign', 'open_ended_campaign', 'fixed_term_campaign', 'unknown'],
        },
        fundraising_url: { type: 'string' },
        funding_goal_amount: nullableNumber,
        amount_raised: nullableNumber,
        funding_currency: nullableString,
        campaign_started_at: nullableString,
        fundraising_signal: { type: 'string' },
        is_environmental: { type: 'boolean' },
    },
    required: [
        'url', 'name', 'summary', 'location', 'country_code', 'category', 'delivery_model',
        'discovery_score', 'accessibility_score', 'accessibility_tier', 'accessibility_summary',
        'state_dependency', 'small_company_signal', 'community_platform', 'community_size', 'community_source_url',
        'activity_status', 'activity_signal', 'why_fit', 'verification_gaps', 'sources',
        'fundraising_platform', 'fundraising_model', 'fundraising_url', 'funding_goal_amount',
        'amount_raised', 'funding_currency', 'campaign_started_at', 'fundraising_signal',
        'is_environmental',
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

function normalizeResearchKey(input: string, researchTrack: PartnerResearchTrack) {
    if (researchTrack === 'idleforest') return normalizeHost(input)
    try {
        const url = new URL(normalizeUrl(input))
        const host = url.hostname.toLowerCase().replace(/^www\./, '')
        const path = url.pathname.replace(/\/+$/, '').toLowerCase()
        return `${host}${path || '/'}`
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

function isAdminSession(cookieValue: string | undefined) {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET
    return Boolean(sessionSecret && cookieValue === sessionSecret)
}

function parseResearchTrack(value: unknown): PartnerResearchTrack {
    return value === 'cloudfund' ? 'cloudfund' : 'idleforest'
}

function isMissingDiscoveryTable(error: { code?: string; message?: string } | null) {
    return Boolean(error && (
        error.code === '42P01'
        || error.code === 'PGRST205'
        || error.message?.includes("partner_discoveries") && error.message.includes('schema cache')
    ))
}

function getSearchCallCount(payload: Record<string, unknown>) {
    const output = Array.isArray(payload.output) ? payload.output : []
    return output.filter(item => {
        if (!item || typeof item !== 'object' || (item as { type?: string }).type !== 'web_search_call') return false
        const action = (item as { action?: unknown }).action
        return Boolean(action && typeof action === 'object' && (action as { type?: string }).type === 'search')
    }).length
}

function getUsage(payload: Record<string, unknown>, model: string): PartnerDiscoveryUsage {
    const usage = payload.usage && typeof payload.usage === 'object'
        ? payload.usage as {
            input_tokens?: number
            output_tokens?: number
            input_tokens_details?: { cached_tokens?: number }
        }
        : {}
    const inputTokens = Number(usage.input_tokens) || 0
    const outputTokens = Number(usage.output_tokens) || 0
    const cachedInputTokens = Math.min(inputTokens, Number(usage.input_tokens_details?.cached_tokens) || 0)
    const searchCalls = getSearchCallCount(payload)
    const pricing = modelPricing[model]
    const estimatedCost = pricing
        ? ((inputTokens - cachedInputTokens) * pricing.input
            + cachedInputTokens * pricing.cachedInput
            + outputTokens * pricing.output) / 1_000_000
            + searchCalls * 0.01
        : null

    return {
        model,
        input_tokens: inputTokens,
        cached_input_tokens: cachedInputTokens,
        output_tokens: outputTokens,
        search_calls: searchCalls,
        estimated_cost_usd: estimatedCost === null ? null : Number(estimatedCost.toFixed(6)),
    }
}

function candidateToRow(candidate: PartnerDiscoveryCandidate, focus: string, researchTrack: PartnerResearchTrack) {
    return {
        domain: normalizeResearchKey(candidate.url, researchTrack),
        ...candidate,
        focus,
        research_track: researchTrack,
        status: 'discovered' as const,
        last_discovered_at: new Date().toISOString(),
    }
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

function cleanCandidate(candidate: PartnerDiscoveryCandidate, researchTrack: PartnerResearchTrack): PartnerDiscoveryCandidate | null {
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
    const accessibilityScore = Math.max(0, Math.min(100, Math.round(candidate.accessibility_score)))

    if (researchTrack === 'idleforest' && communitySize !== null && (communitySize < 4_000 || communitySize > 500_000)) return null
    if (accessibilityScore < 40 || !['ready_now', 'nurture'].includes(candidate.accessibility_tier)) return null
    if (researchTrack === 'cloudfund' && (
        candidate.is_environmental
        || !['recurring_membership', 'long_running_campaign', 'open_ended_campaign'].includes(candidate.fundraising_model)
    )) return null

    const fundingGoal = candidate.funding_goal_amount !== null && Number.isFinite(candidate.funding_goal_amount)
        ? Math.max(0, candidate.funding_goal_amount)
        : null
    const amountRaised = candidate.amount_raised !== null && Number.isFinite(candidate.amount_raised)
        ? Math.max(0, candidate.amount_raised)
        : null
    const campaignStartedAt = candidate.campaign_started_at && /^\d{4}-\d{2}-\d{2}$/.test(candidate.campaign_started_at)
        ? candidate.campaign_started_at
        : null

    return {
        ...candidate,
        url,
        name: compactText(candidate.name, 70),
        summary: compactText(candidate.summary, 150),
        location: compactText(candidate.location, 60),
        country_code: /^[A-Za-z]{2}$/.test(candidate.country_code) ? candidate.country_code.toUpperCase() : 'XX',
        category: candidate.category.slice(0, 3).map(value => compactText(value, 40)),
        discovery_score: Math.max(0, Math.min(100, Math.round(candidate.discovery_score))),
        accessibility_score: accessibilityScore,
        accessibility_summary: compactText(candidate.accessibility_summary, 110),
        community_platform: compactText(candidate.community_platform, 30) || 'Unknown',
        community_size: communitySize,
        community_source_url: isHttpUrl(candidate.community_source_url) ? candidate.community_source_url : '',
        activity_signal: compactText(candidate.activity_signal, 100),
        why_fit: compactText(candidate.why_fit, 120),
        verification_gaps: candidate.verification_gaps.slice(0, 2).map(value => compactText(value, 80)),
        sources: candidate.sources.filter(source => isHttpUrl(source.url)).slice(0, 5),
        fundraising_platform: compactText(candidate.fundraising_platform, 40),
        fundraising_url: isHttpUrl(candidate.fundraising_url) ? candidate.fundraising_url : '',
        funding_goal_amount: fundingGoal,
        amount_raised: amountRaised,
        funding_currency: candidate.funding_currency?.toUpperCase().slice(0, 3) || null,
        campaign_started_at: campaignStartedAt,
        fundraising_signal: compactText(candidate.fundraising_signal, 120),
    }
}

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    if (!isAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestedLimit = Number(request.nextUrl.searchParams.get('limit') || 100)
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(300, Math.round(requestedLimit))) : 100
    const researchTrack = parseResearchTrack(request.nextUrl.searchParams.get('research_track'))
    const { data, error } = await createAdminClient()
        .from('partner_discoveries')
        .select('*')
        .eq('research_track', researchTrack)
        .order('last_discovered_at', { ascending: false })
        .limit(limit)

    if (error) {
        if (isMissingDiscoveryTable(error)) {
            return NextResponse.json({ candidates: [], setup_required: true })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ candidates: data || [] })
}

export async function PATCH(request: NextRequest) {
    const cookieStore = await cookies()
    if (!isAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let url = ''
    let status: PartnerDiscoveryStatus = 'discovered'
    let researchTrack: PartnerResearchTrack = 'idleforest'
    try {
        const body = await request.json() as { url?: unknown; status?: unknown; research_track?: unknown }
        if (typeof body.url !== 'string' || !normalizeHost(body.url)) throw new Error('A valid candidate URL is required')
        if (!['discovered', 'researched', 'dismissed'].includes(String(body.status))) throw new Error('Invalid discovery status')
        url = body.url
        status = body.status as PartnerDiscoveryStatus
        researchTrack = parseResearchTrack(body.research_track)
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid update' }, { status: 400 })
    }

    const { error } = await createAdminClient()
        .from('partner_discoveries')
        .update({ status })
        .eq('domain', normalizeResearchKey(url, researchTrack))
        .eq('research_track', researchTrack)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()
    if (!isAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 503 })
    }

    let focus = ''
    let count = DEFAULT_RESULT_COUNT
    let requestExcludeUrls: string[] = []
    let researchTrack: PartnerResearchTrack = 'idleforest'
    try {
        const body = await request.json() as { focus?: unknown; count?: unknown; exclude_urls?: unknown; research_track?: unknown }
        researchTrack = parseResearchTrack(body.research_track)
        focus = typeof body.focus === 'string' ? body.focus.replace(/\s+/g, ' ').trim().slice(0, 240) : ''
        if (body.count !== undefined) {
            const requestedCount = Number(body.count)
            if (!Number.isFinite(requestedCount)) throw new Error('count must be a number')
            count = Math.max(3, Math.min(MAX_RESULT_COUNT, Math.round(requestedCount)))
        }
        if (body.exclude_urls !== undefined && !Array.isArray(body.exclude_urls)) {
            throw new Error('exclude_urls must be an array')
        }
        requestExcludeUrls = Array.isArray(body.exclude_urls)
            ? body.exclude_urls.filter((value): value is string => typeof value === 'string').slice(0, MAX_EXCLUDED_URLS)
            : []
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid discovery input' }, { status: 400 })
    }

    const admin = createAdminClient()
    const [{ data: existing, error: existingError }, { data: discovered, error: discoveredError }] = await Promise.all([
        admin.from('partner_leads').select('url').eq('research_track', researchTrack).limit(1000),
        admin.from('partner_discoveries').select('domain').eq('research_track', researchTrack).order('last_discovered_at', { ascending: false }).limit(5000),
    ])
    if (existingError && existingError.code !== '42P01') {
        return NextResponse.json({ error: existingError.message }, { status: 500 })
    }
    if (discoveredError && !isMissingDiscoveryTable(discoveredError)) {
        return NextResponse.json({ error: discoveredError.message }, { status: 500 })
    }
    const excludedHosts = new Set([
        ...(existing || []).map(item => normalizeResearchKey(item.url, researchTrack)),
        ...(discovered || []).map(item => item.domain),
        ...requestExcludeUrls.map(url => normalizeResearchKey(url, researchTrack)),
    ].filter(Boolean))
    const exclusionList = Array.from(excludedHosts).slice(0, 1000)
    const today = new Date().toISOString().slice(0, 10)

    const instructions = researchTrack === 'cloudfund'
        ? `You find new funding prospects for CloudFund using live web search.

CloudFund turns unused internet bandwidth into steady funding for verified projects. Return exactly ${count} credible fundraising projects when possible. Find the official project, creator, community, or campaign page—not directories, press coverage, or generic fundraising-platform homepages.

Mandatory fit:
- The fundraiser must be active and non-environmental. Exclude climate, conservation, reforestation, wildlife, sustainability, clean-energy, and environmental campaigns because those belong in IdleForest's pipeline.
- It must use recurring membership, an open-ended fundraiser, or a campaign that has run for at least six months and still has a current funding need. Good signals include Patreon, Open Collective, GitHub Sponsors, Ko-fi memberships, Buy Me a Coffee memberships, Givebutter, Donorbox, or a long-running GoFundMe.
- It must have a clear operator, public-benefit or community outcome, concrete use of funds, and a public contact route.
- Prefer education, health, open science, public technology, open source, community infrastructure, mutual aid, and creator-led communities with ongoing operating costs.
- Exclude emergencies that are already resolved, fully funded or dormant campaigns, pure personal consumption, speculative investment, political candidates, and campaigns with no verifiable responsible person.

Discovery score (100): active recurring/long-running fundraising 30, clear use of funds 20, public/community benefit 20, operator credibility 10, recent updates 10, CloudFund integration fit 10.

Accessibility score measures readiness to onboard as a CloudFund project: clear project owner/contact 25, verifiable budget and measurable outcome 25, recurring or durable need 20, active public community 15, ability to publish funding updates 15.
- ready_now: score 70+ with a clear active fundraiser and credible project owner.
- nurture: score 40–69 or a strong project with one material verification gap.
- unlikely_now: below 40, no active fundraiser, one-off/short-term only, unclear use of funds, or no responsible contact.
- state_dependency describes whether approval depends on government procurement or public institutions.
- small_company_signal is positive when the operator can plausibly work directly with an early-stage funding platform; negative when institutional procurement or formal grant cycles dominate.

Fundraising fields:
- fundraising_platform is the named platform or "Direct".
- fundraising_model must be recurring_membership, long_running_campaign, open_ended_campaign, fixed_term_campaign, or unknown.
- fundraising_url must link directly to the live fundraiser.
- campaign_started_at must be YYYY-MM-DD only when a public date is verified; otherwise null.
- funding_goal_amount, amount_raised, and funding_currency must be copied from current public evidence; never estimate.
- fundraising_signal is one short factual sentence establishing why the fundraiser is active and durable.
- is_environmental must be true for any materially environmental project. Those records will be excluded.

Rules:
- Today is ${today}. Use current primary sources, the live fundraising page, official project pages, and recent project updates.
- Exclude any project domain already in the exclusion list.
- Do not invent campaign dates, funding totals, activity, locations, or contacts. Use null/unknown and add a verification gap.
- Audience size is useful but not mandatory for CloudFund. Never combine platforms.
- summary, why_fit, activity_signal, accessibility_summary, and fundraising_signal must each be one short factual sentence.
- location must be only "City/Region, Country" and country_code must be ISO alpha-2.
- Include 2–5 direct evidence links per candidate, including the fundraiser and official project page.
- Rank best-first and diversify categories, platforms, and geographies.
- Do not perform deep financial research or draft outreach during discovery.`
        : `You find new potential conservation partners for IdleForest using live web search.

Return exactly ${count} credible organizations when possible. Find official organization websites, not directories, articles, social profiles, or projects without their own organization.

Mandatory fit:
- Mission: reforestation, landscape restoration, animal conservation, animal rewilding, or conservation land acquisition.
- Audience: credible evidence that at least one individual platform has 4,000–500,000 followers or members. Never combine platforms. If a likely fit has no defensible current number, community_size must be null and the gap must be explicit.
- Activity: recent and regular public work, preferably within 90 days.
- Accessibility now: IdleForest is a small company and should have a realistic route to a pilot, donation, sponsorship, or project partnership without a large tender or institutional minimum.
- Prefer direct field operators, land owners/managers, and flexible mid-sized organizations over large state-dependent foundations, umbrella funds, or global institutions.

Discovery score (100): mission 30, qualifying audience signal 20, recent activity 15, direct delivery 10, accessibility for IdleForest now 25. This is a preliminary discovery score, not the final partner qualification score.

Accessibility score (100): evidence of small-company/startup partnerships 25, low minimum or pilot route 25, clear partnership owner/contact 20, low bureaucracy/fast decision path 15, ability to fund a named project directly 15.
- ready_now: score 70+ with a credible low-friction route.
- nurture: score 40–69 or some institutional friction but a possible route.
- unlikely_now: below 40, institutional-only, tender/procurement-led, high minimum, or heavily state-dependent with no flexible corporate route.
- state_dependency measures how much delivery/funding appears tied to governments, public tenders, or institutional programmes.
- small_company_signal is positive only with evidence of SME/startup/small-donor collaboration; negative with explicit large minimums or institutional-only routes; otherwise unknown.

Rules:
- Today is ${today}. Use recent primary sources and official profiles wherever possible.
- Exclude any organization whose domain appears in the exclusion list.
- Do not invent follower counts, activity, projects, or locations. Use null/unknown and add a verification gap.
- Do not assume a foundation is accessible merely because it accepts donations. Look for evidence of pilots, corporate partnerships, SME/startup work, selectable projects, published sponsorship routes, or low minimums.
- Deprioritize organizations that mainly work through governments, EU/UN programmes, formal procurement, or major corporations unless a separate flexible small-company route is publicly evidenced.
- Normally return only ready_now or nurture candidates. Include unlikely_now only when its strategic value is exceptional and clearly label the barrier.
- summary, why_fit, activity_signal, and accessibility_summary must each be one short factual sentence, never a paragraph.
- location must be only "City/Region, Country" and country_code must be ISO alpha-2.
- community_source_url must directly support the audience number; return an empty string when no number is defensible.
- Include 2–5 direct evidence links per candidate, including the official website.
- Rank candidates best-first and diversify organizations and geographies.
- Do not perform deep financial research or draft outreach during discovery.`

    const input = [
        focus
            ? `Search focus from the team: ${focus}`
            : researchTrack === 'cloudfund'
                ? 'Search focus: worldwide; diversify across Patreon-style recurring support and long-running GoFundMe-style campaigns in non-environmental categories.'
                : 'Search focus: worldwide; diversify across eligible conservation categories.',
        exclusionList.length ? `Already surfaced or in the pipeline — exclude these domains:\n${exclusionList.join('\n')}` : 'No organizations have been surfaced yet.',
    ].join('\n\n')
    const model = process.env.OPENAI_PARTNER_DISCOVERY_MODEL || 'gpt-5.6-luna'

    let openAIResponse: Response
    try {
        openAIResponse = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                instructions,
                input,
                tools: [{ type: 'web_search', search_context_size: 'high' }],
                reasoning: { effort: 'medium' },
                text: {
                    format: {
                        type: 'json_schema',
                        name: researchTrack === 'cloudfund' ? 'cloudfund_project_discovery' : 'idleforest_partner_discovery',
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

        const seen = new Set(excludedHosts)
        const candidates = parsed.candidates
            .map(candidate => cleanCandidate(candidate, researchTrack))
            .filter((candidate): candidate is PartnerDiscoveryCandidate => candidate !== null)
            .filter(candidate => {
                const key = normalizeResearchKey(candidate.url, researchTrack)
                if (!key || seen.has(key)) return false
                seen.add(key)
                return true
            })
            .sort((a, b) => b.discovery_score - a.discovery_score)
            .slice(0, count)

        let archiveSaved = true
        if (candidates.length > 0 && !discoveredError) {
            const { error: archiveError } = await admin
                .from('partner_discoveries')
                .upsert(candidates.map(candidate => candidateToRow(candidate, focus, researchTrack)), { onConflict: 'research_track,domain' })
            if (archiveError) {
                archiveSaved = false
                console.error('Could not archive partner discoveries:', archiveError)
            }
        } else if (isMissingDiscoveryTable(discoveredError)) {
            archiveSaved = false
        }

        return NextResponse.json({
            candidates,
            usage: getUsage(payload, model),
            archive_saved: archiveSaved,
        })
    } catch (error) {
        console.error('Could not parse partner discovery:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not parse the discovery shortlist.' }, { status: 500 })
    }
}
