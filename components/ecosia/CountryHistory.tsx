import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface HistoricalData {
    period: string
    money: number
}

interface ProjectDetails {
    startYear: number
    partners: string[]
    image?: {
        url: string
        alt: string
    }
}

interface CountryHistoryProps {
    name: string
    money: number
    historicalData: HistoricalData[]
    projectDetails: ProjectDetails
    onClose: () => void
}

export function CountryHistory({ name, money, historicalData, projectDetails, onClose }: CountryHistoryProps) {
    const config = {
        trees: { label: "Trees Planted", color: "#10b981" }
    }

    return (
        <div className="bg-brand-navy p-6 rounded-lg border-2 border-brand-yellow shadow-xl max-w-4xl mx-auto overflow-x-hidden">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{name}</h2>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-yellow/50 p-4 rounded-lg border border-brand-yellow">
                        <p className="text-sm text-gray-400">Total Money Invested</p>
                        <p className="text-xl font-semibold text-white">€{money.toLocaleString()}</p>
                    </div>
                    <div className="bg-brand-yellow/50 p-4 rounded-lg border border-brand-yellow">
                        <p className="text-sm text-gray-400">Start Year</p>
                        <p className="text-xl font-semibold text-white">{projectDetails.startYear}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Money Invested</h3>
                <div className="w-full overflow-hidden">
                    <ChartContainer config={config}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={historicalData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis 
                                    dataKey="period" 
                                    tick={{ fill: "#9ca3af" }}
                                    tickMargin={8}
                                />
                                <YAxis 
                                    tick={{ fill: "#9ca3af" }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    tickMargin={8}
                                />
                                <ChartTooltip
                                    content={({ payload, label }) => (
                                        <ChartTooltipContent
                                            payload={payload}
                                            label={label}
                                            formatter={(value: any) => {
                                                if (typeof value === 'number') {
                                                    return `${(value / 1000).toFixed(1)}k €`;
                                                }
                                                return String(value);
                                            }}
                                        />
                                    )}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="money"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: "#10b981", r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Project Partners</h3>
                <div className="flex flex-wrap gap-2">
                    {projectDetails.partners.map((partner) => (
                        <span 
                            key={partner} 
                            className="px-3 py-1 bg-brand-yellow text-brand-navy border border-brand-yellow rounded-full text-sm"
                        >
                            {partner}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}