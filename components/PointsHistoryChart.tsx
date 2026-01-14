"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import { TrendingUp } from "lucide-react"

interface PointsHistoryData {
    date: string
    total_points_snapshot: number
    points_gained_that_day: number
    member_count?: number
}

interface PointsHistoryChartProps {
    data: PointsHistoryData[]
    title?: string
    showMemberCount?: boolean
}

export function PointsHistoryChart({
    data,
    title = "Points History",
    showMemberCount = false
}: PointsHistoryChartProps) {
    const [showDailyGain, setShowDailyGain] = useState(false)

    if (!data || data.length === 0) {
        return null
    }

    // Sort by date and format for display
    const chartData = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(item => ({
            ...item,
            dateLabel: new Date(item.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            }),
            total: item.total_points_snapshot,
            daily: item.points_gained_that_day,
            members: item.member_count
        }))

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0) return null

        return (
            <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3">
                <p className="font-bold text-brand-navy mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600">{entry.name}:</span>
                        <span className="font-bold">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-yellow" />
                    <h3 className="text-lg font-bold uppercase tracking-wider">{title}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDailyGain(false)}
                        className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-all ${!showDailyGain
                            ? 'bg-brand-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        Total
                    </button>
                    <button
                        onClick={() => setShowDailyGain(true)}
                        className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-all ${showDailyGain
                            ? 'bg-brand-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        Daily
                    </button>
                </div>
            </div>

            <div className="h-[200px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FACC15" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#FACC15" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />
                        <XAxis
                            dataKey="dateLabel"
                            tick={{ fill: '#666', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fill: '#666', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                            width={45}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {showDailyGain ? (
                            <Area
                                type="monotone"
                                dataKey="daily"
                                name="Daily Points"
                                stroke="#22C55E"
                                strokeWidth={2}
                                fill="url(#colorDaily)"
                            />
                        ) : (
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Total Points"
                                stroke="#FACC15"
                                strokeWidth={2}
                                fill="url(#colorTotal)"
                            />
                        )}

                        {showMemberCount && !showDailyGain && chartData[0]?.members !== undefined && (
                            <Area
                                type="monotone"
                                dataKey="members"
                                name="Members"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#colorMembers)"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="mt-4 pt-4 border-t-2 border-black/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Current</p>
                    <p className="text-lg font-bold text-brand-navy">
                        {chartData[chartData.length - 1]?.total?.toLocaleString() || 0}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Latest Gain</p>
                    <p className="text-lg font-bold text-green-600">
                        +{chartData[chartData.length - 1]?.daily?.toLocaleString() || 0}
                    </p>
                </div>
                {showMemberCount && chartData[0]?.members !== undefined && (
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Members</p>
                        <p className="text-lg font-bold text-blue-600">
                            {chartData[chartData.length - 1]?.members?.toLocaleString() || 0}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
