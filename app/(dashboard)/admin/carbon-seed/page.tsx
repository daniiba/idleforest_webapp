'use client'

import { useState } from 'react'
import { CARBON_SEED_DATA } from '@/lib/carbon-seed-data'
import { ArrowLeft, Database, Check, AlertTriangle, Loader2, Globe, Info } from 'lucide-react'
import Link from 'next/link'

export default function CarbonSeedPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)
    const [activeLangs, setActiveLangs] = useState<Record<string, string>>({})

    const handleSeed = async () => {
        if (!window.confirm('Are you sure you want to push all seed data to Supabase? This will overwrite existing entries with the same slug.')) {
            return
        }

        setError(null)
        setStatus('loading')

        try {
            const response = await fetch('/api/seed-carbon-apps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Unknown error')
            }

            setStatus('success')
        } catch (err) {
            setStatus('error')
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    const setLang = (slug: string, lang: string) => {
        setActiveLangs(prev => ({ ...prev, [slug]: lang }))
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-900 pb-20 font-inter">
            {/* Admin Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-brand-green" />
                            <h1 className="font-bold text-lg">Carbon Seeding Tool</h1>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleSeed}
                        disabled={status === 'loading'}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-sm ${
                            status === 'loading' 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-slate-800 active:scale-95'
                        }`}
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Pushing to DB...
                            </>
                        ) : (
                            <>
                                <Database className="w-4 h-4" />
                                Push to Supabase
                            </>
                        )}
                    </button>
                </div>
            </header>
            
            <div className="container mx-auto px-6 py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Reviewing Multi-language Carbon Data</h3>
                            <p className="text-blue-800/80 text-sm leading-relaxed">
                                Click the <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-xs">EN</span> tags to preview per-language text.
                                Push to sync corrected icons (like ChatGPT → Ollama) and new SEO translations for all languages.
                            </p>
                        </div>
                    </div>

                    {status === 'success' && (
                        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-4">
                            <Check className="w-5 h-5" />
                            <span className="font-bold">✓ Success! Seed data has been pushed to Supabase.</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800 animate-in fade-in slide-in-from-top-4">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold">✗ Error: {error}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {CARBON_SEED_DATA.map((app) => {
                            const availableLangs = app.seo_content ? Object.keys(app.seo_content) : [];
                            const currentLang = activeLangs[app.slug] || availableLangs[0] || 'en';
                            const seoData = app.seo_content ? (app.seo_content as any)[currentLang] : null;
                            const englishSeo = app.seo_content ? (app.seo_content as any).en : null;
                            const humanEquivalent = seoData?.human_equivalent_comparison || englishSeo?.human_equivalent_comparison || '';
                            const idleforestPitch = seoData?.idleforest_pitch || englishSeo?.idleforest_pitch || '';

                            return (
                                <div key={app.slug} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-xl font-bold flex items-center gap-3">
                                                {app.app_name}
                                                <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono">
                                                    {app.slug}
                                                </span>
                                            </h2>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-600 px-1.5 rounded border border-slate-300">
                                                    {app.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-slate-900">{app.co2_per_hour_grams}g <span className="text-sm font-medium text-slate-400">CO2/hr</span></div>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Human Equivalent</span>
                                                <p className="text-sm font-semibold">{humanEquivalent}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">IdleForest Pitch</span>
                                                <p className="text-sm border-l-4 border-brand-yellow pl-4 italic py-1 text-slate-600 bg-brand-yellow/5">
                                                    "{idleforestPitch}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">Translation Preview</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {availableLangs.map(lang => (
                                                        <button 
                                                            type="button"
                                                            key={lang}
                                                            onClick={() => setLang(app.slug, lang)}
                                                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border transition-all ${
                                                                currentLang === lang 
                                                                    ? 'bg-brand-green text-black border-black' 
                                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'
                                                            }`}
                                                        >
                                                            {lang}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {seoData ? (
                                                <div className="flex-grow bg-slate-900 rounded-lg p-5 overflow-auto max-h-[350px] custom-scrollbar">
                                                    <div className="mb-6">
                                                        <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider block mb-2 opacity-60">Intro Text ({currentLang})</span>
                                                        <p className="text-xs text-brand-yellow leading-relaxed">{seoData.intro}</p>
                                                    </div>
                                                    
                                                    {seoData.faq && seoData.faq.length > 0 && (
                                                        <div>
                                                            <span className="text-[9px] font-bold text-brand-green uppercase tracking-wider block mb-3 opacity-60">Frequently Asked Questions</span>
                                                            <div className="space-y-4">
                                                                {seoData.faq.map((item: any, idx: number) => (
                                                                    <div key={idx} className="bg-slate-800/50 rounded p-3 border border-slate-700/50">
                                                                        <p className="text-[11px] font-bold text-white mb-1.5 leading-tight">Q: {item.question}</p>
                                                                        <p className="text-xs text-brand-yellow/80 leading-relaxed">A: {item.answer}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex-grow flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-xs text-slate-400 font-medium italic min-h-[100px]">
                                                    No SEO content defined
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}
