'use client'

export type DailyReferralImpact = {
    date: string
    ownRequests: number
    referredRequests: number
    combinedRequests: number
}

type ReferralDailyBarsProps = {
    dailyImpact: DailyReferralImpact[]
    heading?: string
}

export default function ReferralDailyBars({
    dailyImpact,
    heading = 'How the forest moved this month',
}: ReferralDailyBarsProps) {
    if (dailyImpact.length === 0) return null

    const maxDailyRequests = Math.max(
        1,
        ...dailyImpact.map(day => day.combinedRequests)
    )
    const recentOwnRequests = dailyImpact.reduce((sum, day) => sum + day.ownRequests, 0)
    const recentReferredRequests = dailyImpact.reduce((sum, day) => sum + day.referredRequests, 0)

    return (
        <div className="mt-8 border-t-2 border-white/20 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">{dailyImpact.length} daily growth rings</p>
                    <h4 className="mt-1 font-candu text-2xl font-extrabold uppercase">{heading}</h4>
                </div>
                <div className="flex gap-6 font-mono text-xs font-bold tabular-nums">
                    <div>
                        <span className="mr-2 inline-block h-3 w-3 border border-white bg-white/35 align-middle" />
                        Own: {recentOwnRequests.toLocaleString()}
                    </div>
                    <div>
                        <span className="mr-2 inline-block h-3 w-3 border border-brand-yellow bg-brand-yellow align-middle" />
                        Invites: {recentReferredRequests.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="mt-5 border-x-2 border-b-2 border-white/30 px-2 pt-3">
                <div className="flex h-36 items-end gap-px sm:gap-1" role="img" aria-label={`Daily requests from this member and the people they invited over the last ${dailyImpact.length} days`}>
                    {dailyImpact.map(day => {
                        const ownHeight = day.ownRequests > 0
                            ? Math.max(2, (day.ownRequests / maxDailyRequests) * 100)
                            : 0
                        const referredHeight = day.referredRequests > 0
                            ? Math.max(2, (day.referredRequests / maxDailyRequests) * 100)
                            : 0

                        return (
                            <div
                                key={day.date}
                                className="flex h-full min-w-0 flex-1 flex-col justify-end"
                                title={`${day.date}: ${day.ownRequests.toLocaleString()} own, ${day.referredRequests.toLocaleString()} from invites`}
                                aria-label={`${day.date}: ${day.combinedRequests.toLocaleString()} combined requests`}
                            >
                                <div
                                    className="w-full bg-brand-yellow"
                                    style={{ height: `${referredHeight}%` }}
                                />
                                <div
                                    className="w-full bg-white/35"
                                    style={{ height: `${ownHeight}%` }}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <span>{dailyImpact[0]?.date}</span>
                <span>Today</span>
            </div>
        </div>
    )
}
