export type PartnerLeadStatus =
    | 'new'
    | 'qualified'
    | 'contacted'
    | 'follow_up'
    | 'partner'
    | 'rejected'

export type PartnerRecommendation = 'strong_fit' | 'potential_fit' | 'not_a_fit'

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
    location: string
    team_model: string
    operator_type: string
    financial_model: string[]
    financial_situation: string
    sponsors: string[]
    communities: PartnerCommunity[]
    contacts: PartnerContact[]
    socials: PartnerContact[]
    activity_summary: string
    last_activity: string
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
    location: string
    team_model: string
    operator_type: string
    financial_model: string[]
    financial_situation: string
    sponsors: string[]
    communities: PartnerCommunity[]
    contacts: PartnerContact[]
    socials: PartnerContact[]
    activity_summary: string
    last_activity: string
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
