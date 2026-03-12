import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { TreePine, Download, CheckCircle, Play, Users, ShieldCheck, ZapOff, Heart } from 'lucide-react'
import Navigation from '@/components/navigation'
import CompanySettingsPanel from './CompanySettingsPanel'

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

    // Fetch members and points for social proof
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('company_id', company.id)

    let memberCount = 0
    let totalPoints = 0

    if (!profilesError && profiles) {
        memberCount = profiles.length
        totalPoints = profiles.reduce((acc, p) => acc + (p.total_points || 0), 0)
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

    // Check if the current user is the owner
    const isOwner = user ? company.user_id === user.id : false
    
    // If invite code is provided and it matches, or if user is already a member
    const isValidInvite = !company.is_invite_only || (invite && invite === company.invite_code) || isMember

    const themeColor = company.theme_color || '#10B981'

    return (
        <div className="min-h-screen bg-neutral-50 font-sans selection:bg-brand-yellow selection:text-black">
            <Navigation hideBanner />

            {/* Set tracking cookie natively if valid invite */}
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`
                    }}
                />
            )}

            <main className="pt-8 pb-16">
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
                            
                            <div className="mb-6 flex justify-center">
                                {company.logo_url ? (
                                    <Image 
                                        src={company.logo_url} 
                                        alt={company.name} 
                                        width={100} 
                                        height={100} 
                                        className="w-24 h-24 rounded-full border-4 border-black object-cover bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-brand-yellow rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <TreePine className="h-12 w-12 text-brand-navy" />
                                    </div>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-candu uppercase text-black mb-6 leading-tight">
                                Welcome to <br />
                                <span style={{ color: themeColor }}>{company.name}&apos;s</span> Portal
                            </h1>

                            <p className="text-lg md:text-xl font-medium text-neutral-700 max-w-2xl mx-auto leading-relaxed mb-6">
                                {company.description || "We have partnered with IdleForest to plant real trees while you work. Join our company today!"}
                            </p>

                            {/* Trust Stats Badge */}
                            {(memberCount > 0 || totalPoints > 0) && (
                                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                                    <div className="bg-brand-navy/5 border-2 border-brand-navy/20 rounded-xl px-4 py-2 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-brand-navy" />
                                        <span className="font-extrabold text-xl text-brand-navy">{memberCount}</span>
                                        <span className="font-bold text-neutral-600 text-sm uppercase tracking-wide">Active Members</span>
                                    </div>
                                    <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-2 flex items-center gap-2">
                                        <TreePine className="h-5 w-5 text-green-600" />
                                        <span className="font-extrabold text-xl text-green-700">{totalPoints.toLocaleString()}</span>
                                        <span className="font-bold text-green-800 text-sm uppercase tracking-wide">Points Generated</span>
                                    </div>
                                </div>
                            )}

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

                    {/* Trust Markers Section */}
                    <div className="mb-8 border-t-4 border-black pt-12">
                        <h2 className="text-3xl font-extrabold font-candu uppercase mb-8 text-center text-black">
                            Why join {company.name}&apos;s forest?
                        </h2>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Heart className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="font-extrabold text-xl uppercase font-candu mb-3 text-black">100% Free Forever</h3>
                                <p className="font-medium text-neutral-700">You never pay a dime. Your unused background internet bandwidth funds the tree planting automatically.</p>
                            </div>
                            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="font-extrabold text-xl uppercase font-candu mb-3 text-black">Strictly Private</h3>
                                <p className="font-medium text-neutral-700">We do not track your browsing history, see your data, or interact with your personal files at any time.</p>
                            </div>
                            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-brand-yellow/30 rounded-full flex items-center justify-center mb-6 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <ZapOff className="h-8 w-8 text-brand-yellow" />
                                </div>
                                <h3 className="font-extrabold text-xl uppercase font-candu mb-3 text-black">Zero Impact</h3>
                                <p className="font-medium text-neutral-700">Runs silently in the background. It pauses immediately if you need your connection for anything else.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Owner Settings Panel */}
            {isOwner && (
                <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />
            )}
        </div>
    )
}
