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
