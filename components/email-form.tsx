"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { submitEmail } from "@/app/actions";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { cn } from "@/lib/utils";

export function EmailForm({
    className,
    buttonClassName,
    inputClassName
}: {
    className?: string;
    buttonClassName?: string;
    inputClassName?: string;
}) {
    const [email, setEmail] = useState("");
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isMobile, isDesktop, isChrome, isEdge, isSafari, isFirefox, isMac, isWindows } = useDeviceDetection();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubmitting(true);
            try {
                const deviceInfo = { isMobile, isDesktop, isChrome, isEdge, isSafari, isFirefox, isMac, isWindows };
                const result = await submitEmail(email, deviceInfo);

                if (result.success) {
                    setEmailSubmitted(true);
                    setEmail("");
                } else {
                    console.error("Failed to submit email:", result.error);
                }
            } catch (error) {
                console.error("Error submitting email:", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (emailSubmitted) {
        return (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Thanks! We'll keep you updated.
            </div>
        );
    }

    return (
        <form onSubmit={handleEmailSubmit} className={cn("flex gap-2", className)}>
            <Input
                type="email"
                placeholder="Email for updates"
                className={cn("bg-white text-black border-neutral-300", inputClassName)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Button
                type="submit"
                disabled={isSubmitting}
                className={cn("bg-brand-navy text-brand-yellow hover:bg-black disabled:opacity-50", buttonClassName)}
            >
                {isSubmitting ? "Sending..." : "Notify Me"}
            </Button>
        </form>
    );
}
