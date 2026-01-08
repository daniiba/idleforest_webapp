import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LeaderboardEntry {
    user_id: string;
    display_name: string;
    lifetime_trees: number;
}

interface LeaderboardModalProps {
    open: boolean;
    onClose: () => void;
    currentUserId?: string | null;
}

export function LeaderboardModal({ open, onClose, currentUserId }: LeaderboardModalProps) {
    const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchRankings();
        }
    }, [open]);

    const fetchRankings = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('game_rankings')
            .select('user_id, display_name, lifetime_trees')
            .order('lifetime_trees', { ascending: false })
            .limit(20);

        if (data) {
            setRankings(data);
        } else {
            console.error("Error fetching rankings", error);
        }
        setLoading(false);
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white border-4 border-black text-black p-0 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b-2 border-black flex justify-between items-center bg-brand-yellow">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-black fill-black" />
                            <h2 className="text-xl font-candu uppercase tracking-widest text-black">Top Foresters</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto p-4 flex-1 bg-white">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <span className="text-2xl animate-spin">⏳</span>
                                <span className="font-mono text-xs uppercase font-bold text-neutral-400">Loading rankings...</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {rankings.map((entry, index) => {
                                    const isCurrentUser = currentUserId === entry.user_id;
                                    const isTop3 = index < 3;
                                    let rankColor = "bg-neutral-100 border-neutral-300";
                                    if (index === 0) rankColor = "bg-yellow-100 border-yellow-400";
                                    if (index === 1) rankColor = "bg-slate-200 border-slate-400";
                                    if (index === 2) rankColor = "bg-amber-100 border-amber-400";

                                    return (
                                        <div
                                            key={entry.user_id}
                                            className={`
                                                flex items-center gap-3 p-2 border-2 
                                                ${isCurrentUser ? "border-black bg-brand-yellow/20" : "border-transparent border-b-neutral-200"}
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center font-candu text-lg border-2 rounded-sm
                                                ${rankColor}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold truncate text-sm">
                                                    {entry.display_name}
                                                    {isCurrentUser && <span className="ml-2 text-[10px] bg-black text-white px-1 rounded uppercase">You</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-sm">
                                                    {entry.lifetime_trees.toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-neutral-500 uppercase font-bold">Trees</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t-2 border-black bg-neutral-100 text-center text-[10px] text-neutral-500 font-mono uppercase">
                        Rankings update every minute
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
