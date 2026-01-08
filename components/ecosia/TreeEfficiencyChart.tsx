import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface TreeEfficiencyProps {
  data: {
    [key: string]: {
      treePayments: {
        projectsByCountry: {
          [country: string]: {
            amount: number
            projects: Array<{ name: string; amount: number }>
          }
        }
      }
      numberOfTreesFinanced: number
    }
  }
}

export const TreeEfficiencyChart = ({ data }: TreeEfficiencyProps) => {
  const efficiencyData = Object.entries(data).map(([period, periodData]) => {
    const countryAmounts = Object.entries(periodData.treePayments.projectsByCountry).map(([country, data]) => ({
      country,
      amount: data.amount
    }))
    
    return countryAmounts.map(item => ({
      country: item.country,
      moneyDeployed: item.amount
    }))
  }).flat()

  const totalAmounts = efficiencyData.reduce((acc, curr) => {
    if (!acc[curr.country]) {
      acc[curr.country] = curr.moneyDeployed
    } else {
      acc[curr.country] += curr.moneyDeployed
    }
    return acc
  }, {} as { [key: string]: number })

  const chartData = Object.entries(totalAmounts)
    .map(([country, amount]) => ({
      country,
      moneyDeployed: amount
    }))
    .sort((a, b) => b.moneyDeployed - a.moneyDeployed)

  return (
    <Card className="bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Money Deployed by Region (€M)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="country" 
                tick={{ fill: "#9ca3af" }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
                <YAxis 
                tickFormatter={(value) => (value/1000000).toFixed(0)+ 'M'}
                
                label={{ value: 'Euros (Millions)', angle: -90, position: 'insideLeft', fill: "#9ca3af" }}
                />
                <Tooltip
                  formatter={(value: number) => [`€${(value/1000000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}M`, 'Amount']}
                  contentStyle={{
                    backgroundColor: "#0B101F",
                    border: "2px solid #E0F146",
                    borderRadius: "0.5rem",
                    color: "#ffffff"
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#ffffff" }}
                />
              <Bar dataKey="moneyDeployed" fill="#E0F146" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}