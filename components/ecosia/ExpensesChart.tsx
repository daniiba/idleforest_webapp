import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseData {
  period: string
  trees: number
  greenInvestments: number
  operationalCosts: number
  taxes: number
  marketing: number
}

interface ExpensesChartProps {
  data: ExpenseData[]
}

export const ExpensesChart = ({ data }: ExpensesChartProps) => {
  const [visibleSeries, setVisibleSeries] = useState({
    trees: true,
    greenInvestments: true,
    operationalCosts: true,
    taxes: true,
    marketing: true
  })

  const colors = {
    // Brand-aligned but more varied palette (yellow, amber, lime, mint, teal)
    trees: "#E0F146",            // brand yellow
    greenInvestments: "#FFD84D", // amber
    operationalCosts: "#B6F44B", // lime
    taxes: "#70E1A0",            // mint
    marketing: "#4FD1C5"         // teal
  }

  const labels = {
    trees: "Tree Planting",
    greenInvestments: "Green Investments",
    operationalCosts: "Operational Costs",
    taxes: "Taxes",
    marketing: "Marketing"
  }

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const dataWithPercentages = data.map(period => {
    const total = period.trees + period.greenInvestments + 
                 period.operationalCosts + period.taxes + period.marketing;
    return {
      period: period.period,
      treesPercent: (period.trees / total) * 100,
      greenInvestmentsPercent: (period.greenInvestments / total) * 100,
      operationalCostsPercent: (period.operationalCosts / total) * 100,
      taxesPercent: (period.taxes / total) * 100,
      marketingPercent: (period.marketing / total) * 100
    };
  });

  return (
    <Card className="bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Fund Allocation Over Time</CardTitle>
        <p className="text-gray-400">Distribution of expenses across different categories (click labels to toggle)</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleSeries(key as keyof typeof visibleSeries)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 hover:ring-2 hover:ring-brand-yellow/50 ${
                visibleSeries[key as keyof typeof visibleSeries] 
                  ? "opacity-100" 
                  : "opacity-50"
              }`}
              style={{ 
                backgroundColor: colors[key as keyof typeof colors],
                color: "#030712"
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataWithPercentages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                dataKey="period" 
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis 
                tick={{ fill: "#9ca3af" }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  labels[name.replace('Percent', '') as keyof typeof labels]
                ]}
                contentStyle={{
                  backgroundColor: "#0B101F",
                  border: "2px solid #E0F146",
                  borderRadius: "0.5rem",
                  color: "#ffffff"
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#ffffff" }}
              />
              {Object.entries(colors).map(([key, color]) => (
                visibleSeries[key as keyof typeof visibleSeries] && (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={`${key}Percent`}
                    stackId="1"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.6}
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}