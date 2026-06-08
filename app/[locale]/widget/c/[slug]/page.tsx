import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { TreePine, Users } from 'lucide-react'
import { getCompanyGeneratedPointStats } from '@/lib/company-node-points'

// Basic standalone Layout for Widget to override the root layout's header/footer if needed
// Actually, since it's an app dir, we can rely on standard page layout, 
// but we should make sure this page doesn't render standard navbars, or just accept the global layout 
// We will just render a centered card.

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
    const joinUrl = `/${params.locale}/c/${company.slug}?invite=${company.invite_code}`

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden relative">

                {/* Header Pattern */}
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
                                alt={`${company.name} Logo`}
                                className="w-20 h-20 rounded-full border-4 border-black object-cover relative z-10 bg-white"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full border-4 border-black bg-white flex items-center justify-center relative z-10">
                                <TreePine className="h-10 w-10 text-brand-navy" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-extrabold font-candu uppercase text-black mb-2">
                        {company.name}
                    </h2>

                    <p className="text-sm font-semibold text-neutral-600 mb-6">
                        {company.description || 'Join our company portal to start planting real trees together!'}
                    </p>

                    {(memberCount > 0 || totalPoints > 0) && (
                        <div className="flex w-full items-center justify-center gap-2 mb-6 divide-x-2 divide-neutral-200 bg-neutral-50 py-3 rounded-xl border-2 border-neutral-200">
                            <div className="flex flex-col items-center px-4 w-1/2">
                                <Users className="h-5 w-5 text-brand-navy mb-1" />
                                <span className="font-extrabold text-xl text-black leading-none mb-1">{memberCount}</span>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Members</span>
                            </div>
                            <div className="flex flex-col items-center px-4 w-1/2">
                                <TreePine className="h-5 w-5 text-green-600 mb-1" />
                                <span className="font-extrabold text-xl text-black leading-none mb-1">{totalPoints.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tasks</span>
                            </div>
                        </div>
                    )}

                    <a
                        href={joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl border-4 border-black font-extrabold uppercase tracking-wider text-black text-center transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        style={{
                            backgroundColor: themeColor,
                            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                        }}
                    >
                        Plant trees with {company.name}
                    </a>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-neutral-400">
                        <span>Powered by</span>
                        <div className="flex items-center gap-1 text-black">
                            <TreePine className="h-3 w-3" />
                            <span className="font-candu tracking-wide uppercase">IdleForest</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
