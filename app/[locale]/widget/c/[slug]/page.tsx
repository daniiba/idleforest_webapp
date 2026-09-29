import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowUpRight, TreePine, Users } from 'lucide-react'
import { getCompanyGeneratedPointStats } from '@/lib/company-node-points'
import { localePrefix } from '@/lib/i18n-routes'

export default async function CompanyWidgetPage({
    params
}: {
    params: { slug: string; locale: string }
}) {
    const supabase = await createClient()

    // Fetch the company
    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (error || !company) {
        return notFound()
    }

    let memberCount = 0
    let totalPoints = 0

    const companyPointStats = await getCompanyGeneratedPointStats(createAdminClient(), company.id)
    memberCount = companyPointStats.memberCount
    totalPoints = companyPointStats.generatedPoints

    const themeColor = company.theme_color || '#10B981'
    const partnerPagePath = `${localePrefix(params.locale)}/c/${encodeURIComponent(company.slug)}`
    const partnerPageUrl = company.invite_code
        ? `${partnerPagePath}?invite=${encodeURIComponent(company.invite_code)}`
        : partnerPagePath

    return (
        <main className="min-h-screen bg-transparent flex items-center justify-center p-4 font-sans">
            <a
                href={partnerPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${company.name}'s IdleForest partner page`}
                className="group block w-full max-w-sm rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-brand-yellow focus-visible:ring-offset-4"
            >
                <article className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">

                    <div
                        className="h-24 w-full opacity-20 absolute top-0 left-0 pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(${themeColor} 2px, transparent 2px)`,
                            backgroundSize: '16px 16px'
                        }}
                    />

                    <div className="p-6 flex flex-col items-center text-center relative z-10 pt-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-brand-yellow rounded-full blur-md opacity-50 transform translate-y-2"></div>
                            {company.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={company.logo_url}
                                    alt=""
                                    className="w-20 h-20 rounded-full border border-neutral-200 object-cover relative z-10 bg-white"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full border border-neutral-200 bg-white flex items-center justify-center relative z-10">
                                    <TreePine className="h-10 w-10 text-brand-navy" aria-hidden="true" />
                                </div>
                            )}
                        </div>

                        <p className="mb-2 text-[10px] font-extrabold text-neutral-500">
                            IdleForest partner
                        </p>
                        <h1 className="text-2xl font-extrabold text-black mb-2">
                            {company.name}
                        </h1>

                        <p className="mb-6 line-clamp-3 text-sm font-semibold text-neutral-600">
                            {company.description || 'See how our community is creating real-world environmental impact with IdleForest.'}
                        </p>

                        {(memberCount > 0 || totalPoints > 0) && (
                            <div className="flex w-full items-center justify-center gap-2 mb-6 divide-x-2 divide-neutral-200 bg-neutral-50 py-3 rounded-xl border border-neutral-200">
                                <div className="flex flex-col items-center px-4 w-1/2">
                                    <Users className="h-5 w-5 text-brand-navy mb-1" aria-hidden="true" />
                                    <span className="font-extrabold text-xl text-black leading-none mb-1">{memberCount.toLocaleString(params.locale)}</span>
                                    <span className="text-[10px] font-bold text-neutral-500">Members</span>
                                </div>
                                <div className="flex flex-col items-center px-4 w-1/2">
                                    <TreePine className="h-5 w-5 text-green-600 mb-1" aria-hidden="true" />
                                    <span className="font-extrabold text-xl text-black leading-none mb-1">{totalPoints.toLocaleString(params.locale)}</span>
                                    <span className="text-[10px] font-bold text-neutral-500">Tasks</span>
                                </div>
                            </div>
                        )}

                        <span
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-center font-extrabold text-black transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none"
                            style={{ backgroundColor: themeColor }}
                        >
                            View partner page
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-neutral-400">
                            <span>Powered by</span>
                            <span className="flex items-center gap-1 text-black">
                                <TreePine className="h-3 w-3" aria-hidden="true" />
                                <span className="tracking-wide">IdleForest</span>
                            </span>
                        </div>
                    </div>
                </article>
            </a>
        </main>
    )
}
