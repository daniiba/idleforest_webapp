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

// Points total with a small brand-colored trend line; replaces the full
// chart on public profiles.
export default function PointsCard({ totalPoints, history }: { totalPoints: number; history: DailyStat[] }) {
    const data = [...history]
        .sort((a, b) => parseDateOnly(a.date).getTime() - parseDateOnly(b.date).getTime())
        .map(item => ({
            label: parseDateOnly(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            total: item.total_points_snapshot,
        }))
    const recent = history
        .filter(item => Date.now() - parseDateOnly(item.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
        .reduce((sum, item) => sum + (item.points_gained_that_day || 0), 0)

    return (
        <section aria-labelledby="points-heading" className="flex flex-col border-2 border-black">
            <div className="flex items-end justify-between gap-3 p-5 pb-0">
                <div>
                    <h2 id="points-heading" className="text-[11px] font-black uppercase tracking-wider text-neutral-600">Points</h2>
                    <p className="mt-1 font-candu text-3xl font-extrabold leading-none text-brand-navy sm:text-4xl">
                        {totalPoints.toLocaleString('en')}
                    </p>
                </div>
                {recent > 0 ? (
                    <p className="border-2 border-black bg-brand-yellow px-2 py-0.5 font-mono text-xs font-black tabular-nums">
                        +{recent.toLocaleString('en')} this week
                    </p>
                ) : null}
            </div>

            {data.length > 1 ? (
                <div className="mt-auto h-28 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                            <XAxis dataKey="label" hide />
                            <YAxis hide domain={['dataMin', 'dataMax']} />
                            <Tooltip
                                cursor={{ stroke: '#0B101F', strokeWidth: 1, strokeDasharray: '3 3' }}
                                content={({ active, payload, label }) => active && payload?.length ? (
                                    <div className="border-2 border-black bg-brand-gray px-2 py-1 text-xs font-bold">
                                        {label} · <span className="font-mono">{Number(payload[0].value).toLocaleString('en')}</span>
                                    </div>
                                ) : null}
                            />
                            <Area type="monotone" dataKey="total" stroke="#0B101F" strokeWidth={2} fill="#E0F146" fillOpacity={0.55} isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : null}
        </section>
    )
}
