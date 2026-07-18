'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

type ChartDatum = Record<string, string | number | boolean | null | undefined>
type ChartDataProps = { data: ChartDatum[] }

const wauChartConfig = {
    wauAvg: { label: 'Weekly Active Users', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

const desktopChartConfig = {
    wauAvg: { label: 'Desktop WAU', color: 'hsl(217, 91%, 60%)' },
} satisfies ChartConfig

const growthChartConfig = {
    installs: { label: 'Installs', color: 'hsl(142, 76%, 45%)' },
    uninstalls: { label: 'Uninstalls', color: 'hsl(0, 72%, 51%)' },
    netGrowth: { label: 'Net Growth', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

const revenueChartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-4))' },
    arpu: { label: 'ARPU (€)', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

const projectionChartConfig = {
    organicWau: { label: 'Organic WAU', color: 'hsl(142, 76%, 45%)' },
    paidWau: { label: '+ Paid Users', color: 'hsl(217, 91%, 60%)' },
    breakEvenWau: { label: 'Break-Even WAU', color: 'hsl(0, 72%, 51%)' },
    revenue: { label: 'Projected Revenue', color: 'hsl(var(--chart-4))' },
    costs: { label: 'Monthly Costs', color: 'hsl(0, 72%, 51%)' },
} satisfies ChartConfig

export function ChromeWauChart({ data }: ChartDataProps) {
    return (
        <ChartContainer config={wauChartConfig} className="h-[200px] w-full">
            <AreaChart data={data} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={value => String(value).replace(' 2025', '').slice(0, 3)} fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="wauAvg" stroke="var(--color-wauAvg)" fill="var(--color-wauAvg)" fillOpacity={0.3} />
            </AreaChart>
        </ChartContainer>
    )
}

export function AcquisitionChart({ data }: ChartDataProps) {
    return (
        <ChartContainer config={growthChartConfig} className="h-[200px] w-full">
            <ComposedChart data={data} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={value => String(value).replace(' 2025', '').slice(0, 3)} fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="installs" fill="var(--color-installs)" radius={2} />
                <Bar dataKey="uninstalls" fill="var(--color-uninstalls)" radius={2} />
                <Line type="monotone" dataKey="netGrowth" stroke="var(--color-netGrowth)" strokeWidth={2} />
            </ComposedChart>
        </ChartContainer>
    )
}

export function DesktopWauChart({ data }: ChartDataProps) {
    return (
        <ChartContainer config={desktopChartConfig} className="h-[200px] w-full">
            <BarChart data={data} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={value => String(value).replace(' 2026', '').slice(0, 3)} fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="wauAvg" fill="var(--color-wauAvg)" radius={4} />
            </BarChart>
        </ChartContainer>
    )
}

export function RevenueChart({ data }: ChartDataProps) {
    return (
        <ChartContainer config={revenueChartConfig} className="h-[200px] w-full">
            <ComposedChart data={data} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={value => String(value).replace(' 2025', '').slice(0, 3)} fontSize={11} />
                <YAxis yAxisId="left" orientation="left" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue (€)" fill="var(--color-revenue)" radius={2} />
                <Line yAxisId="right" type="monotone" dataKey="arpu" name="ARPU (€)" stroke="var(--color-arpu)" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
        </ChartContainer>
    )
}

export function ProjectionChart({ data }: ChartDataProps) {
    return (
        <ChartContainer config={projectionChartConfig} className="h-[280px] w-full">
            <ComposedChart data={data} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="organicWau" name="Organic WAU" stackId="wau" fill="var(--color-organicWau)" radius={[0, 0, 2, 2]} />
                <Bar dataKey="paidNeeded" name="Paid Users Needed" stackId="wau" fill="var(--color-paidWau)" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="breakEvenWau" name="Break-Even WAU" stroke="var(--color-breakEvenWau)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
        </ChartContainer>
    )
}
