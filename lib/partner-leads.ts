export type PartnerLeadStatus =
    | 'new'
    | 'qualified'
    | 'contacted'
    | 'follow_up'
    | 'partner'
    | 'rejected'

export type PartnerRecommendation = 'strong_fit' | 'potential_fit' | 'not_a_fit'
export type PartnerOrganizationType = 'ngo' | 'company' | 'foundation' | 'university' | 'government' | 'individual' | 'network' | 'other'
export type PartnerDeliveryModel = 'direct_operator' | 'land_owner_manager' | 'project_network' | 'grantmaker_funder' | 'research_education' | 'advocacy' | 'mixed' | 'unknown'
export type PartnerTeamType = 'paid_staff' | 'volunteer_led' | 'hybrid' | 'unknown'
export type PartnerCommunityBand = 'under_4k' | '4k_25k' | '25k_100k' | '100k_500k' | 'over_500k' | 'unknown'
export type PartnerRevenueBand = 'under_100k' | '100k_1m' | '1m_10m' | '10m_plus' | 'unknown'
export type PartnerFundingStatus = 'stable' | 'growing' | 'fundraising' | 'constrained' | 'unknown'
export type PartnerActivityStatus = 'active' | 'irregular' | 'inactive' | 'unknown'
export type PartnerAccessibilityTier = 'ready_now' | 'nurture' | 'unlikely_now' | 'unknown'
export type PartnerStateDependency = 'low' | 'medium' | 'high' | 'unknown'
export type PartnerSmallCompanySignal = 'positive' | 'negative' | 'unknown'
export type PartnerDiscoveryStatus = 'discovered' | 'researched' | 'dismissed'

export interface PartnerCommunity {
    platform: string
    handle: string
    followers: number | null
    url: string
    count_quality?: 'verified' | 'estimated' | 'unavailable'
    count_source_url?: string
    count_note?: string
    checked_at?: string
}

export interface PartnerContact {
    type: string
    value: string
    label: string
}

export interface PartnerSource {
    title: string
    url: string
}

export interface PartnerDiscoveryCandidate {
    url: string
    name: string
    summary: string
    location: string
    country_code: string
    category: string[]
    delivery_model: PartnerDeliveryModel
    discovery_score: number
    accessibility_score: number
    accessibility_tier: PartnerAccessibilityTier
    accessibility_summary: string
    state_dependency: PartnerStateDependency
    small_company_signal: PartnerSmallCompanySignal
    community_platform: string
    community_size: number | null
    community_source_url: string
    activity_status: PartnerActivityStatus
    activity_signal: string
    why_fit: string
    verification_gaps: string[]
    sources: PartnerSource[]
}

export interface PartnerDiscoveryRecord extends PartnerDiscoveryCandidate {
    id: string
    domain: string
    focus: string
    status: PartnerDiscoveryStatus
    first_discovered_at: string
    last_discovered_at: string
}

export interface PartnerDiscoveryUsage {
    model: string
    input_tokens: number
    cached_input_tokens: number
    output_tokens: number
    search_calls: number
    estimated_cost_usd: number | null
}

export interface PartnerLead {
    id: string
    url: string
    name: string
    logo_url: string | null
    score: number
    recommendation: PartnerRecommendation
    category: string[]
    summary: string
    structure: string
    organization_type: PartnerOrganizationType
    location: string
    country_code: string
    team_model: string
    team_type: PartnerTeamType
    operator_type: string
    delivery_model: PartnerDeliveryModel
    financial_model: string[]
    financial_situation: string
    annual_revenue_amount: number | null
    annual_revenue_currency: string | null
    annual_revenue_year: number | null
    revenue_band: PartnerRevenueBand
    funding_status: PartnerFundingStatus
    sponsors: string[]
    communities: PartnerCommunity[]
    community_max: number | null
    community_band: PartnerCommunityBand
    contacts: PartnerContact[]
    socials: PartnerContact[]
    activity_summary: string
    last_activity: string
    activity_status: PartnerActivityStatus
    accessibility_score: number | null
    accessibility_tier: PartnerAccessibilityTier
    accessibility_summary: string
    state_dependency: PartnerStateDependency
    small_company_signal: PartnerSmallCompanySignal
    fit_reasons: string[]
    risks: string[]
    outreach_angle: string
    outreach_subject: string
    outreach_message: string
    sources: PartnerSource[]
    confidence: number
    status: PartnerLeadStatus
    reminder_at: string | null
    last_contacted_at: string | null
    notes: string
    created_at: string
    updated_at: string
}

export interface PartnerAnalysis {
    url: string
    name: string
    logo_url: string | null
    score: number
    recommendation: PartnerRecommendation
    category: string[]
    summary: string
    structure: string
    organization_type: PartnerOrganizationType
    location: string
    country_code: string
    team_model: string
    team_type: PartnerTeamType
    operator_type: string
    delivery_model: PartnerDeliveryModel
    financial_model: string[]
    financial_situation: string
    annual_revenue_amount: number | null
    annual_revenue_currency: string | null
    annual_revenue_year: number | null
    revenue_band: PartnerRevenueBand
    funding_status: PartnerFundingStatus
    sponsors: string[]
    communities: PartnerCommunity[]
    community_max: number | null
    community_band: PartnerCommunityBand
    contacts: PartnerContact[]
    socials: PartnerContact[]
    activity_summary: string
    last_activity: string
    activity_status: PartnerActivityStatus
    accessibility_score: number | null
    accessibility_tier: PartnerAccessibilityTier
    accessibility_summary: string
    state_dependency: PartnerStateDependency
    small_company_signal: PartnerSmallCompanySignal
    fit_reasons: string[]
    risks: string[]
    outreach_angle: string
    outreach_subject: string
    outreach_message: string
    sources: PartnerSource[]
    confidence: number
}

export const PARTNER_STATUS_LABELS: Record<PartnerLeadStatus, string> = {
    new: 'New',
    qualified: 'Qualified',
    contacted: 'Contacted',
    follow_up: 'Follow up',
    partner: 'Partner',
    rejected: 'Rejected',
}

export const PARTNER_RECOMMENDATION_LABELS: Record<PartnerRecommendation, string> = {
    strong_fit: 'Strong fit',
    potential_fit: 'Potential fit',
    not_a_fit: 'Not a fit',
}
