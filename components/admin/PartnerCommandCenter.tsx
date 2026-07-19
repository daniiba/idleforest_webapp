'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    AlertTriangle,
    Archive,
    ArrowUpRight,
    Bell,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Compass,
    Copy,
    ExternalLink,
    Globe2,
    Loader2,
    Mail,
    MapPin,
    Plus,
    RefreshCw,
    Search,
    Send,
    ShieldCheck,
    Sparkles,
    Target,
    Users,
    X,
} from 'lucide-react'
import {
    PARTNER_RECOMMENDATION_LABELS,
    PARTNER_STATUS_LABELS,
    type PartnerAccessibilityTier,
    type PartnerCommunityBand,
    type PartnerDiscoveryCandidate,
    type PartnerDiscoveryRecord,
    type PartnerDiscoveryUsage,
    type PartnerDeliveryModel,
    type PartnerLead,
    type PartnerLeadStatus,
    type PartnerRevenueBand,
} from '@/lib/partner-leads'
import { getPartnerLeads, updatePartnerLead } from '@/app/(dashboard)/admin/partners/actions'

const statusOptions = Object.entries(PARTNER_STATUS_LABELS) as [PartnerLeadStatus, string][]

const statusStyles: Record<PartnerLeadStatus, string> = {
    new: 'bg-white text-black',
    qualified: 'bg-brand-yellow text-black',
    contacted: 'bg-blue-100 text-blue-900',
    follow_up: 'bg-amber-100 text-amber-900',
    partner: 'bg-green-100 text-green-900',
    rejected: 'bg-neutral-200 text-neutral-600',
}

const recommendationStyles = {
    strong_fit: 'bg-green-100 text-green-900 border-green-700',
    potential_fit: 'bg-amber-100 text-amber-900 border-amber-700',
    not_a_fit: 'bg-red-100 text-red-900 border-red-700',
}

const deliveryLabels: Record<PartnerDeliveryModel, string> = {
    direct_operator: 'Direct operator',
    land_owner_manager: 'Land owner/manager',
    project_network: 'Project network',
    grantmaker_funder: 'Funder',
    research_education: 'Research/education',
    advocacy: 'Advocacy',
    mixed: 'Mixed',
    unknown: 'Unknown',
}

const communityBandLabels: Record<PartnerCommunityBand, string> = {
    under_4k: 'Under 4K',
    '4k_25k': '4K–25K',
    '25k_100k': '25K–100K',
    '100k_500k': '100K–500K',
    over_500k: 'Over 500K',
    unknown: 'Unknown audience',
}

const revenueBandLabels: Record<PartnerRevenueBand, string> = {
    under_100k: 'Under 100K',
    '100k_1m': '100K–1M',
    '1m_10m': '1M–10M',
    '10m_plus': '10M+',
    unknown: 'Unknown revenue',
}

const accessibilityTierLabels: Record<PartnerAccessibilityTier, string> = {
    ready_now: 'Ready now',
    nurture: 'Nurture',
    unlikely_now: 'Unlikely now',
    unknown: 'Unknown access',
}

function formatFollowerCount(value: number | null, quality?: 'verified' | 'estimated' | 'unavailable') {
    if (value === null) return 'No count found'
    const formatted = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    return quality === 'estimated' ? `≈${formatted}` : formatted
}

function formatDate(value: string | null) {
    if (!value) return 'Not set'
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function formatRevenue(lead: PartnerLead) {
    if (lead.annual_revenue_amount === null || lead.annual_revenue_amount === undefined) return 'Unknown'
    const amount = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(lead.annual_revenue_amount)
    return `${lead.annual_revenue_currency || ''} ${amount}`.trim()
}

function humanize(value: string | null | undefined) {
    if (!value) return 'Unknown'
    return value.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

function getCommunityMax(lead: PartnerLead) {
    if (lead.community_max !== null && lead.community_max !== undefined) return lead.community_max
    const counts = lead.communities.map(community => community.followers).filter((value): value is number => value !== null)
    return counts.length ? Math.max(...counts) : null
}

function getCommunityBandFromValue(value: number | null): PartnerCommunityBand {
    if (value === null) return 'unknown'
    if (value < 4_000) return 'under_4k'
    if (value < 25_000) return '4k_25k'
    if (value < 100_000) return '25k_100k'
    if (value <= 500_000) return '100k_500k'
    return 'over_500k'
}

function formatAccessibility(lead: PartnerLead) {
    const tier = accessibilityTierLabels[lead.accessibility_tier || 'unknown']
    return lead.accessibility_score === null || lead.accessibility_score === undefined
        ? tier
        : `${lead.accessibility_score}/100 · ${tier}`
}

function getEmail(lead: PartnerLead) {
    return lead.contacts.find(contact => contact.type.toLowerCase() === 'email' || contact.value.includes('@'))?.value
}

function getContactHref(type: string, value: string) {
    if (type.toLowerCase() === 'email' || value.includes('@')) return `mailto:${value}`
    if (type.toLowerCase() === 'phone') return `tel:${value}`
    return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function isReminderDue(value: string | null) {
    return Boolean(value && new Date(value).getTime() <= Date.now())
}

function friendlyError(error: unknown, fallback: string) {
    const message = error instanceof Error ? error.message : fallback
    if (message.includes('partner_leads') && message.includes('does not exist')) {
        return 'Partner storage is not initialized yet. Apply the 20260718 partner leads migration, then refresh this tab.'
    }
    if (message.includes('accessibility_score') || message.includes('accessibility_tier')) {
        return 'Partner accessibility fields are not initialized yet. Apply the 20260720 accessibility migration, then refresh this tab.'
    }
    return message
}

function getNextBestAction(lead: PartnerLead) {
    if (lead.status === 'partner') return 'Keep the relationship warm and record the next joint opportunity.'
    if (lead.status === 'contacted' || lead.status === 'follow_up') return 'Follow up with the strongest project-specific reason to collaborate.'
    if (lead.recommendation === 'strong_fit') return 'Send the tailored introduction and schedule a 7-day follow-up.'
    if (lead.recommendation === 'potential_fit') return 'Verify the remaining audience or funding gap before outreach.'
    return 'Reject this lead unless there is a strategic reason to keep monitoring it.'
}

function compactText(value: string, maxLength = 96) {
    const normalized = value.replace(/\s+/g, ' ').trim()
    if (normalized.length <= maxLength) return normalized
    const shortened = normalized.slice(0, maxLength)
    const lastSpace = shortened.lastIndexOf(' ')
    return `${shortened.slice(0, lastSpace > 60 ? lastSpace : maxLength).trim()}…`
}

function discoveryDomain(url: string) {
    try {
        return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, '')
    } catch {
        return url.toLowerCase()
    }
}

function mergeDiscoveryCandidates(current: PartnerDiscoveryCandidate[], incoming: PartnerDiscoveryCandidate[]) {
    const seen = new Set<string>()
    return [...current, ...incoming].filter(candidate => {
        const domain = discoveryDomain(candidate.url)
        if (seen.has(domain)) return false
        seen.add(domain)
        return true
    })
}

function formatDiscoveryCost(value: number) {
    return value < 0.01 ? '<$0.01' : `$${value.toFixed(2)}`
}

export default function PartnerCommandCenter() {
    const [leads, setLeads] = useState<PartnerLead[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [inputMode, setInputMode] = useState<'discover' | 'urls'>('discover')
    const [urlInput, setUrlInput] = useState('')
    const [discoveryFocus, setDiscoveryFocus] = useState('')
    const [discoveryCandidates, setDiscoveryCandidates] = useState<PartnerDiscoveryCandidate[]>([])
    const [discoveryUsage, setDiscoveryUsage] = useState<PartnerDiscoveryUsage | null>(null)
    const [discoverySessionCost, setDiscoverySessionCost] = useState(0)
    const [archiveCandidates, setArchiveCandidates] = useState<PartnerDiscoveryRecord[]>([])
    const [isArchiveOpen, setIsArchiveOpen] = useState(false)
    const [isArchiveLoaded, setIsArchiveLoaded] = useState(false)
    const [isLoadingArchive, setIsLoadingArchive] = useState(false)
    const [archiveSearch, setArchiveSearch] = useState('')
    const [archiveAccessibility, setArchiveAccessibility] = useState<'all' | PartnerAccessibilityTier>('all')
    const [archiveDelivery, setArchiveDelivery] = useState<'all' | PartnerDeliveryModel>('all')
    const [archiveCommunity, setArchiveCommunity] = useState<'all' | PartnerCommunityBand>('all')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | PartnerLeadStatus>('all')
    const [deliveryFilter, setDeliveryFilter] = useState<'all' | PartnerDeliveryModel>('all')
    const [communityFilter, setCommunityFilter] = useState<'all' | PartnerCommunityBand>('all')
    const [revenueFilter, setRevenueFilter] = useState<'all' | PartnerRevenueBand>('all')
    const [accessibilityFilter, setAccessibilityFilter] = useState<'all' | PartnerAccessibilityTier>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isDiscovering, setIsDiscovering] = useState(false)
    const [researchingCandidateUrl, setResearchingCandidateUrl] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const loadLeads = async () => {
        setIsLoading(true)
        setError('')
        try {
            const result = await getPartnerLeads()
            const data = result.leads
            setLeads(data)
            setSelectedId(current => current && data.some(lead => lead.id === current) ? current : data[0]?.id || null)
            if (result.setupRequired) {
                setError('Partner storage is not initialized yet. Apply the 20260718 partner leads migration, then refresh this tab.')
            }
        } catch (loadError) {
            setError(friendlyError(loadError, 'Could not load partner leads.'))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadLeads()
    }, [])

    const selected = leads.find(lead => lead.id === selectedId) || null
    const isSelectedExpanded = Boolean(selected && expandedLeadId === selected.id)

    const filteredLeads = useMemo(() => {
        const query = search.trim().toLowerCase()
        return leads.filter(lead => {
            const statusMatches = statusFilter === 'all' || lead.status === statusFilter
            const deliveryMatches = deliveryFilter === 'all' || (lead.delivery_model || 'unknown') === deliveryFilter
            const communityMatches = communityFilter === 'all' || (lead.community_band || 'unknown') === communityFilter
            const revenueMatches = revenueFilter === 'all' || (lead.revenue_band || 'unknown') === revenueFilter
            const accessibilityMatches = accessibilityFilter === 'all' || (lead.accessibility_tier || 'unknown') === accessibilityFilter
            const searchMatches = !query || [lead.name, lead.url, lead.location, lead.country_code, lead.organization_type, ...lead.category]
                .join(' ')
                .toLowerCase()
                .includes(query)
            return statusMatches && deliveryMatches && communityMatches && revenueMatches && accessibilityMatches && searchMatches
        })
    }, [leads, search, statusFilter, deliveryFilter, communityFilter, revenueFilter, accessibilityFilter])

    const stats = useMemo(() => ({
        pipeline: leads.filter(lead => !['rejected', 'partner'].includes(lead.status)).length,
        strong: leads.filter(lead => lead.recommendation === 'strong_fit' && lead.status !== 'rejected').length,
        contacted: leads.filter(lead => ['contacted', 'follow_up', 'partner'].includes(lead.status)).length,
        due: leads.filter(lead => lead.status !== 'rejected' && isReminderDue(lead.reminder_at)).length,
    }), [leads])

    const filteredArchive = useMemo(() => {
        const query = archiveSearch.trim().toLowerCase()
        return archiveCandidates.filter(candidate => {
            const accessibilityMatches = archiveAccessibility === 'all' || candidate.accessibility_tier === archiveAccessibility
            const deliveryMatches = archiveDelivery === 'all' || candidate.delivery_model === archiveDelivery
            const communityMatches = archiveCommunity === 'all' || getCommunityBandFromValue(candidate.community_size) === archiveCommunity
            const searchMatches = !query || [candidate.name, candidate.url, candidate.location, candidate.delivery_model, ...candidate.category]
                .join(' ')
                .toLowerCase()
                .includes(query)
            return accessibilityMatches && deliveryMatches && communityMatches && searchMatches
        })
    }, [archiveCandidates, archiveSearch, archiveAccessibility, archiveDelivery, archiveCommunity])

    const patchLead = async (
        id: string,
        input: Parameters<typeof updatePartnerLead>[1],
        successMessage?: string
    ) => {
        setUpdatingId(id)
        setError('')
        try {
            const updated = await updatePartnerLead(id, input)
            setLeads(current => current.map(lead => lead.id === id ? updated : lead))
            if (successMessage) {
                setNotice(successMessage)
                window.setTimeout(() => setNotice(''), 2500)
            }
        } catch (updateError) {
            setError(friendlyError(updateError, 'Could not update partner.'))
        } finally {
            setUpdatingId(null)
        }
    }

    const researchUrls = async (urls: string[], clearInput = false) => {
        if (!urls.length) {
            setError('Add at least one organization URL.')
            return false
        }

        if (urls.length > 12) {
            setError('Research up to 12 URLs at a time.')
            return false
        }

        setIsAnalyzing(true)
        setError('')
        setNotice('')
        try {
            const response = await fetch('/api/admin/partners/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls }),
            })
            const result = await response.json() as { partners?: PartnerLead[]; error?: string }
            if (!response.ok || !result.partners) throw new Error(result.error || 'Partner research failed.')

            setLeads(current => {
                const incomingIds = new Set(result.partners!.map(lead => lead.id))
                return [...result.partners!, ...current.filter(lead => !incomingIds.has(lead.id))]
            })
            setSelectedId(result.partners[0]?.id || null)
            if (clearInput) setUrlInput('')
            setNotice(`${result.partners.length} partner${result.partners.length === 1 ? '' : 's'} researched and saved.`)
            return true
        } catch (analysisError) {
            setError(friendlyError(analysisError, 'Partner research failed.'))
            return false
        } finally {
            setIsAnalyzing(false)
        }
    }

    const analyzeUrls = () => {
        const urls = urlInput
            .split(/[\n,]/)
            .map(value => value.trim())
            .filter(Boolean)
        void researchUrls(urls, true)
    }

    const loadDiscoveryArchive = async (force = false) => {
        if ((!force && isArchiveLoaded) || isLoadingArchive) return
        setIsLoadingArchive(true)
        setError('')
        try {
            const response = await fetch('/api/admin/partners/discover?limit=300')
            const result = await response.json() as { candidates?: PartnerDiscoveryRecord[]; setup_required?: boolean; error?: string }
            if (!response.ok || !result.candidates) throw new Error(result.error || 'Could not load the discovery archive.')
            setArchiveCandidates(result.candidates)
            setIsArchiveLoaded(true)
            if (result.setup_required) {
                setError('The discovery archive is not initialized yet. Apply the 20260720 accessibility migration, then refresh this tab.')
            }
        } catch (archiveError) {
            setError(friendlyError(archiveError, 'Could not load the discovery archive.'))
        } finally {
            setIsLoadingArchive(false)
        }
    }

    const toggleDiscoveryArchive = () => {
        const opening = !isArchiveOpen
        setIsArchiveOpen(opening)
        if (opening) void loadDiscoveryArchive()
    }

    const markDiscoveryStatus = async (url: string, status: 'researched' | 'dismissed') => {
        setArchiveCandidates(current => current.map(candidate => candidate.domain === discoveryDomain(url) ? { ...candidate, status } : candidate))
        try {
            await fetch('/api/admin/partners/discover', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, status }),
            })
        } catch {
            // The researched lead is already saved; archive status is only supporting metadata.
        }
    }

    const discoverPartners = async (append = false) => {
        setIsDiscovering(true)
        setError('')
        setNotice('')
        try {
            const response = await fetch('/api/admin/partners/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    focus: discoveryFocus,
                    count: 6,
                    exclude_urls: discoveryCandidates.map(candidate => candidate.url),
                }),
            })
            const result = await response.json() as {
                candidates?: PartnerDiscoveryCandidate[]
                usage?: PartnerDiscoveryUsage
                archive_saved?: boolean
                error?: string
            }
            if (!response.ok || !result.candidates) throw new Error(result.error || 'Partner discovery failed.')

            setDiscoveryCandidates(current => append ? mergeDiscoveryCandidates(current, result.candidates!) : result.candidates!)
            if (result.usage) {
                setDiscoveryUsage(result.usage)
                if (result.usage.estimated_cost_usd !== null) {
                    setDiscoverySessionCost(current => current + result.usage!.estimated_cost_usd!)
                }
            }
            setIsArchiveLoaded(false)
            if (isArchiveOpen) void loadDiscoveryArchive(true)
            setNotice(result.candidates.length
                ? `${result.candidates.length} new potential partners found and ${result.archive_saved === false ? 'shown, but not archived — apply the latest migration' : 'saved to the discovery archive'}.`
                : 'No new partners met the discovery threshold. Try a more specific region or category.')
        } catch (discoveryError) {
            setError(friendlyError(discoveryError, 'Partner discovery failed.'))
        } finally {
            setIsDiscovering(false)
        }
    }

    const researchCandidate = async (candidate: PartnerDiscoveryCandidate) => {
        setResearchingCandidateUrl(candidate.url)
        try {
            const saved = await researchUrls([candidate.url])
            if (saved) {
                void markDiscoveryStatus(candidate.url, 'researched')
                setDiscoveryCandidates(current => current.filter(item => item.url !== candidate.url))
            }
        } finally {
            setResearchingCandidateUrl(null)
        }
    }

    const researchTopCandidates = async () => {
        const urls = discoveryCandidates.slice(0, 3).map(candidate => candidate.url)
        if (!urls.length) return
        setResearchingCandidateUrl('batch')
        try {
            const saved = await researchUrls(urls)
            if (saved) {
                urls.forEach(url => void markDiscoveryStatus(url, 'researched'))
                const researched = new Set(urls)
                setDiscoveryCandidates(current => current.filter(item => !researched.has(item.url)))
            }
        } finally {
            setResearchingCandidateUrl(null)
        }
    }

    const reachOut = (lead: PartnerLead) => {
        const email = getEmail(lead)
        if (email) {
            window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(lead.outreach_subject)}&body=${encodeURIComponent(lead.outreach_message)}`
            return
        }

        const contactUrl = lead.contacts.find(contact => /^https?:\/\//i.test(contact.value))?.value || lead.url
        window.open(contactUrl, '_blank', 'noopener,noreferrer')
        setNotice('No public email was found. Opened the best available contact page.')
    }

    const copyDraft = async (lead: PartnerLead) => {
        await navigator.clipboard.writeText(`Subject: ${lead.outreach_subject}\n\n${lead.outreach_message}`)
        setNotice('Outreach draft copied.')
        window.setTimeout(() => setNotice(''), 2500)
    }

    const setQuickReminder = (lead: PartnerLead, days: number) => {
        const reminder = new Date()
        reminder.setDate(reminder.getDate() + days)
        reminder.setHours(9, 0, 0, 0)
        void patchLead(lead.id, { status: 'follow_up', reminder_at: reminder.toISOString() }, `Reminder set for ${formatDate(reminder.toISOString())}.`)
    }

    return (
        <div className="space-y-5 text-black">
            <section className="bg-brand-navy text-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(224,241,70,1)] p-5 md:p-7 overflow-hidden relative">
                <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border-[28px] border-brand-yellow/20" />
                <div className="relative grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-end">
                    <div>
                        <div className="flex items-center gap-2 text-brand-yellow text-xs font-black uppercase tracking-[0.18em] mb-3">
                            <Sparkles className="h-4 w-4" /> AI partner research
                        </div>
                        <h2 className="font-candu text-3xl md:text-4xl font-extrabold uppercase leading-none">Partner command center</h2>
                        <p className="mt-3 max-w-xl text-sm text-white/70">Qualify conservation organizations, capture the evidence, and move each relationship from research to follow-up.</p>
                    </div>
                    <div className="bg-white text-black border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(224,241,70,1)]">
                        <div className="mb-3 grid grid-cols-2 border-2 border-black bg-neutral-100 p-0.5">
                            <button
                                type="button"
                                onClick={() => setInputMode('discover')}
                                aria-pressed={inputMode === 'discover'}
                                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase ${inputMode === 'discover' ? 'bg-brand-yellow' : 'bg-transparent hover:bg-white'}`}
                            >
                                <Compass className="h-4 w-4" /> Find for me
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputMode('urls')}
                                aria-pressed={inputMode === 'urls'}
                                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-black uppercase ${inputMode === 'urls' ? 'bg-white' : 'bg-transparent hover:bg-white'}`}
                            >
                                <Plus className="h-4 w-4" /> Add URLs
                            </button>
                        </div>

                        {inputMode === 'discover' ? (
                            <div>
                                <label htmlFor="partner-discovery-focus" className="mb-2 block text-[11px] font-black uppercase tracking-wider">Optional search focus</label>
                                <input
                                    id="partner-discovery-focus"
                                    value={discoveryFocus}
                                    onChange={event => setDiscoveryFocus(event.target.value)}
                                    onKeyDown={event => { if (event.key === 'Enter' && !isDiscovering && !isAnalyzing) void discoverPartners(discoveryCandidates.length > 0) }}
                                    placeholder="e.g. Iberia · animal rewilding · direct operators"
                                    className="w-full border-2 border-black bg-neutral-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <span className="block text-[11px] leading-tight text-neutral-500">6 per batch · usually $0.10–$0.35 · saved automatically</span>
                                        <button type="button" onClick={toggleDiscoveryArchive} className="inline-flex items-center gap-1 text-[11px] font-black text-blue-700 hover:underline">
                                            <Archive className="h-3 w-3" /> {isArchiveOpen ? 'Hide archive' : 'Browse archive'}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void discoverPartners(discoveryCandidates.length > 0)}
                                        disabled={isDiscovering || isAnalyzing}
                                        className="inline-flex min-w-36 items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#000] disabled:opacity-60"
                                    >
                                        {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
                                        {isDiscovering ? 'Searching…' : discoveryCandidates.length > 0 ? 'Find 6 more' : 'Find partners'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="partner-urls" className="mb-2 block text-[11px] font-black uppercase tracking-wider">Organization URLs · one per line</label>
                                <textarea
                                    id="partner-urls"
                                    value={urlInput}
                                    onChange={event => setUrlInput(event.target.value)}
                                    placeholder={'mossy.earth\nrewilding-europe.com'}
                                    rows={3}
                                    className="w-full resize-none border-2 border-black bg-neutral-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="text-[11px] text-neutral-500">Up to 12 sites per research run</span>
                                    <button
                                        type="button"
                                        onClick={analyzeUrls}
                                        disabled={isAnalyzing || isDiscovering}
                                        className="inline-flex min-w-36 items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#000] disabled:opacity-60"
                                    >
                                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        {isAnalyzing ? 'Researching…' : 'Analyze'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {(error || notice) && (
                <div className={`flex items-start gap-3 border-2 border-black px-4 py-3 text-sm font-semibold ${error ? 'bg-red-100' : 'bg-green-100'}`}>
                    {error ? <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />}
                    <span>{error || notice}</span>
                    <button type="button" onClick={() => { setError(''); setNotice('') }} className="ml-auto" aria-label="Dismiss"><X className="h-4 w-4" /></button>
                </div>
            )}

            {discoveryCandidates.length > 0 && (
                <section className="border-2 border-black bg-[#f5f7ec] p-4 shadow-[4px_4px_0_#000] md:p-5">
                    <div className="flex flex-col gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-neutral-500"><Compass className="h-4 w-4" /> AI shortlist</div>
                            <h3 className="mt-1 font-candu text-2xl font-extrabold uppercase">New potential partners · {discoveryCandidates.length}</h3>
                            <p className="mt-1 text-xs text-neutral-600">Preliminary signals only. Everything here is already saved; full metrics are fetched when you add a candidate.</p>
                            {discoveryUsage && (
                                <p className="mt-1 text-[11px] font-bold text-neutral-500">
                                    Last batch {discoveryUsage.estimated_cost_usd === null ? 'cost unavailable' : `≈${formatDiscoveryCost(discoveryUsage.estimated_cost_usd)}`}
                                    {' · '}{discoveryUsage.search_calls} searches
                                    {discoverySessionCost > 0 && ` · session ≈${formatDiscoveryCost(discoverySessionCost)}`}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setDiscoveryCandidates([])}
                                className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-neutral-100"
                            >
                                Clear view
                            </button>
                            <button
                                type="button"
                                onClick={() => void discoverPartners(true)}
                                disabled={isDiscovering || isAnalyzing}
                                className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase hover:bg-neutral-100 disabled:opacity-50"
                            >
                                {isDiscovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
                                Find 6 more
                            </button>
                            <button
                                type="button"
                                onClick={() => void researchTopCandidates()}
                                disabled={isAnalyzing || researchingCandidateUrl !== null}
                                className="inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#000] disabled:opacity-50"
                            >
                                {researchingCandidateUrl === 'batch' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Research top {Math.min(3, discoveryCandidates.length)}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {discoveryCandidates.map(candidate => (
                            <article key={candidate.url} className="flex min-w-0 flex-col border-2 border-black bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-black">{candidate.name}</p>
                                        <p className="mt-0.5 truncate text-xs text-neutral-500">{candidate.location}</p>
                                    </div>
                                    <span className="flex-none border-2 border-black bg-green-100 px-2 py-1 text-xs font-black">{candidate.discovery_score}/100</span>
                                </div>

                                <p className="mt-3 text-sm leading-snug text-neutral-700">{compactText(candidate.summary, 150)}</p>

                                <div className="mt-3 grid grid-cols-3 border-2 border-black bg-neutral-50">
                                    <div className="border-r-2 border-black p-2.5">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500">Audience signal</p>
                                        <p className="mt-1 text-xs font-black">
                                            {candidate.community_size !== null ? `${formatFollowerCount(candidate.community_size, 'estimated')} · ${candidate.community_platform}` : 'Needs verification'}
                                        </p>
                                    </div>
                                    <div className="border-r-2 border-black p-2.5">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500">Activity</p>
                                        <p className="mt-1 text-xs font-black">{humanize(candidate.activity_status)}</p>
                                    </div>
                                    <div className="p-2.5">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-500">Access now</p>
                                        <p className="mt-1 text-xs font-black">{candidate.accessibility_score}/100</p>
                                        <p className="mt-0.5 text-[9px] font-bold text-neutral-500">{accessibilityTierLabels[candidate.accessibility_tier]}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {candidate.category.slice(0, 2).map(category => <span key={category} className="bg-neutral-100 px-2 py-1 text-[10px] font-bold">{category}</span>)}
                                    <span className="bg-neutral-100 px-2 py-1 text-[10px] font-bold">{deliveryLabels[candidate.delivery_model]}</span>
                                </div>

                                {candidate.verification_gaps.length > 0 && (
                                    <p className="mt-3 truncate text-[11px] text-amber-800" title={candidate.verification_gaps.join(' · ')}>
                                        <span className="font-black">Verify:</span> {candidate.verification_gaps.join(' · ')}
                                    </p>
                                )}

                                <details className="mt-3 border-t border-neutral-200 pt-2 text-xs text-neutral-600">
                                    <summary className="cursor-pointer font-black uppercase text-neutral-500 hover:text-black">Why it surfaced</summary>
                                    <p className="mt-2 leading-relaxed">{candidate.why_fit}</p>
                                    <p className="mt-1 leading-relaxed"><span className="font-black">Activity:</span> {candidate.activity_signal}</p>
                                    <p className="mt-1 leading-relaxed"><span className="font-black">Accessibility:</span> {candidate.accessibility_summary}</p>
                                    <p className="mt-1 leading-relaxed"><span className="font-black">State dependency:</span> {humanize(candidate.state_dependency)} · <span className="font-black">Small-company evidence:</span> {humanize(candidate.small_company_signal)}</p>
                                    {candidate.sources.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                            {candidate.sources.slice(0, 3).map(source => (
                                                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="font-bold text-blue-700 hover:underline">{compactText(source.title, 34)}</a>
                                            ))}
                                        </div>
                                    )}
                                </details>

                                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                                    <a href={candidate.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                                        Visit site <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => void researchCandidate(candidate)}
                                        disabled={isAnalyzing || researchingCandidateUrl !== null}
                                        className="inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-3 py-2 text-[11px] font-black uppercase disabled:opacity-50"
                                    >
                                        {researchingCandidateUrl === candidate.url ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                        Research & add
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {isArchiveOpen && (
                <section className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] md:p-5">
                    <div className="flex flex-col gap-3 border-b-2 border-black pb-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-neutral-500"><Archive className="h-4 w-4" /> Saved discoveries</div>
                            <h3 className="mt-1 font-candu text-2xl font-extrabold uppercase">Discovery archive · {archiveCandidates.length}</h3>
                            <p className="mt-1 text-xs text-neutral-600">Candidates stay here even when you do not add them to the outreach pipeline.</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_150px_170px_150px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    value={archiveSearch}
                                    onChange={event => setArchiveSearch(event.target.value)}
                                    placeholder="Search saved discoveries"
                                    className="w-full border-2 border-black bg-neutral-50 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                />
                            </div>
                            <select
                                value={archiveAccessibility}
                                onChange={event => setArchiveAccessibility(event.target.value as 'all' | PartnerAccessibilityTier)}
                                className="border-2 border-black bg-white px-2 py-2 text-xs font-bold"
                            >
                                <option value="all">All accessibility</option>
                                {Object.entries(accessibilityTierLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <select value={archiveDelivery} onChange={event => setArchiveDelivery(event.target.value as 'all' | PartnerDeliveryModel)} className="border-2 border-black bg-white px-2 py-2 text-xs font-bold">
                                <option value="all">All delivery models</option>
                                {Object.entries(deliveryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <select value={archiveCommunity} onChange={event => setArchiveCommunity(event.target.value as 'all' | PartnerCommunityBand)} className="border-2 border-black bg-white px-2 py-2 text-xs font-bold">
                                <option value="all">All audiences</option>
                                {Object.entries(communityBandLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </div>
                    </div>

                    {isLoadingArchive ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm font-bold text-neutral-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved discoveries…</div>
                    ) : filteredArchive.length === 0 ? (
                        <p className="py-10 text-center text-sm text-neutral-500">No saved discoveries match these filters yet.</p>
                    ) : (
                        <div className="mt-4 grid gap-2 lg:grid-cols-2">
                            {filteredArchive.map(candidate => (
                                <article key={candidate.id} className="flex min-w-0 items-start gap-3 border-2 border-black bg-neutral-50 p-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <a href={candidate.url} target="_blank" rel="noreferrer" className="truncate font-black hover:underline">{candidate.name}</a>
                                            <span className="bg-white px-1.5 py-0.5 text-[10px] font-black uppercase">{candidate.discovery_score}/100</span>
                                            <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase ${candidate.status === 'researched' ? 'bg-green-100' : 'bg-brand-yellow'}`}>
                                                {candidate.status === 'researched' ? 'In pipeline' : accessibilityTierLabels[candidate.accessibility_tier]}
                                            </span>
                                        </div>
                                        <p className="mt-1 truncate text-xs text-neutral-500">{candidate.location} · {deliveryLabels[candidate.delivery_model]}</p>
                                        <p className="mt-1 text-xs text-neutral-700">{compactText(candidate.summary, 120)}</p>
                                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                                            {candidate.community_size === null ? 'Audience unverified' : `${formatFollowerCount(candidate.community_size, 'estimated')} on ${candidate.community_platform}`}
                                            {' · '}Access {candidate.accessibility_score}/100
                                        </p>
                                    </div>
                                    {candidate.status !== 'researched' && (
                                        <button
                                            type="button"
                                            onClick={() => void researchCandidate(candidate)}
                                            disabled={isAnalyzing || researchingCandidateUrl !== null}
                                            className="inline-flex flex-none items-center gap-1 border-2 border-black bg-brand-yellow px-2 py-1.5 text-[10px] font-black uppercase disabled:opacity-50"
                                        >
                                            {researchingCandidateUrl === candidate.url ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                            Research
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                    { label: 'In pipeline', value: stats.pipeline, icon: Target, tone: 'bg-white' },
                    { label: 'Strong fits', value: stats.strong, icon: ShieldCheck, tone: 'bg-green-100' },
                    { label: 'Contacted', value: stats.contacted, icon: Send, tone: 'bg-blue-100' },
                    { label: 'Follow-ups due', value: stats.due, icon: Bell, tone: stats.due ? 'bg-brand-yellow' : 'bg-white' },
                ].map(item => (
                    <div key={item.label} className={`${item.tone} border-2 border-black p-4 shadow-[3px_3px_0_#000]`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">{item.label}</span>
                            <item.icon className="h-4 w-4" />
                        </div>
                        <div className="mt-1 font-candu text-3xl font-extrabold">{item.value}</div>
                    </div>
                ))}
            </section>

            <section className="grid min-h-[720px] border-2 border-black bg-white shadow-[6px_6px_0_#000] lg:grid-cols-[350px_minmax(0,1fr)]">
                <aside className="border-b-2 border-black lg:border-b-0 lg:border-r-2">
                    <div className="space-y-3 border-b-2 border-black bg-neutral-50 p-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Search partners"
                                className="w-full border-2 border-black bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={statusFilter}
                                onChange={event => setStatusFilter(event.target.value as 'all' | PartnerLeadStatus)}
                                className="min-w-0 border-2 border-black bg-white px-2 py-2 text-xs font-bold"
                            >
                                <option value="all">All statuses</option>
                                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <select value={deliveryFilter} onChange={event => setDeliveryFilter(event.target.value as 'all' | PartnerDeliveryModel)} className="min-w-0 border-2 border-black bg-white px-2 py-2 text-xs font-bold">
                                <option value="all">All delivery models</option>
                                {Object.entries(deliveryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <select value={communityFilter} onChange={event => setCommunityFilter(event.target.value as 'all' | PartnerCommunityBand)} className="min-w-0 border-2 border-black bg-white px-2 py-2 text-xs font-bold">
                                <option value="all">All audience sizes</option>
                                {Object.entries(communityBandLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <select value={revenueFilter} onChange={event => setRevenueFilter(event.target.value as 'all' | PartnerRevenueBand)} className="min-w-0 border-2 border-black bg-white px-2 py-2 text-xs font-bold">
                                <option value="all">All revenue bands</option>
                                {Object.entries(revenueBandLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <select value={accessibilityFilter} onChange={event => setAccessibilityFilter(event.target.value as 'all' | PartnerAccessibilityTier)} className="min-w-0 border-2 border-black bg-white px-2 py-2 text-xs font-bold">
                                <option value="all">All accessibility</option>
                                {Object.entries(accessibilityTierLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={loadLeads} className="flex w-full items-center justify-center gap-2 border-2 border-black bg-white p-2 text-xs font-black uppercase hover:bg-brand-yellow" aria-label="Refresh leads">
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh data
                        </button>
                    </div>

                    <div className="max-h-[620px] overflow-y-auto lg:max-h-[780px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 p-10 text-sm font-bold text-neutral-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading pipeline</div>
                        ) : filteredLeads.length ? filteredLeads.map(lead => (
                            <button
                                key={lead.id}
                                type="button"
                                onClick={() => setSelectedId(lead.id)}
                                className={`w-full border-b-2 border-black p-4 text-left transition-colors ${selectedId === lead.id ? 'bg-brand-yellow' : 'bg-white hover:bg-neutral-100'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 flex-none items-center justify-center border-2 border-black bg-brand-navy text-sm font-black text-white">
                                        {lead.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate font-black">{lead.name}</p>
                                            {isReminderDue(lead.reminder_at) && <span className="h-2 w-2 flex-none rounded-full bg-red-600" title="Follow-up due" />}
                                        </div>
                                        <p className="mt-0.5 truncate text-xs text-neutral-500">{lead.location}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="border border-black bg-white px-1.5 py-0.5 text-[10px] font-black">{lead.score}/100</span>
                                            {lead.accessibility_score !== null && lead.accessibility_score !== undefined && (
                                                <span className="border border-black bg-green-50 px-1.5 py-0.5 text-[10px] font-black">Access {lead.accessibility_score}</span>
                                            )}
                                            <span className={`border border-black px-1.5 py-0.5 text-[10px] font-black uppercase ${statusStyles[lead.status]}`}>{PARTNER_STATUS_LABELS[lead.status]}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="mt-2 h-4 w-4 flex-none" />
                                </div>
                            </button>
                        )) : (
                            <div className="p-8 text-center">
                                <Globe2 className="mx-auto h-8 w-8 text-neutral-300" />
                                <p className="mt-3 font-black">No partners here</p>
                                <p className="mt-1 text-xs text-neutral-500">Add URLs above or change your filters.</p>
                            </div>
                        )}
                    </div>
                </aside>

                <main className="min-w-0">
                    {selected ? (
                        <div>
                            <header className="border-b-2 border-black p-5 md:p-6">
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`border-2 px-2 py-1 text-[11px] font-black uppercase ${recommendationStyles[selected.recommendation]}`}>
                                                {PARTNER_RECOMMENDATION_LABELS[selected.recommendation]}
                                            </span>
                                            <span className="text-xs font-bold text-neutral-400">Confidence {Math.round(selected.confidence * 100)}%</span>
                                        </div>
                                        <h3 className="mt-3 font-candu text-3xl font-extrabold uppercase leading-none">{selected.name}</h3>
                                        <a href={selected.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs font-bold text-blue-700 hover:underline">
                                            {selected.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink className="h-3 w-3 flex-none" />
                                        </a>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            disabled={isAnalyzing}
                                            onClick={() => void researchUrls([selected.url])}
                                            className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase hover:bg-neutral-100 disabled:opacity-50"
                                        >
                                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh research
                                        </button>
                                        <button type="button" onClick={() => reachOut(selected)} className="inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#000]">
                                            <Mail className="h-4 w-4" /> Reach out
                                        </button>
                                        <button
                                            type="button"
                                            disabled={updatingId === selected.id}
                                            onClick={() => patchLead(selected.id, { status: 'contacted', last_contacted_at: new Date().toISOString(), reminder_at: null }, 'Marked as contacted.')}
                                            className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase hover:bg-green-100 disabled:opacity-50"
                                        >
                                            <Check className="h-4 w-4" /> Mark contacted
                                        </button>
                                        <button
                                            type="button"
                                            disabled={updatingId === selected.id}
                                            onClick={() => patchLead(selected.id, { status: 'rejected', reminder_at: null }, 'Partner moved to rejected.')}
                                            className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase hover:bg-red-100 disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-5 max-w-4xl text-sm leading-relaxed text-neutral-700">
                                    {compactText(selected.summary, 180)}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setExpandedLeadId(isSelectedExpanded ? null : selected.id)}
                                    className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-neutral-600 hover:text-black"
                                    aria-expanded={isSelectedExpanded}
                                >
                                    {isSelectedExpanded ? 'Hide full profile' : 'Show full profile'}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isSelectedExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            </header>

                            {isSelectedExpanded && <div className="grid border-b-2 border-black sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    { label: 'Organization', value: humanize(selected.organization_type) || selected.structure, icon: Users },
                                    { label: 'Location', value: selected.location, icon: MapPin },
                                    { label: 'Delivery model', value: deliveryLabels[selected.delivery_model || 'unknown'], icon: Target },
                                    { label: 'Team', value: humanize(selected.team_type), icon: Users },
                                ].map((field, index) => (
                                    <div key={field.label} className={`p-4 ${index < 3 ? 'xl:border-r-2 xl:border-black' : ''} ${index % 2 === 0 ? 'sm:border-r-2 sm:border-black xl:border-r-2' : ''} ${index < 2 ? 'border-b-2 border-black xl:border-b-0' : ''}`}>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-neutral-500"><field.icon className="h-3.5 w-3.5" />{field.label}</div>
                                        <p className="mt-1.5 text-sm font-bold leading-snug">{compactText(field.value)}</p>
                                        {field.value.replace(/\s+/g, ' ').trim().length > 96 && (
                                            <details className="mt-2 text-xs text-neutral-600">
                                                <summary className="cursor-pointer font-black uppercase text-neutral-500 hover:text-black">Full details</summary>
                                                <p className="mt-2 leading-relaxed">{field.value}</p>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>}

                            <div className="grid xl:grid-cols-[1fr_320px]">
                                <div className="space-y-6 p-5 md:p-6 xl:border-r-2 xl:border-black">
                                    <section>
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="font-candu text-lg font-extrabold uppercase">Partner metrics</h4>
                                            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-brand-navy font-candu text-lg font-extrabold text-brand-yellow">{selected.score}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selected.category.map(category => <span key={category} className="border-2 border-black bg-green-100 px-2 py-1 text-xs font-bold">{category}</span>)}
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                                            {[
                                                ['Organization', humanize(selected.organization_type)],
                                                ['Delivery', deliveryLabels[selected.delivery_model || 'unknown']],
                                                ['Team', humanize(selected.team_type)],
                                                ['Country', selected.country_code && selected.country_code !== 'XX' ? selected.country_code : compactText(selected.location, 30)],
                                                ['Largest audience', formatFollowerCount(getCommunityMax(selected))],
                                                ['Revenue', formatRevenue(selected)],
                                                ['Funding', humanize(selected.funding_status)],
                                                ['Activity', humanize(selected.activity_status)],
                                                ['Accessibility', formatAccessibility(selected)],
                                            ].map(([label, value]) => (
                                                <div key={label} className="border-2 border-black bg-neutral-50 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</p>
                                                    <p className="mt-1 text-sm font-black leading-tight">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="border-t-2 border-black pt-5">
                                        <h4 className="font-candu text-lg font-extrabold uppercase">Platform audiences</h4>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            {selected.communities.length ? selected.communities.map(community => {
                                                const qualifies = community.followers !== null && community.followers >= 4000 && community.followers <= 500000
                                                const quality = community.count_quality || (community.followers === null ? 'unavailable' : 'estimated')
                                                const rangeLabel = community.followers === null
                                                    ? 'Count unavailable'
                                                    : qualifies
                                                        ? 'Ideal range'
                                                        : community.followers < 4000 ? 'Below 4K' : 'Above 500K'
                                                return (
                                                    <div key={`${community.platform}-${community.url}`} className="border-2 border-black bg-white p-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-black uppercase">{community.platform}</span>
                                                            <a href={community.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline">Profile <ArrowUpRight className="h-3.5 w-3.5" /></a>
                                                        </div>
                                                        <div className="mt-2 flex items-end justify-between gap-3">
                                                            <span className="font-candu text-2xl font-extrabold">{formatFollowerCount(community.followers, quality)}</span>
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase ${qualifies ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>{rangeLabel}</span>
                                                        </div>
                                                        <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                                                            <span className="truncate text-neutral-500">{community.handle}</span>
                                                            <span className={`font-black uppercase ${quality === 'verified' ? 'text-green-700' : quality === 'estimated' ? 'text-amber-700' : 'text-neutral-400'}`}>
                                                                {quality === 'verified' ? 'Verified' : quality === 'estimated' ? 'Sourced estimate' : 'Unavailable'}
                                                            </span>
                                                        </div>
                                                        {isSelectedExpanded && community.count_note && <p className="mt-2 text-[11px] leading-snug text-neutral-500">{community.count_note}</p>}
                                                        {community.count_source_url && (
                                                            <a href={community.count_source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline">Audience source <ExternalLink className="h-3 w-3" /></a>
                                                        )}
                                                    </div>
                                                )
                                            }) : <p className="text-sm text-neutral-500">No independently verified community figures found.</p>}
                                        </div>
                                        {isSelectedExpanded && <div className="mt-3 border-2 border-black bg-neutral-50 p-4">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase"><Clock3 className="h-4 w-4" /> Latest activity: {selected.last_activity}</div>
                                            <p className="mt-2 text-sm text-neutral-700">{selected.activity_summary}</p>
                                        </div>}
                                    </section>

                                    {isSelectedExpanded && <>
                                    <section className="border-t-2 border-black pt-5">
                                        <h4 className="font-candu text-lg font-extrabold uppercase">Scoring evidence</h4>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            <div className="border-2 border-black bg-green-50 p-4">
                                                <p className="flex items-center gap-2 text-xs font-black uppercase"><CheckCircle2 className="h-4 w-4 text-green-700" /> Fit signals</p>
                                                <ul className="mt-3 space-y-2 text-sm">{selected.fit_reasons.map(reason => <li key={reason}>+ {reason}</li>)}</ul>
                                            </div>
                                            <div className="border-2 border-black bg-amber-50 p-4">
                                                <p className="flex items-center gap-2 text-xs font-black uppercase"><AlertTriangle className="h-4 w-4 text-amber-700" /> Gaps</p>
                                                <ul className="mt-3 space-y-2 text-sm">{selected.risks.map(risk => <li key={risk}>! {risk}</li>)}</ul>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="border-t-2 border-black pt-5">
                                        <h4 className="flex items-center gap-2 font-candu text-lg font-extrabold uppercase"><Target className="h-5 w-5" /> Accessibility now</h4>
                                        <div className="mt-3 border-2 border-black bg-neutral-50 p-4">
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <div><p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Score & tier</p><p className="mt-1 text-sm font-black">{formatAccessibility(selected)}</p></div>
                                                <div><p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">State dependency</p><p className="mt-1 text-sm font-black">{humanize(selected.state_dependency)}</p></div>
                                                <div><p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Small-company evidence</p><p className="mt-1 text-sm font-black">{humanize(selected.small_company_signal)}</p></div>
                                            </div>
                                            <p className="mt-3 text-sm leading-relaxed text-neutral-700">{selected.accessibility_summary || 'Not researched yet. Refresh this partner after applying the accessibility migration.'}</p>
                                        </div>
                                    </section>
                                    <section className="border-t-2 border-black pt-5">
                                        <h4 className="flex items-center gap-2 font-candu text-lg font-extrabold uppercase"><CircleDollarSign className="h-5 w-5" /> Funding & credibility</h4>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            <div className="border-2 border-black p-4">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Financial model</p>
                                                <p className="mt-2 text-sm font-bold">{selected.financial_model.join(' · ') || 'Unknown — not publicly verified'}</p>
                                                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                    <div><dt className="font-black uppercase text-neutral-500">Revenue</dt><dd className="mt-1 font-bold">{formatRevenue(selected)}</dd></div>
                                                    <div><dt className="font-black uppercase text-neutral-500">Year</dt><dd className="mt-1 font-bold">{selected.annual_revenue_year || 'Unknown'}</dd></div>
                                                    <div><dt className="font-black uppercase text-neutral-500">Band</dt><dd className="mt-1 font-bold">{revenueBandLabels[selected.revenue_band || 'unknown']}</dd></div>
                                                    <div><dt className="font-black uppercase text-neutral-500">Status</dt><dd className="mt-1 font-bold">{humanize(selected.funding_status)}</dd></div>
                                                </dl>
                                            </div>
                                            <div className="border-2 border-black p-4">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Official partners & sponsors</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {selected.sponsors.length ? selected.sponsors.map(sponsor => <span key={sponsor} className="bg-neutral-100 px-2 py-1 text-xs font-bold">{sponsor}</span>) : <p className="text-sm text-neutral-500">None publicly verified.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="border-t-2 border-black pt-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="font-candu text-lg font-extrabold uppercase">Outreach draft</h4>
                                            <button type="button" onClick={() => copyDraft(selected)} className="inline-flex items-center gap-1.5 border-2 border-black px-3 py-1.5 text-xs font-black uppercase hover:bg-brand-yellow"><Copy className="h-3.5 w-3.5" /> Copy</button>
                                        </div>
                                        <div className="mt-3 border-2 border-black bg-neutral-50 p-4">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Suggested angle</p>
                                            <p className="mt-1 text-sm font-bold">{selected.outreach_angle}</p>
                                            <p className="mt-4 border-b border-neutral-300 pb-3 text-sm"><strong>Subject:</strong> {selected.outreach_subject}</p>
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{selected.outreach_message}</p>
                                        </div>
                                    </section>
                                    </>}
                                </div>

                                <aside className="space-y-5 bg-neutral-50 p-5">
                                    <section className="border-2 border-black bg-brand-yellow p-4 shadow-[3px_3px_0_#000]">
                                        <p className="text-[10px] font-black uppercase tracking-wider">Next best action</p>
                                        <p className="mt-2 text-sm font-bold leading-snug">{getNextBestAction(selected)}</p>
                                    </section>
                                    <section>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Pipeline status</label>
                                        <select
                                            value={selected.status}
                                            disabled={updatingId === selected.id}
                                            onChange={event => patchLead(selected.id, { status: event.target.value as PartnerLeadStatus })}
                                            className={`mt-2 w-full border-2 border-black px-3 py-2 text-sm font-black ${statusStyles[selected.status]}`}
                                        >
                                            {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                    </section>

                                    <section className="border-t-2 border-black pt-4">
                                        <p className="flex items-center gap-2 text-xs font-black uppercase"><Bell className="h-4 w-4" /> Reminder</p>
                                        <p className={`mt-2 text-sm font-bold ${isReminderDue(selected.reminder_at) ? 'text-red-700' : ''}`}>{formatDate(selected.reminder_at)}</p>
                                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                                            {[3, 7, 30].map(days => <button key={days} type="button" onClick={() => setQuickReminder(selected, days)} className="border-2 border-black bg-white px-1 py-1.5 text-[10px] font-black hover:bg-brand-yellow">{days} days</button>)}
                                        </div>
                                        {selected.reminder_at && <button type="button" onClick={() => patchLead(selected.id, { reminder_at: null })} className="mt-2 text-xs font-bold text-neutral-500 underline">Clear reminder</button>}
                                    </section>

                                    {isSelectedExpanded && <>
                                    <section className="border-t-2 border-black pt-4">
                                        <p className="text-xs font-black uppercase">Contact</p>
                                        <div className="mt-3 space-y-2">
                                            {selected.contacts.length ? selected.contacts.map(contact => (
                                                <a key={`${contact.type}-${contact.value}`} href={getContactHref(contact.type, contact.value)} target={contact.type === 'email' ? undefined : '_blank'} rel="noreferrer" className="flex items-center justify-between gap-2 border-2 border-black bg-white p-2 text-xs font-bold hover:bg-brand-yellow">
                                                    <span className="min-w-0 truncate">{contact.label || contact.value}</span><ArrowUpRight className="h-3.5 w-3.5 flex-none" />
                                                </a>
                                            )) : <p className="text-xs text-neutral-500">No public contact channel verified.</p>}
                                        </div>
                                    </section>

                                    <section className="border-t-2 border-black pt-4">
                                        <p className="text-xs font-black uppercase">Socials</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selected.socials.map(social => <a key={`${social.type}-${social.value}`} href={getContactHref(social.type, social.value)} target="_blank" rel="noreferrer" className="border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase hover:bg-brand-yellow">{social.label || social.type}</a>)}
                                        </div>
                                    </section>

                                    <section className="border-t-2 border-black pt-4">
                                        <label htmlFor="partner-notes" className="text-xs font-black uppercase">Internal notes</label>
                                        <textarea
                                            id="partner-notes"
                                            key={`${selected.id}-${selected.notes}`}
                                            defaultValue={selected.notes}
                                            onBlur={event => {
                                                if (event.target.value !== selected.notes) void patchLead(selected.id, { notes: event.target.value }, 'Notes saved.')
                                            }}
                                            placeholder="Add context for the next touchpoint…"
                                            rows={4}
                                            className="mt-2 w-full resize-none border-2 border-black bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        />
                                        <p className="mt-1 text-[10px] text-neutral-400">Saves when you leave the field</p>
                                    </section>

                                    <section className="border-t-2 border-black pt-4">
                                        <p className="text-xs font-black uppercase">Evidence</p>
                                        <div className="mt-3 space-y-2">
                                            {selected.sources.map((source, index) => (
                                                <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="group flex gap-2 text-xs leading-snug text-blue-800 hover:underline">
                                                    <span className="font-black text-black">{index + 1}.</span><span>{source.title || source.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </section>
                                    </>}
                                </aside>
                            </div>
                        </div>
                    ) : (
                        <div className="flex min-h-[540px] items-center justify-center p-8 text-center">
                            <div>
                                <Globe2 className="mx-auto h-12 w-12 text-neutral-300" />
                                <h3 className="mt-4 font-candu text-2xl font-extrabold uppercase">Your partner pipeline starts here</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">Submit one or more organization URLs above. The research agent will validate fit, audience, activity, finances, contacts, and a tailored way in.</p>
                            </div>
                        </div>
                    )}
                </main>
            </section>
        </div>
    )
}
