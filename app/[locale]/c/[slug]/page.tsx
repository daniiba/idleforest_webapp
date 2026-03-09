import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { TreePine, Download, CheckCircle, Play } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CompanyPortalPage({
    params,
    searchParams
}: {
    params: { slug: string; locale: string }
    searchParams: { invite?: string }
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

    // Check if user is already logged in and part of this company
    const { data: { user } } = await supabase.auth.getUser()
    let isMember = false
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single()

        if (profile && profile.company_id === company.id) {
            isMember = true
        }
    }

    const { invite } = searchParams

    // If invite code is provided and it matches, or if user is already a member
    const isValidInvite = !company.is_invite_only || (invite && invite === company.invite_code) || isMember

    const themeColor = company.theme_color || '#10B981'

    return (
        <div className="min-h-screen bg-neutral-50 font-sans selection:bg-brand-yellow selection:text-black">
            {/* Set tracking cookie natively if valid invite */}
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`
                    }}
                />
            )}

            {/* Header / Navbar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b-4 border-black transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                    <Link href={`/${params.locale}`} className="flex items-center gap-2 group">
                        {company.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={company.logo_url} alt={company.name} className="w-10 h-10 rounded-full border-2 border-black object-cover" />
                        ) : (
                            <div className="bg-brand-yellow p-2 rounded-xl border-2 border-black transition-transform group-hover:scale-105 group-hover:-rotate-3">
                                <TreePine className="h-6 w-6 text-brand-navy" />
                            </div>
                        )}
                        <span className="font-extrabold text-xl md:text-2xl font-candu tracking-wider uppercase text-black">
                            {company.name} <span className="text-neutral-400 text-sm lowercase hidden sm:inline">x IdleForest</span>
                        </span>
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Hero Section */}
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden mb-12 relative">
                        <div
                            className="h-32 w-full opacity-20 absolute top-0 left-0 pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(45deg, ${themeColor} 25%, transparent 25%, transparent 75%, ${themeColor} 75%, ${themeColor}), linear-gradient(45deg, ${themeColor} 25%, transparent 25%, transparent 75%, ${themeColor} 75%, ${themeColor})`,
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 10px 10px'
                            }}
                        />

                        <div className="p-8 md:p-12 relative z-10 text-center">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-candu uppercase text-black mb-6 leading-tight">
                                Welcome to <br />
                                <span style={{ color: themeColor }}>{company.name}&apos;s</span> Portal
                            </h1>

                            <p className="text-lg md:text-xl font-medium text-neutral-700 max-w-2xl mx-auto mb-10 leading-relaxed">
                                {company.description || "We have partnered with IdleForest to plant real trees while you work. Join our company today!"}
                            </p>

                            {isMember ? (
                                <div className="space-y-6 flex flex-col items-center">
                                    <Link
                                        href={`/${params.locale}/welcome/c/${company.slug}`}
                                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border-4 border-black font-extrabold uppercase tracking-widest text-lg transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                                        style={{
                                            backgroundColor: themeColor,
                                            color: '#000',
                                            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                                        }}
                                    >
                                        Go to Company Portal
                                    </Link>
                                    <p className="text-sm font-bold text-neutral-500 flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        You are already a member of {company.name}
                                    </p>
                                </div>
                            ) : isValidInvite ? (
                                <div className="space-y-6 flex flex-col items-center">
                                    <Link
                                        href={`/${params.locale}/auth/user/signup${invite ? `?invite=${invite}` : ''}`}
                                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border-4 border-black font-extrabold uppercase tracking-widest text-lg transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                                        style={{
                                            backgroundColor: themeColor,
                                            color: '#000',
                                            boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                                        }}
                                    >
                                        Get Started by Signing Up
                                    </Link>
                                    <p className="text-sm font-bold text-neutral-500 flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        You will automatically join {company.name}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Explainer Video Section */}
                    {company.video_url ? (
                        <div className="bg-brand-navy border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                            <h2 className="text-2xl font-extrabold font-candu uppercase mb-6 flex items-center gap-3">
                                <Play className="h-6 w-6 text-brand-yellow" />
                                How it works
                            </h2>

                            <div className="aspect-video w-full rounded-xl border-4 border-black bg-black overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                                {/* If YouTube link, embed iframe, otherwise normal video tag. Basic YouTube parsing for now: */}
                                {company.video_url.includes('youtube.com') || company.video_url.includes('youtu.be') ? (
                                    <iframe
                                        src={company.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                        className="w-full h-full border-none"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={`${company.name} Explainer Video`}
                                    ></iframe>
                                ) : (
                                    <video
                                        src={company.video_url}
                                        controls
                                        className="w-full h-full object-cover"
                                    ></video>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-brand-yellow border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 md:p-10 text-black relative overflow-hidden mb-12">
                            <h2 className="text-3xl md:text-4xl font-extrabold font-candu uppercase mb-8 text-center">
                                How IdleForest Works
                            </h2>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-black text-brand-yellow rounded-full flex items-center justify-center font-extrabold text-2xl mb-4 font-candu">1</div>
                                    <h3 className="font-extrabold text-xl uppercase font-candu mb-2">Join</h3>
                                    <p className="font-medium text-neutral-700">Sign up and automatically join {company.name}&apos;s forest to start contributing to the common goal.</p>
                                </div>
                                <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-black text-brand-yellow rounded-full flex items-center justify-center font-extrabold text-2xl mb-4 font-candu">2</div>
                                    <h3 className="font-extrabold text-xl uppercase font-candu mb-2">Install</h3>
                                    <p className="font-medium text-neutral-700">Download the desktop app or browser extension. It runs quietly in the background.</p>
                                </div>
                                <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-black text-brand-yellow rounded-full flex items-center justify-center font-extrabold text-2xl mb-4 font-candu">3</div>
                                    <h3 className="font-extrabold text-xl uppercase font-candu mb-2">Plant</h3>
                                    <p className="font-medium text-neutral-700">Your unused bandwidth helps real trees get planted around the world, completely for free!</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
