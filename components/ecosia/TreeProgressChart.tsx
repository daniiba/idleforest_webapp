"use client"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ReferenceLine } from "recharts"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

interface TreeProgressChartProps {
  data: {
    [key: string]: {
      numberOfTreesFinanced: number
      treeSurplusPercent: number
      treePayments: {
        paidToProjects: number
      }
    }
  }
}

export const TreeProgressChart = ({ data }: TreeProgressChartProps) => {
  const [visibleAreas, setVisibleAreas] = useState({
    surplusPercent: true,
    treesPerEuro: true,
  })

  const chartData = Object.entries(data).map(([period, periodData]) => {
    const treesPerEuro = periodData.numberOfTreesFinanced / periodData.treePayments.paidToProjects;
    const surplusValue = periodData.treeSurplusPercent - 80; // Adjust relative to 80% threshold
    return {
      period,
      treesPerEuro: visibleAreas.treesPerEuro 
        ? (isNaN(treesPerEuro) ? 0 : Math.min(Number(treesPerEuro.toFixed(2)), 100))
        : 0,
      surplusPercent: visibleAreas.surplusPercent 
        ? surplusValue
        : 0
    }
  })

  const config = {
    surplusPercent: {
      label: "Target Surplus",
      color: "#8b5cf6", // violet-500
      description: "Percentage above planting target"
    },
    treesPerEuro: {
      label: "Planting Efficiency",
      color: "#f43f5e", // rose-500
      description: "Trees planted per euro spent"
    }
  }

  type ConfigKey = keyof typeof config;

  const handleLegendClick = (entry: any) => {
    const dataKey = Object.keys(config).find(key => config[key as ConfigKey].label === entry.value) as ConfigKey | undefined;
    if (dataKey) {
      setVisibleAreas(prev => ({
        ...prev,
        [dataKey]: !prev[dataKey]
      }))
    }
  }

  return (
    <Card className="bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Quarterly Planting Efficiency Metrics</CardTitle>
        <div className="space-y-2">
          <p className="text-gray-400">Visualizing planting efficiency and target surplus metrics over time</p>
          <div className="text-sm space-y-1 text-gray-400">
            <p><span className="font-medium text-white">{config.surplusPercent.label}:</span> {config.surplusPercent.description}</p>
            <p><span className="font-medium text-white">{config.treesPerEuro.label}:</span> {config.treesPerEuro.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
            className="h-[400px] w-full"
          >
            <CartesianGrid vertical={false} stroke="#1f2937" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis 
              orientation="right"
              label={{ 
                value: 'Efficiency & Target Surplus', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: "#9ca3af" }
              }}
              domain={[0, 100]}
              tickFormatter={(value) => value.toFixed(0)}
              tick={{ fill: "#9ca3af" }}
            />
            <ReferenceLine 
              y={0}
              stroke="#374151"
              strokeDasharray="3 3"
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (!value || isNaN(value)) {
                  return ["No data available", name];
                }
                switch (name) {
                    case "Target Surplus":
                    return [`${value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`} from 80% target`, config.surplusPercent.description];
                  case "Planting Efficiency":
                    return [`${value.toFixed(2)} trees per euro`, config.treesPerEuro.description];
                  default:
                    return [value, name];
                }
              }}
              contentStyle={{
                backgroundColor: "#0B101F",
                border: "2px solid #E0F146",
                borderRadius: "0.5rem",
                color: "#ffffff"
              }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#ffffff" }}
            />
            <Area
              dataKey="surplusPercent"
              type="monotone"
              fill={config.surplusPercent.color}
              fillOpacity={0.4}
              stroke={config.surplusPercent.color}
              name={config.surplusPercent.label}
            />
            <Area
              dataKey="treesPerEuro"
              type="monotone"
              fill={config.treesPerEuro.color}
              fillOpacity={0.4}
              stroke={config.treesPerEuro.color}
              name={config.treesPerEuro.label}
            />

            <Legend onClick={handleLegendClick} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}