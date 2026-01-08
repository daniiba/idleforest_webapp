"use client";

import { CarbonData } from "@/lib/carbon-data";
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    LabelList,
    Cell
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface ComparisonGraphProps {
    data: CarbonData;
}

export function ComparisonGraph({ data }: ComparisonGraphProps) {
    const IDLE_FOREST_OFFSET_KG = 200; // Average per user per year

    const chartData = [
        {
            label: "IdleForest (1 Yr)",
            emissions: IDLE_FOREST_OFFSET_KG,
            fill: "#E0F146", // brand.yellow
            type: "idleforest"
        },
        {
            label: data.app_name,
            emissions: data.yearly_impact_kg,
            fill: "hsl(var(--destructive))",
            type: "app"
        },
    ];

    const chartConfig = {
        emissions: {
            label: "CO2 Emissions (kg)",
        },
        idleforest: {
            label: "IdleForest (1 Yr)",
            color: "#E0F146",
        },
        app: {
            label: data.app_name,
            color: "hsl(var(--destructive))",
        },
    } satisfies ChartConfig;

    return (
        <div className="bg-brand-gray border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-rethink-sans text-2xl font-extrabold mb-8 text-black text-center uppercase">
                Yearly Impact Comparison
            </h3>

            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        top: 40,
                        left: 20,
                        right: 20,
                        bottom: 20
                    }}
                >
                    <CartesianGrid vertical={false} stroke="#000000" strokeOpacity={0.1} strokeDasharray="4 4" />
                    <XAxis
                        dataKey="label"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tick={{ fill: "#000000", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-rethink-sans)" }}
                        interval={0}
                    />
                    <YAxis hide />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                        dataKey="emissions"
                        radius={[4, 4, 0, 0]}
                        barSize={100}
                        stroke="black"
                        strokeWidth={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList
                            dataKey="emissions"
                            position="top"
                            offset={10}
                            className="fill-black font-extrabold font-candu text-xl"
                            formatter={(value: number) => `${value.toFixed(1)} kg`}
                        />
                    </Bar>
                </BarChart>
            </ChartContainer>

            <div className="mt-8 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-brand-yellow border border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                    <span className="text-sm font-bold font-rethink-sans">IdleForest</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 border border-black rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                    <span className="text-sm font-bold font-rethink-sans">{data.app_name}</span>
                </div>
            </div>

            <p className="text-sm text-neutral-600 text-center mt-6 border-t-2 border-black/5 pt-4 font-medium">
                *IdleForest offsets ~200kg CO2/year on average per user.
            </p>
        </div>
    );
}
