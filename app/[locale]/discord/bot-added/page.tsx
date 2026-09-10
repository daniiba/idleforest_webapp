'use client'

import React, { Suspense } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function BotAddedContent() {
    const searchParams = useSearchParams()
    // We can show the guild_id if we want, but usually just success is enough
    const guildId = searchParams.get('guild_id')

    const returnUrl = guildId
        ? `https://discord.com/channels/${guildId}`
        : 'https://discord.com/app'

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
            <div className="bg-white border-2 border-black shadow-none p-8 w-full reveal-animation">
                <div className="bg-green-100 w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                    Bot Added Successfully!
                </h1>
                <p className="text-neutral-600 mb-8">
                    IdleForest Bot has been added to your server. You can now close this window and return to Discord.
                </p>
                <a
                    href={returnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-none hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                >
                    Return to Discord <ArrowRight className="w-4 h-4" />
                </a>
                <div className="mt-6">
                    <Link
                        href="/"
                        className="text-sm text-neutral-500 hover:text-black underline"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function BotAddedPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BotAddedContent />
        </Suspense>
    )
}
