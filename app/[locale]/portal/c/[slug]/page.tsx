import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
    ArrowRight,
    BadgeCheck,
    ExternalLink,
    Monitor,
    Users,
} from 'lucide-react'
import CompanyLeaveButton from '@/components/partner/CompanyLeaveButton'
import {
    isMossyEarthCompanySlug,
    isPlanetwildCompanySlug,
    isWastefreeCompanySlug,
} from '@/lib/company-partners'
import Navigation from '@/components/navigation'

export const dynamic = 'force-dynamic'

type Company = {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    website: string | null
    impact_mode: 'idleforest_planting' | 'company_named_donation' | 'partner_payout'
    payout_recipient_name: string | null
    payout_recipient_url: string | null
    payout_notes: string | null
    payout_rate_cents_per_1000_points: number
}

type Membership = {
    id: string
    joined_at: string
    status: string
    generated_points_final: number | null
}

type NodeRow = {
    id: string
    node_identifier: string | null
    platform: string | null
    total_requests: number | null
    opt_in: boolean | null
    created_at: string | null
}

type BaselineRow = {
    node_identifier: string
    baseline_total_requests: number | null
    final_total_requests: number | null
}

type RewardRow = {
    id: string
    reward_type: string
    status: string
    trees_awarded: number | null
    created_at: string | null
    updated_at: string | null
}

type LedgerRow = {
    id: string
    type: string
    status: string
    points: number | null
    amount_cents: number | null
    period_start: string | null
    period_end: string | null
    notes: string | null
    receipt_url: string | null
    created_at: string
}

const platformLabels: Record<string, string> = {
    win32: 'Windows desktop',
    darwin: 'Mac desktop',
}

function formatNumber(value: number, locale: string) {
    return new Intl.NumberFormat(locale).format(Math.max(0, value))
}

function formatCurrencyCents(value: number, locale: string) {
    return new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Math.max(0, value) / 100)
}

function formatDate(value: string | null | undefined, locale: string) {
    if (!value) return 'Not recorded'

    return new Intl.DateTimeFormat(locale || 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value))
}

function getCompanyImpactLabel(company: Company) {
    if (isWastefreeCompanySlug(company.slug)) return 'Clean-ocean fund'
    if (isPlanetwildCompanySlug(company.slug) || isMossyEarthCompanySlug(company.slug)) return 'Rewilding fund'
    if (company.impact_mode === 'partner_payout') return 'Partner payout'
    if (company.impact_mode === 'company_named_donation') return 'Named fund'

    return 'Company forest'
}

function getCompanyImpactDescription(company: Company) {
    if (isWastefreeCompanySlug(company.slug)) {
        return 'Your future IdleForest activity supports the Waste Free Planet cleanup fund through 1ClickImpact and Plastic Bank.'
    }

    if (isPlanetwildCompanySlug(company.slug)) {
        return "Your future IdleForest activity supports this Planet Wild rewilding fund. It does not replace Planet Wild's own membership."
    }

    if (isMossyEarthCompanySlug(company.slug)) {
        return "Your future IdleForest activity supports this Mossy Earth rewilding fund. It does not replace Mossy Earth's own membership."
    }

    if (company.impact_mode === 'partner_payout' && company.payout_recipient_name) {
        return `Your future IdleForest activity is routed toward ${company.payout_recipient_name}.`
    }

    return `Your future IdleForest activity counts toward ${company.name}.`
}

function getCompanyLogoUrl(company: Company) {
    if (company.logo_url) return company.logo_url
    if (isWastefreeCompanySlug(company.slug)) return '/partner/wastefree/wfp-logo-white.webp'

    return null
}

function getNodeLabel(node: NodeRow) {
    if (node.platform) return platformLabels[node.platform] || node.platform

    return 'Browser extension'
}

function getPublicCompanyHref(locale: string, slug: string) {
    return `/${locale}/c/${slug}`
}

export default async function CompanyMemberPortalPage({
    params,
}: {
    params: { locale: string; slug: string }
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/user/login?redirect=${encodeURIComponent(`/${params.locale}/portal/c/${params.slug}`)}`)
    }

    const admin = createAdminClient()

    const { data: company } = await admin
        .from('companies')
        .select('id, name, slug, description, logo_url, website, impact_mode, payout_recipient_name, payout_recipient_url, payout_notes, payout_rate_cents_per_1000_points')
        .eq('slug', params.slug)
        .single()

    if (!company) {
        redirect('/')
    }

    const typedCompany = company as Company

    const { data: profile } = await admin
        .from('profiles')
        .select('display_name, total_points, company_id, company_joined_at, company_points_baseline')
        .eq('user_id', user.id)
        .single()

    const { data: membership } = await admin
        .from('company_memberships')
        .select('id, joined_at, status, generated_points_final')
        .eq('company_id', typedCompany.id)
        .eq('user_id', user.id)
        .is('left_at', null)
        .maybeSingle()

    if (!membership || profile?.company_id !== typedCompany.id) {
        redirect(`/${params.locale}/join/company/${typedCompany.slug}`)
    }

    const typedMembership = membership as Membership

    const [{ data: baselines }, { data: nodes }, { data: rewards }, { data: ledgerRows }, { count: activeMemberCount }] = await Promise.all([
        admin
            .from('company_membership_node_baselines')
            .select('node_identifier, baseline_total_requests, final_total_requests')
            .eq('membership_id', typedMembership.id),
        admin
            .from('nodes')
            .select('id, node_identifier, platform, total_requests, opt_in, created_at')
            .eq('user_id', user.id),
        admin
            .from('user_rewards')
            .select('id, reward_type, status, trees_awarded, created_at, updated_at')
            .eq('user_id', user.id)
            .eq('company_id', typedCompany.id)
            .order('created_at', { ascending: false }),
        admin
            .from('company_fund_ledger')
            .select('id, type, status, points, amount_cents, period_start, period_end, notes, receipt_url, created_at')
            .eq('company_id', typedCompany.id)
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .order('created_at', { ascending: false })
            .limit(20),
        admin
            .from('company_memberships')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', typedCompany.id)
            .eq('status', 'active')
            .is('left_at', null),
    ])

    const typedBaselines = (baselines || []) as BaselineRow[]
    const typedNodes = (nodes || []) as NodeRow[]
    const typedRewards = (rewards || []) as RewardRow[]
    const typedLedgerRows = (ledgerRows || []) as LedgerRow[]
    const nodeTotalsByIdentifier = new Map(typedNodes.filter((node) => node.node_identifier).map((node) => [node.node_identifier as string, Math.max(0, node.total_requests || 0)]))
    const generatedPoints = typedBaselines.reduce((sum, baseline) => {
        const currentTotal = nodeTotalsByIdentifier.get(baseline.node_identifier) || Math.max(0, baseline.final_total_requests || 0)
        return sum + Math.max(0, currentTotal - Math.max(0, baseline.baseline_total_requests || 0))
    }, 0)
    const fallbackGeneratedPoints = profile?.company_points_baseline !== null && profile?.company_points_baseline !== undefined
        ? Math.max(0, (profile?.total_points || 0) - (profile.company_points_baseline || 0))
        : 0
    const personalGeneratedPoints = generatedPoints > 0 ? generatedPoints : fallbackGeneratedPoints
    const estimatedFundingCents = Math.floor((personalGeneratedPoints / 1000) * (typedCompany.payout_rate_cents_per_1000_points || 27))
    const hasDesktopNode = typedNodes.some((node) => node.platform === 'win32' || node.platform === 'darwin')
    const desktopNodeCount = typedNodes.filter((node) => node.platform === 'win32' || node.platform === 'darwin').length
    const extensionNodeCount = typedNodes.filter((node) => node.platform === null).length
    const activeNodeCount = typedNodes.filter((node) => node.opt_in !== false).length
    const publicCompanyHref = getPublicCompanyHref(params.locale, typedCompany.slug)
    const impactLabel = getCompanyImpactLabel(typedCompany)
    const joinedLabel = formatDate(typedMembership.joined_at || profile?.company_joined_at, params.locale)
    const membershipStatusLabel = typedMembership.status === 'active' ? 'Active' : typedMembership.status
    const connectionTitle = hasDesktopNode ? 'Desktop app connected' : 'Desktop app not connected yet'
    const connectionDescription = hasDesktopNode
        ? 'Desktop activity can count toward this company route.'
        : 'Install and log in to the desktop app to start company activity.'
    const deviceRows = typedNodes.map((node) => {
        const baseline = typedBaselines.find((row) => row.node_identifier === node.node_identifier)
        const baselineTotal = Math.max(0, baseline?.baseline_total_requests || 0)
        const currentTotal = Math.max(0, node.total_requests || 0)
        const companyTasks = baseline ? Math.max(0, currentTotal - baselineTotal) : 0

        return {
            node,
            baselineTotal,
            currentTotal,
            companyTasks,
        }
    })
        .sort((a, b) => {
            const activeDelta = Number(b.node.opt_in !== false) - Number(a.node.opt_in !== false)
            if (activeDelta !== 0) return activeDelta

            return b.companyTasks - a.companyTasks
        })

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-brand-gray px-4 py-8 font-rethink-sans text-brand-navy sm:px-6 lg:px-8">
                {/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: IdleForest app · enrichment: none · nav: existing site header · footer: global · pre-emit critique: P4 H5 E4 S5 R5 V4 */}
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-7">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                            <div className="min-w-0">
                                <div className="mb-5 flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black">
                                        {getCompanyLogoUrl(typedCompany) ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={getCompanyLogoUrl(typedCompany)!} alt="" className="h-full w-full object-contain p-2" />
                                        ) : (
                                            <Users className="h-7 w-7 text-brand-yellow" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-candu text-2xl font-extrabold uppercase leading-none text-black sm:text-3xl">
                                            {typedCompany.name}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-neutral-600">
                                            {membershipStatusLabel} route · joined {joinedLabel} · {impactLabel}
                                        </p>
                                    </div>
                                </div>
                                <h1 className="max-w-3xl font-candu text-3xl font-extrabold uppercase leading-tight text-black sm:text-5xl">
                                    You are connected.
                                </h1>
                                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-neutral-700">
                                    {getCompanyImpactDescription(typedCompany)}
                                </p>
                            </div>

                            <div className="flex flex-col justify-between gap-4">
                                <div className={`rounded-md border p-4 ${hasDesktopNode ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                                    <div className="flex gap-3">
                                        {hasDesktopNode ? <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" /> : <Monitor className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />}
                                        <div className="min-w-0">
                                            <p className="font-black text-black">{connectionTitle}</p>
                                            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-700">{connectionDescription}</p>
                                        </div>
                                    </div>
                                </div>
                                {!hasDesktopNode ? (
                                    <Link
                                        href="/downloads#desktop-apps"
                                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-black bg-brand-yellow px-4 py-3 text-sm font-black uppercase tracking-wider text-black shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                    >
                                        Download desktop app
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : null}
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={publicCompanyHref}
                                        className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                    >
                                        Public page
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <CompanyLeaveButton companyName={typedCompany.name} leaveRedirectHref="/welcome" />
                                </div>
                            </div>
                        </div>

                        <dl className="mt-7 grid gap-px overflow-hidden rounded-md border border-black/10 bg-black/10 sm:grid-cols-4" aria-label="Contribution summary">
                            <SummaryItem label="Tasks" value={formatNumber(personalGeneratedPoints, params.locale)} />
                            <SummaryItem label="Funding" value={formatCurrencyCents(estimatedFundingCents, params.locale)} />
                            <SummaryItem label="Active devices" value={`${formatNumber(activeNodeCount, params.locale)} / ${formatNumber(typedNodes.length, params.locale)}`} />
                            <SummaryItem label="Members" value={formatNumber(activeMemberCount || 0, params.locale)} />
                        </dl>

                        {typedCompany.payout_notes ? (
                            <p className="mt-5 max-w-4xl text-sm font-semibold leading-6 text-neutral-600">
                                {typedCompany.payout_notes}
                            </p>
                        ) : null}
                    </section>

                    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="font-candu text-2xl font-extrabold uppercase leading-none text-black">Devices</h2>
                                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-neutral-600">
                                    Company tasks are the difference between a device&apos;s starting total and its current total. Active devices are listed first.
                                </p>
                            </div>
                            <p className="text-sm font-bold text-neutral-500">
                                {formatNumber(desktopNodeCount, params.locale)} desktop · {formatNumber(extensionNodeCount, params.locale)} extension
                            </p>
                        </div>

                        <div className="mt-5 overflow-x-auto rounded-md border border-black/10">
                            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-black/10 bg-neutral-50">
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-neutral-500">Device</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-neutral-500">Status</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-neutral-500">Started at</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-neutral-500">Now</th>
                                        <th className="px-4 py-3 font-black uppercase tracking-wider text-neutral-500">Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deviceRows.length > 0 ? (
                                        deviceRows.map(({ node, baselineTotal, currentTotal, companyTasks }) => {
                                            return (
                                                <tr key={node.id} className="border-b border-black/5 last:border-b-0">
                                                    <td className="px-4 py-4">
                                                        <p className="font-black">{getNodeLabel(node)}</p>
                                                        <p className="mt-1 max-w-[18rem] truncate font-mono text-xs text-neutral-500">{node.node_identifier || 'Legacy extension node'}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <StatusPill active={node.opt_in !== false} />
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold tabular-nums text-neutral-700">{formatNumber(baselineTotal, params.locale)}</td>
                                                    <td className="px-4 py-4 font-semibold tabular-nums text-neutral-700">{formatNumber(currentTotal, params.locale)}</td>
                                                    <td className="px-4 py-4 font-black tabular-nums text-black">{formatNumber(companyTasks, params.locale)}</td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center font-semibold text-neutral-600">No linked devices yet. Install the desktop app or browser extension to start routing activity.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {(typedRewards.length > 0 || typedLedgerRows.length > 0) ? (
                        <section className="grid gap-6 lg:grid-cols-2">
                            {typedRewards.length > 0 ? (
                                <DetailList
                                    title="Rewards"
                                    rows={typedRewards.map((reward) => ({
                                        id: reward.id,
                                        title: reward.reward_type.replace(/_/g, ' '),
                                        meta: `${reward.status} • ${formatDate(reward.created_at, params.locale)}`,
                                        value: `${formatNumber(reward.trees_awarded || 0, params.locale)} trees`,
                                    }))}
                                />
                            ) : null}
                            {typedLedgerRows.length > 0 ? (
                                <DetailList
                                    title="Ledger"
                                    rows={typedLedgerRows.map((row) => ({
                                        id: row.id,
                                        title: row.type,
                                        meta: `${row.status} • ${formatDate(row.created_at, params.locale)}${row.notes ? ` • ${row.notes}` : ''}`,
                                        value: row.amount_cents ? formatCurrencyCents(row.amount_cents, params.locale) : `${formatNumber(row.points || 0, params.locale)} pts`,
                                        href: row.receipt_url || undefined,
                                    }))}
                                />
                            ) : null}
                        </section>
                    ) : null}
                </div>
            </main>
        </>
    )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white p-4">
            <dt className="text-xs font-black uppercase tracking-wider text-neutral-500">{label}</dt>
            <dd className="mt-1 font-candu text-3xl font-extrabold leading-none text-black tabular-nums">{value}</dd>
        </div>
    )
}

function StatusPill({ active }: { active: boolean }) {
    return (
        <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-black ${active ? 'border-green-200 bg-green-50 text-green-700' : 'border-neutral-200 bg-neutral-100 text-neutral-600'}`}>
            <span className={`h-2 w-2 rounded-full ${active ? 'bg-green-500' : 'bg-neutral-400'}`} />
            {active ? 'Active' : 'Paused'}
        </span>
    )
}

function DetailList({
    title,
    rows,
}: {
    title: string
    rows: Array<{ id: string; title: string; meta: string; value: string; href?: string }>
}) {
    return (
        <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-candu text-2xl font-extrabold uppercase leading-none text-black">{title}</h2>
            <div className="mt-4">
                {rows.map((row) => (
                    <div key={row.id} className="flex items-start justify-between gap-4 border-b border-black/10 py-4 last:border-b-0">
                        <div>
                            <p className="font-black capitalize">{row.title}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-neutral-600">{row.meta}</p>
                        </div>
                        {row.href ? (
                            <a href={row.href} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-black underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
                                {row.value}
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        ) : (
                            <p className="shrink-0 text-sm font-black">{row.value}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
