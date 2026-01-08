import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomAmountModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    baseAmount: number;
    inputValue: string;
    onInputChange: (val: string) => void;
}

export function CustomAmountModal({ open, onClose, onConfirm, baseAmount, inputValue, onInputChange }: CustomAmountModalProps) {
    if (!open) return null;

    const handleCustomAmountSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const val = parseInt(inputValue);
        if (!isNaN(val) && val > 0) {
            onConfirm(val);
        }
    };

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white border-4 border-black text-black p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
                >
                    <h2 className="text-xl font-candu uppercase tracking-widest mb-4">Set Buy Amount</h2>

                    <form onSubmit={handleCustomAmountSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Amount</label>
                            <Input
                                type="number"
                                min="1"
                                value={inputValue}
                                onChange={(e) => onInputChange(e.target.value)}
                                className="font-mono text-lg font-bold border-2 border-black focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-yellow"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 border-2 border-black font-bold uppercase hover:bg-neutral-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-brand-yellow text-black border-2 border-black font-bold uppercase hover:bg-brand-yellow/80"
                            >
                                Confirm
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
