import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PartnerAnalysis, PartnerLead } from '@/lib/partner-leads'

export const maxDuration = 300

const ADMIN_SESSION_COOKIE = 'admin_session'
const MAX_URLS = 12

const nullableInteger = { type: ['integer', 'null'] }
const nullableNumber = { type: ['number', 'null'] }
const nullableString = { type: ['string', 'null'] }

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
        organization_type: { type: 'string', enum: ['ngo', 'company', 'foundation', 'university', 'government', 'individual', 'network', 'other'] },
        location: { type: 'string' },
        country_code: { type: 'string' },
        team_model: { type: 'string' },
        team_type: { type: 'string', enum: ['paid_staff', 'volunteer_led', 'hybrid', 'unknown'] },
        operator_type: { type: 'string' },
        delivery_model: { type: 'string', enum: ['direct_operator', 'land_owner_manager', 'project_network', 'grantmaker_funder', 'research_education', 'advocacy', 'mixed', 'unknown'] },
        financial_model: { type: 'array', items: { type: 'string' } },
        financial_situation: { type: 'string' },
        annual_revenue_amount: nullableNumber,
        annual_revenue_currency: nullableString,
        annual_revenue_year: nullableInteger,
        revenue_band: { type: 'string', enum: ['under_100k', '100k_1m', '1m_10m', '10m_plus', 'unknown'] },
        funding_status: { type: 'string', enum: ['stable', 'growing', 'fundraising', 'constrained', 'unknown'] },
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
                    count_quality: { type: 'string', enum: ['verified', 'estimated', 'unavailable'] },
                    count_source_url: { type: 'string' },
                    count_note: { type: 'string' },
                    checked_at: { type: 'string' },
                },
                required: [
                    'platform', 'handle', 'followers', 'url', 'count_quality',
                    'count_source_url', 'count_note', 'checked_at',
                ],
            },
        },
        community_max: nullableInteger,
        community_band: { type: 'string', enum: ['under_4k', '4k_25k', '25k_100k', '100k_500k', 'over_500k', 'unknown'] },
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
        activity_status: { type: 'string', enum: ['active', 'irregular', 'inactive', 'unknown'] },
        accessibility_score: nullableInteger,
        accessibility_tier: { type: 'string', enum: ['ready_now', 'nurture', 'unlikely_now', 'unknown'] },
        accessibility_summary: { type: 'string' },
        state_dependency: { type: 'string', enum: ['low', 'medium', 'high', 'unknown'] },
        small_company_signal: { type: 'string', enum: ['positive', 'negative', 'unknown'] },
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
        'structure', 'organization_type', 'location', 'country_code', 'team_model',
        'team_type', 'operator_type', 'delivery_model', 'financial_model',
        'financial_situation', 'annual_revenue_amount', 'annual_revenue_currency',
        'annual_revenue_year', 'revenue_band', 'funding_status', 'sponsors',
        'communities', 'community_max', 'community_band', 'contacts', 'socials',
        'activity_summary', 'last_activity', 'activity_status', 'accessibility_score',
        'accessibility_tier', 'accessibility_summary', 'state_dependency', 'small_company_signal',
        'fit_reasons', 'risks', 'outreach_angle',
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

function uniqueByUrl<T extends { url: string }>(items: T[]) {
    const seen = new Set<string>()
    return items.filter(item => {
        if (!item.url || seen.has(item.url)) return false
        seen.add(item.url)
        return true
    })
}

function compactText(value: string, maxLength: number) {
    const normalized = value.replace(/\s+/g, ' ').trim()
    if (normalized.length <= maxLength) return normalized
    const clipped = normalized.slice(0, maxLength)
    const lastSpace = clipped.lastIndexOf(' ')
    return `${clipped.slice(0, lastSpace > maxLength * 0.65 ? lastSpace : maxLength).trim()}…`
}

function getCommunityBand(maxFollowers: number | null): PartnerAnalysis['community_band'] {
    if (maxFollowers === null) return 'unknown'
    if (maxFollowers < 4_000) return 'under_4k'
    if (maxFollowers < 25_000) return '4k_25k'
    if (maxFollowers < 100_000) return '25k_100k'
    if (maxFollowers <= 500_000) return '100k_500k'
    return 'over_500k'
}

function getRevenueBand(amount: number | null): PartnerAnalysis['revenue_band'] {
    if (amount === null) return 'unknown'
    if (amount < 100_000) return 'under_100k'
    if (amount < 1_000_000) return '100k_1m'
    if (amount < 10_000_000) return '1m_10m'
    return '10m_plus'
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
    const communities = analysis.communities.filter(item => item.url && item.platform)
    const communityCounts = communities
        .map(item => item.followers)
        .filter((count): count is number => count !== null && Number.isFinite(count))
    const communityMax = communityCounts.length ? Math.max(...communityCounts) : null
    const annualRevenue = analysis.annual_revenue_amount !== null && Number.isFinite(analysis.annual_revenue_amount)
        ? Math.max(0, analysis.annual_revenue_amount)
        : null

    return {
        ...analysis,
        url: canonicalUrl,
        name: analysis.name.trim() || new URL(submittedUrl).hostname,
        logo_url: analysis.logo_url || null,
        score: Math.max(0, Math.min(100, Math.round(analysis.score))),
        summary: compactText(analysis.summary, 180),
        structure: compactText(analysis.structure, 60),
        location: compactText(analysis.location, 70),
        country_code: /^[A-Za-z]{2}$/.test(analysis.country_code) ? analysis.country_code.toUpperCase() : 'XX',
        team_model: compactText(analysis.team_model, 70),
        operator_type: compactText(analysis.operator_type, 60),
        financial_situation: compactText(analysis.financial_situation, 140),
        annual_revenue_amount: annualRevenue,
        annual_revenue_currency: analysis.annual_revenue_currency?.toUpperCase().slice(0, 3) || null,
        revenue_band: getRevenueBand(annualRevenue),
        communities,
        community_max: communityMax,
        community_band: getCommunityBand(communityMax),
        contacts: analysis.contacts.filter(item => item.value && item.type),
        socials: analysis.socials.filter(item => item.value),
        activity_summary: compactText(analysis.activity_summary, 150),
        accessibility_score: analysis.accessibility_score !== null && Number.isFinite(analysis.accessibility_score)
            ? Math.max(0, Math.min(100, Math.round(analysis.accessibility_score)))
            : null,
        accessibility_summary: compactText(analysis.accessibility_summary, 120),
        fit_reasons: analysis.fit_reasons.slice(0, 3).map(reason => compactText(reason, 100)),
        risks: analysis.risks.slice(0, 3).map(risk => compactText(risk, 100)),
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

Scoring rubric (100 points): mission/category 25, one qualifying community 20, recency/regularity 15, direct conservation delivery 10, financial/funding fit 5, public contactability 5, credibility/transparency 5, accessibility for IdleForest now 15. A strong_fit normally scores 75+, must satisfy mission and community requirements, and cannot be unlikely_now. Use potential_fit for credible but incomplete evidence or nurture prospects. Use not_a_fit when a mandatory requirement clearly fails.

Normalized fields:
- organization_type must be the single best enum value.
- delivery_model: direct_operator does field conservation; land_owner_manager acquires/manages conservation land; project_network coordinates implementers; grantmaker_funder finances projects; research_education produces research/training; advocacy campaigns; mixed only when two or more are material.
- team_type: paid_staff, volunteer_led, hybrid, or unknown.
- activity_status: active for credible public activity within 90 days and a regular pattern; irregular for sporadic recent activity; inactive for no meaningful activity in 12 months; otherwise unknown.
- annual_revenue_amount/currency/year must come from the latest public filing or annual report. Return null rather than estimating. Revenue and community bands must match the numeric values.
- funding_status: stable, growing, fundraising, constrained, or unknown, based only on explicit current evidence.
- accessibility_score measures whether a small company like IdleForest can realistically start a partnership now: small-company/startup partnership evidence 25, low minimum or pilot route 25, clear partnership contact 20, low bureaucracy/fast decision path 15, ability to fund a named project directly 15. Return null when public evidence is insufficient.
- accessibility_tier: ready_now for score 70+ with a credible low-friction route; nurture for 40–69 or moderate institutional friction; unlikely_now below 40 or when partnerships are institutional-only, tender/procurement-led, require large minimums, or depend heavily on state programmes without a flexible corporate route; otherwise unknown.
- state_dependency: high when funding/delivery is dominated by governments, public tenders, EU/UN programmes, or state agreements; medium when material but not exclusive; low when independent corporate/donor/project routes are clear; otherwise unknown.
- small_company_signal: positive only with evidence of SME/startup/small-donor collaboration; negative with explicit high minimums or institutional-only routes; otherwise unknown.

Rules:
- Today is ${today}. Prefer recent primary sources, official profiles, current reports, registries, and reputable reporting.
- Do not guess unsupported organizational or financial facts. Use "Unknown — not publicly verified" and add the gap to risks.
- Do not assume a foundation is accessible merely because it accepts donations. Look for pilots, corporate partnerships, SME/startup examples, selectable projects, public sponsorship routes, decision-maker contacts, minimum commitments, procurement requirements, and institutional dependencies.
- This is a metrics extraction and scoring task, not a report. Summary must be one plain-language sentence of at most 160 characters. Location must be only "City/Region, Country"; country_code must be ISO alpha-2; structure, operator_type, team_model, financial_situation, activity_summary, accessibility_summary, fit reasons, and risks must each be terse labels or short facts, never paragraphs.
- Return at most three fit reasons and three risks, each under 100 characters. Evidence belongs in sources, not narrative fields.
- Research Instagram, YouTube, and Facebook audience sizes explicitly for every organization that has those profiles. Run focused searches for each platform and inspect the official profile plus current indexed results.
- Record each platform separately. Never combine audiences. Convert displayed values such as 4.2K or 18.7K to integers such as 4200 or 18700.
- Set count_quality to verified when the count comes from the official platform/profile or an official organization statement. Set it to estimated when a recent search result, reputable social analytics listing, or other public source provides an approximate count; still return the rounded integer and the evidence URL. Use unavailable/null only after focused searches fail to produce a defensible current number.
- For YouTube use subscribers, for Instagram use followers, and for Facebook prefer followers (page likes only when followers are unavailable, and explain that in count_note). Never substitute post likes, video views, or engagement totals for community size.
- Set checked_at to ${today}. Make count_note a short plain-language evidence note and count_source_url the page that supports the number.
- Financial situation must distinguish verified facts from reasonable inference.
- Contacts must be public organization/professional channels only; never infer private addresses.
- Source links must directly support the record and should include the official website plus the best evidence for community, activity, finances, and partnership accessibility.
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
                tools: [{ type: 'web_search', search_context_size: 'high' }],
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

        const researchedDomains = analyses.map(analysis => normalizeHost(analysis.url)).filter(Boolean)
        if (researchedDomains.length > 0) {
            const { error: discoveryUpdateError } = await admin
                .from('partner_discoveries')
                .update({ status: 'researched' })
                .in('domain', researchedDomains)
            if (discoveryUpdateError && !['42P01', 'PGRST205'].includes(discoveryUpdateError.code)) {
                console.error('Could not update partner discovery status:', discoveryUpdateError)
            }
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
        if (databaseError.code === 'PGRST204' && databaseError.message?.includes('accessibility_')) {
            return NextResponse.json(
                { error: 'Partner accessibility fields are not initialized yet. Apply the 20260720 accessibility migration, then try again.' },
                { status: 503 }
            )
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : databaseError.message || 'Could not save the AI analysis.' },
            { status: 500 }
        )
    }
}
