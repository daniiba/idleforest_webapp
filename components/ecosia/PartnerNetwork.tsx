import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface PartnerNetworkProps {
  data: {
    [key: string]: {
      treePayments: {
        projectsByCountry: {
          [country: string]: {
            projects: Array<{ name: string; amount: number }>
          }
        }
      }
    }
  }
}

export const PartnerNetwork = ({ data }: PartnerNetworkProps) => {
  const partnerData = Object.values(data).reduce((acc, { treePayments }) => {
    Object.values(treePayments.projectsByCountry).forEach(country => {
      country.projects.forEach(project => {
        if (!acc[project.name]) {
          acc[project.name] = { amount: 0, countries: new Set() }
        }
        acc[project.name].amount += project.amount
      })
    })
    return acc
  }, {} as { [key: string]: { amount: number; countries: Set<string> } })

  const chartData = Object.entries(partnerData)
    .map(([name, data]) => ({
      name,
      value: data.amount
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const COLORS = [
    '#E0F146', // brand yellow
    '#FFD84D', // amber
    '#B6F44B', // lime
    '#70E1A0', // mint
    '#4FD1C5', // teal
    '#F5B94A', // warm amber
    '#A5F3FC', // light cyan accent
    '#86EFAC', // light mint
    '#60A5FA', // soft blue accent
    '#F472B6', // soft pink accent
  ]

  return (
    <Card className="bg-brand-navy backdrop-blur-sm border-2 border-brand-yellow">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Top Project Partners by Investment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => 
                  `${name} (€${(value/1000000).toFixed(1)}M)`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `€${(value/1000000).toFixed(1)}M`}
                contentStyle={{
                  backgroundColor: "#0B101F",
                  border: "2px solid #E0F146",
                  borderRadius: "0.5rem",
                  color: "#ffffff"
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#ffffff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}