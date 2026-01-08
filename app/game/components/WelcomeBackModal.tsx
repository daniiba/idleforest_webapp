import { motion, AnimatePresence } from "framer-motion";
import { TreeDeciduous, Clock, Zap } from "lucide-react";


interface WelcomeBackModalProps {
    open: boolean;
    onClose: () => void;
    timeAway: number; // in seconds
    treesEarned: number;
}

export const WelcomeBackModal = ({ open, onClose, timeAway, treesEarned }: WelcomeBackModalProps) => {
    // Format helper for time
    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${mins}m`;
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6"
                    >
                        {/* Header */}
                        <div className="bg-brand-green border-2 border-black p-4 mb-6 -mx-2 -mt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-2xl font-black uppercase text-center flex items-center justify-center gap-2">
                                <span className="text-3xl">👋</span> Welcome Back!
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <p className="text-center font-bold text-lg">
                                Your forest kept growing while you were gone.
                            </p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-100 border-2 border-black p-3 text-center">
                                    <div className="flex justify-center mb-1">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="text-xs font-bold uppercase text-gray-500 mb-1">Time Away</div>
                                    <div className="font-black text-xl">{formatTime(timeAway)}</div>
                                </div>

                                <div className="bg-gray-100 border-2 border-black p-3 text-center">
                                    <div className="flex justify-center mb-1">
                                        <Zap className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="text-xs font-bold uppercase text-gray-500 mb-1">Production Rate</div>
                                    <div className="font-black text-xl">50%</div>
                                </div>
                            </div>

                            {/* Reward Area */}
                            <div className="bg-green-50 border-2 border-black p-4 text-center">
                                <div className="text-sm font-bold uppercase text-green-800 mb-2">You Collected</div>
                                <div className="flex items-center justify-center gap-2 text-4xl font-black text-brand-green">
                                    <TreeDeciduous className="w-8 h-8 fill-current" />
                                    <span>{treesEarned.toLocaleString()}</span>
                                </div>
                                <div className="text-xs font-bold uppercase text-green-600 mt-1">Trees</div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={onClose}
                                className="w-full bg-black text-white py-4 font-black uppercase tracking-wider text-lg border-2 border-black hover:bg-gray-900 active:translate-y-1 active:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,1)]"
                            >
                                Collect Trees
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
