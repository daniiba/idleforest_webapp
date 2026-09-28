'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type DailyStat = {
    date: string
    total_points_snapshot: number
    points_gained_that_day: number
}

function parseDateOnly(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return new Date(value)
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
}

// Recent points trend for public profiles; the total itself sits in the
// page header.
export default function PointsCard({ history }: { history: DailyStat[] }) {
    const data = [...history]
        .sort((a, b) => parseDateOnly(a.date).getTime() - parseDateOnly(b.date).getTime())
        .map(item => ({
            label: parseDateOnly(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            total: item.total_points_snapshot,
        }))
    const week = history
        .filter(item => Date.now() - parseDateOnly(item.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
        .reduce((sum, item) => sum + (item.points_gained_that_day || 0), 0)

    return (
        <section aria-labelledby="points-heading" className="flex flex-col border-2 border-black">
            <div className="flex items-baseline justify-between gap-3 px-5 pt-4">
                <h2 id="points-heading" className="text-[11px] font-black uppercase tracking-wider text-neutral-600">Points</h2>
                {week > 0 ? (
                    <p className="text-sm font-black tabular-nums">
                        +{week.toLocaleString('en')} <span className="font-bold text-neutral-600">this week</span>
                    </p>
                ) : null}
            </div>

            <div className="mt-auto h-[4.25rem] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                        <defs>
                            <linearGradient id="profile-points-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E0F146" stopOpacity={0.7} />
                                <stop offset="100%" stopColor="#E0F146" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="label" hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Tooltip
                            cursor={{ stroke: '#0B101F', strokeWidth: 1, strokeDasharray: '3 3' }}
                            content={({ active, payload, label }) => active && payload?.length ? (
                                <div className="border-2 border-black bg-brand-gray px-2 py-1 text-xs font-bold tabular-nums">
                                    {label} · {Number(payload[0].value).toLocaleString('en')}
                                </div>
                            ) : null}
                        />
                        <Area type="monotone" dataKey="total" stroke="#0B101F" strokeWidth={2} fill="url(#profile-points-fill)" isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
