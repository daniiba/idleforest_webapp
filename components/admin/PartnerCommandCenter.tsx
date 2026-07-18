'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    AlertTriangle,
    ArrowUpRight,
    Bell,
    Check,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Copy,
    ExternalLink,
    Globe2,
    Loader2,
    Mail,
    MapPin,
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
    type PartnerLead,
    type PartnerLeadStatus,
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

function formatFollowerCount(value: number | null) {
    if (value === null) return 'Unverified'
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatDate(value: string | null) {
    if (!value) return 'Not set'
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
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
    return message
}

export default function PartnerCommandCenter() {
    const [leads, setLeads] = useState<PartnerLead[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [urlInput, setUrlInput] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | PartnerLeadStatus>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
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

    const filteredLeads = useMemo(() => {
        const query = search.trim().toLowerCase()
        return leads.filter(lead => {
            const statusMatches = statusFilter === 'all' || lead.status === statusFilter
            const searchMatches = !query || [lead.name, lead.url, lead.location, ...lead.category]
                .join(' ')
                .toLowerCase()
                .includes(query)
            return statusMatches && searchMatches
        })
    }, [leads, search, statusFilter])

    const stats = useMemo(() => ({
        pipeline: leads.filter(lead => !['rejected', 'partner'].includes(lead.status)).length,
        strong: leads.filter(lead => lead.recommendation === 'strong_fit' && lead.status !== 'rejected').length,
        contacted: leads.filter(lead => ['contacted', 'follow_up', 'partner'].includes(lead.status)).length,
        due: leads.filter(lead => lead.status !== 'rejected' && isReminderDue(lead.reminder_at)).length,
    }), [leads])

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

    const analyzeUrls = async () => {
        const urls = urlInput
            .split(/[\n,]/)
            .map(value => value.trim())
            .filter(Boolean)

        if (!urls.length) {
            setError('Add at least one organization URL.')
            return
        }

        if (urls.length > 12) {
            setError('Research up to 12 URLs at a time.')
            return
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
            setUrlInput('')
            setNotice(`${result.partners.length} partner${result.partners.length === 1 ? '' : 's'} researched and saved.`)
        } catch (analysisError) {
            setError(friendlyError(analysisError, 'Partner research failed.'))
        } finally {
            setIsAnalyzing(false)
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
                        <label htmlFor="partner-urls" className="block text-[11px] font-black uppercase tracking-wider mb-2">Organization URLs · one per line</label>
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
                                disabled={isAnalyzing}
                                className="inline-flex min-w-36 items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#000] disabled:opacity-60"
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                {isAnalyzing ? 'Researching…' : 'Analyze'}
                            </button>
                        </div>
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
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={event => setStatusFilter(event.target.value as 'all' | PartnerLeadStatus)}
                                className="min-w-0 flex-1 border-2 border-black bg-white px-2 py-2 text-xs font-bold"
                            >
                                <option value="all">All statuses</option>
                                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <button type="button" onClick={loadLeads} className="border-2 border-black bg-white p-2 hover:bg-brand-yellow" aria-label="Refresh leads">
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
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
                                <p className="mt-5 max-w-4xl text-sm leading-relaxed text-neutral-700">{selected.summary}</p>
                            </header>

                            <div className="grid border-b-2 border-black sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    { label: 'Structure', value: selected.structure, icon: Users },
                                    { label: 'Location', value: selected.location, icon: MapPin },
                                    { label: 'Delivery model', value: selected.operator_type, icon: Target },
                                    { label: 'Team', value: selected.team_model, icon: Users },
                                ].map((field, index) => (
                                    <div key={field.label} className={`p-4 ${index < 3 ? 'xl:border-r-2 xl:border-black' : ''} ${index % 2 === 0 ? 'sm:border-r-2 sm:border-black xl:border-r-2' : ''} ${index < 2 ? 'border-b-2 border-black xl:border-b-0' : ''}`}>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-neutral-500"><field.icon className="h-3.5 w-3.5" />{field.label}</div>
                                        <p className="mt-1.5 text-sm font-bold leading-snug">{field.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid xl:grid-cols-[1fr_320px]">
                                <div className="space-y-6 p-5 md:p-6 xl:border-r-2 xl:border-black">
                                    <section>
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="font-candu text-lg font-extrabold uppercase">Qualification</h4>
                                            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-brand-navy font-candu text-lg font-extrabold text-brand-yellow">{selected.score}</div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selected.category.map(category => <span key={category} className="border-2 border-black bg-green-100 px-2 py-1 text-xs font-bold">{category}</span>)}
                                        </div>
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <div className="border-2 border-black bg-green-50 p-4">
                                                <p className="flex items-center gap-2 text-xs font-black uppercase"><CheckCircle2 className="h-4 w-4 text-green-700" /> Why it fits</p>
                                                <ul className="mt-3 space-y-2 text-sm">
                                                    {selected.fit_reasons.map(reason => <li key={reason} className="flex gap-2"><span className="font-black text-green-700">+</span><span>{reason}</span></li>)}
                                                </ul>
                                            </div>
                                            <div className="border-2 border-black bg-amber-50 p-4">
                                                <p className="flex items-center gap-2 text-xs font-black uppercase"><AlertTriangle className="h-4 w-4 text-amber-700" /> Gaps & risks</p>
                                                <ul className="mt-3 space-y-2 text-sm">
                                                    {selected.risks.map(risk => <li key={risk} className="flex gap-2"><span className="font-black text-amber-700">!</span><span>{risk}</span></li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="border-t-2 border-black pt-5">
                                        <h4 className="font-candu text-lg font-extrabold uppercase">Community & activity</h4>
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            {selected.communities.length ? selected.communities.map(community => {
                                                const qualifies = community.followers !== null && community.followers >= 4000 && community.followers <= 500000
                                                return (
                                                    <a key={`${community.platform}-${community.url}`} href={community.url} target="_blank" rel="noreferrer" className="border-2 border-black p-3 hover:bg-neutral-50">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-black uppercase">{community.platform}</span>
                                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="mt-2 flex items-end justify-between gap-3">
                                                            <span className="font-candu text-2xl font-extrabold">{formatFollowerCount(community.followers)}</span>
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase ${qualifies ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-500'}`}>{qualifies ? 'In range' : 'Not verified'}</span>
                                                        </div>
                                                        <p className="mt-1 truncate text-xs text-neutral-500">{community.handle}</p>
                                                    </a>
                                                )
                                            }) : <p className="text-sm text-neutral-500">No independently verified community figures found.</p>}
                                        </div>
                                        <div className="mt-3 border-2 border-black bg-neutral-50 p-4">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase"><Clock3 className="h-4 w-4" /> Latest activity: {selected.last_activity}</div>
                                            <p className="mt-2 text-sm text-neutral-700">{selected.activity_summary}</p>
                                        </div>
                                    </section>

                                    <section className="border-t-2 border-black pt-5">
                                        <h4 className="flex items-center gap-2 font-candu text-lg font-extrabold uppercase"><CircleDollarSign className="h-5 w-5" /> Funding & credibility</h4>
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            <div className="border-2 border-black p-4">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Financial model</p>
                                                <p className="mt-2 text-sm font-bold">{selected.financial_model.join(' · ') || 'Unknown — not publicly verified'}</p>
                                                <p className="mt-3 text-sm text-neutral-700">{selected.financial_situation}</p>
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
                                </div>

                                <aside className="space-y-5 bg-neutral-50 p-5">
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
