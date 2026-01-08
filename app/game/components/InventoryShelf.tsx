import Image from "next/image";
import { GameState } from "../reducer";

interface InventoryShelfProps {
    state: GameState;
    finalAutoBreakdown: Record<string, number>;
    finalAutoProduction: number;
}

export function InventoryShelf({ state, finalAutoBreakdown, finalAutoProduction }: InventoryShelfProps) {
    return (
        <div className="bg-neutral-100 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold font-candu mb-4 uppercase border-b-2 border-black pb-2 inline-block">Your Forest <span className="text-neutral-400 text-sm ml-2 font-mono">Inventory</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.upgrades.filter(u => u.level > 0 && u.type === 'auto').map(upgrade => {
                    const itemRate = finalAutoBreakdown[upgrade.id] || 0;
                    const percent = finalAutoProduction > 0 ? (itemRate / finalAutoProduction) * 100 : 0;
                    const lifetime = state.itemLifetimeProduction[upgrade.id] || 0;

                    return (
                        <div key={'inv-' + upgrade.id} className="bg-white border text-black p-2 flex items-start gap-2 rounded shadow-sm">
                            <div className="bg-brand-yellow/20 p-1 rounded mt-1">
                                <Image src={upgrade.iconPath} width={24} height={24} alt={upgrade.name} className="pixelated" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-xs leading-tight truncate">{upgrade.name}</span>
                                    <span className="font-black text-lg text-neutral-200">x{upgrade.level}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5">
                                    <div>
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider leading-none">Rate</div>
                                        <div className="text-sm font-mono font-bold">{itemRate.toFixed(1)}/s</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider leading-none">Contrib</div>
                                        <div className="text-sm font-mono font-bold text-green-600">{percent.toFixed(1)}%</div>
                                    </div>
                                </div>
                                <div className="mt-1 border-t border-dashed border-neutral-200 pt-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-neutral-400">Total Produced:</span>
                                        <span className="font-mono">{Math.floor(lifetime).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {state.upgrades.every(u => u.level === 0 || u.type !== 'auto') && (
                    <div className="col-span-2 text-neutral-400 italic text-sm py-4 text-center">
                        Start planting to earn upgrades...
                    </div>
                )}
            </div>
        </div>
    );
}
