"use client";

import { useState, useEffect } from "react";
import { CarbonData } from "@/lib/carbon-data";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Leaf, Trees } from "lucide-react";

interface CalculatorWidgetProps {
    data: CarbonData;
}

export function CalculatorWidget({ data }: CalculatorWidgetProps) {
    const [hoursPerWeek, setHoursPerWeek] = useState(
        typeof data.avg_usage_hours_day === "number"
            ? Math.round(data.avg_usage_hours_day * 7)
            : 10
    );

    const [yearlyCo2Kg, setYearlyCo2Kg] = useState(0);
    const [treesNeeded, setTreesNeeded] = useState(0);

    useEffect(() => {
        const hoursPerYear = hoursPerWeek * 52;
        const co2Grams = hoursPerYear * data.co2_per_hour_grams;
        const co2Kg = co2Grams / 1000;
        const trees = Math.ceil(co2Kg / 20); // Assuming 20kg per tree

        setYearlyCo2Kg(Math.round(co2Kg * 10) / 10);
        setTreesNeeded(trees);
    }, [hoursPerWeek, data.co2_per_hour_grams]);

    if (data.app_name === "Bitcoin (1 Tx)") {
        return (
            <div className="bg-brand-navy border border-brand-yellow/20 rounded-xl p-6 text-white shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Carbon Impact
                </h3>
                <p className="text-gray-300 mb-4">
                    Bitcoin transactions are calculated per usage, not per hour.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-brand-red mb-1">{data.yearly_impact_kg} kg</div>
                        <div className="text-sm text-gray-400">CO2 per Transaction</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-brand-green mb-1">{data.trees_to_offset}</div>
                        <div className="text-sm text-gray-400">Trees to Offset 1 Tx</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-navy border border-black rounded-lg p-8 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-rethink-sans text-2xl font-bold mb-6 flex items-center gap-2 text-brand-yellow">
                Calculate Your Footprint
            </h3>

            <div className="mb-8">
                <label className="text-sm text-gray-400 mb-2 block font-medium">
                    How many hours do you use {data.app_name} per week?
                </label>
                <div className="flex items-center gap-4">
                    <Slider
                        value={[hoursPerWeek]}
                        onValueChange={(vals) => setHoursPerWeek(vals[0])}
                        max={168}
                        step={1}
                        className="flex-1"
                    />
                    <div className="w-24">
                        <Input
                            type="number"
                            value={hoursPerWeek}
                            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                            className="bg-black/20 border-white/20 text-white text-center h-10 font-bold text-lg"
                        />
                    </div>
                    <span className="text-gray-400 font-medium">hrs/week</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center border border-white/10">
                    <div className="p-3 bg-red-500/10 rounded-full mb-3 text-red-400">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div className="font-candu text-4xl font-bold text-white mb-1">
                        {yearlyCo2Kg} <span className="font-rethink-sans text-xl text-gray-400 font-normal">kg</span>
                    </div>
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Yearly CO2 Emissions</div>
                </div>

                <div className="bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center text-center border-2 border-brand-green/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-green/5"></div>
                    <div className="p-3 bg-brand-green/10 rounded-full mb-3 text-brand-green relative z-10">
                        <Trees className="w-6 h-6" />
                    </div>
                    <div className="font-candu text-4xl font-bold text-brand-yellow mb-1 relative z-10">
                        {treesNeeded} <span className="font-rethink-sans text-xl text-gray-400 font-normal">trees</span>
                    </div>
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wide relative z-10">Needed to Offset</div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-300 bg-white/5 p-4 rounded-lg font-medium italic border border-white/10">
                "{data.idleforest_pitch}"
            </div>
        </div>
    );
}
