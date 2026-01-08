import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { useState } from "react"

interface HistoricalChartProps {
  data: {
    period: string
    income: number
    trees: number
    expenses: number
  }[]
}

export const HistoricalChart = ({ data }: HistoricalChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState({
    income: true,
    trees: true,
    expenses: true,
  })

  const config = {
    income: { label: "Total Income", color: "#10b981" }, // brand-yellow
    trees: { label: "Trees Financed", color: "#8b5cf6" }, // violet-500
    expenses: { label: "Total Expenses", color: "#f43f5e" } // rose-500
  }

  const handleLegendClick = (dataKey: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }))
  }

  const latestIncome = data[data.length - 1]?.income || 0
  const previousIncome = data[data.length - 2]?.income || 0
  const percentageChange = ((latestIncome - previousIncome) / previousIncome * 100).toFixed(1)

  return (
    <Card className="bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Growth Metrics</CardTitle>
        <p className="text-gray-400">Financial performance and environmental impact over time</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                dataKey="period" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#9ca3af" }}
                label={{ value: "Time Period", position: "insideBottom", offset: -5, fill: "#9ca3af" }}
              />
              <YAxis 
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M€`}
                label={{ value: "Financial Metrics (€)", angle: -90, position: "insideLeft", offset: 10, fill: "#9ca3af" }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k trees`}
                label={{ value: "Trees", angle: 90, position: "insideRight", offset: 10, fill: "#9ca3af" }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => config[value as keyof typeof config].label}
                onClick={(e) => {
                  if (e && e.dataKey) {
                    handleLegendClick(e.dataKey as keyof typeof visibleMetrics)
                  }
                }}
                wrapperStyle={{ cursor: 'pointer' }}
              />
              <ChartTooltip
                cursor={{ stroke: "#4b5563", strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-brand-yellow bg-brand-navy p-3 shadow-xl">
                      <p className="font-medium text-white mb-2">{label}</p>
                      {payload
                        .filter((entry: any) => visibleMetrics[entry.name as keyof typeof visibleMetrics])
                        .map((entry: any) => (
                          <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-400">
                              {config[entry.name as keyof typeof config].label}:
                            </span>
                            <span className="font-medium text-white">
                              {entry.name === 'trees' 
                                ? `${(entry.value / 1000).toFixed(1)}k trees`
                                : `${(entry.value / 1000000).toFixed(2)}M€`}
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="expenses"
                fill={config.expenses.color}
                fillOpacity={visibleMetrics.expenses ? 0.4 : 0}
                stroke={config.expenses.color}
                strokeOpacity={visibleMetrics.expenses ? 1 : 0}
                stackId="all"
              />
              <Area
                yAxisId="left"
                type="natural"
                dataKey="income"
                fill={config.income.color}
                fillOpacity={visibleMetrics.income ? 0.4 : 0}
                stroke={config.income.color}
                strokeOpacity={visibleMetrics.income ? 1 : 0}
                stackId="all"
              />
              <Area
                yAxisId="left"
                type="natural"
                dataKey="trees"
                fill={config.trees.color}
                fillOpacity={visibleMetrics.trees ? 0.4 : 0}
                stroke={config.trees.color}
                strokeOpacity={visibleMetrics.trees ? 1 : 0}
                stackId="all"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium text-white leading-none">
              Income {Number(percentageChange) > 0 ? "up" : "down"} by {Math.abs(Number(percentageChange))}% from previous period
              <TrendingUp className={`h-4 w-4 ${Number(percentageChange) > 0 ? "text-brand-yellow" : "text-red-500"}`} />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-400">
              {data[0]?.period} - {data[data.length - 1]?.period}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}