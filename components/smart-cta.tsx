"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Chrome, Monitor, Apple, Globe, Download, ArrowRight } from "lucide-react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { cn } from "@/lib/utils";
import { EmailForm } from "@/components/email-form";

export function SmartCTA({
    className,
    showLearnMore,
    forceVertical = false,
    buttonVariant = "default", // "default" (yellow bg) or "inverse" (black bg)
    onDarkBackground = false
}: {
    className?: string;
    showLearnMore?: boolean;
    forceVertical?: boolean;
    buttonVariant?: "default" | "inverse";
    onDarkBackground?: boolean;
}) {
    const { isMobile, isDesktop, isChrome, isEdge, isMac } = useDeviceDetection();

    const buttonClass = buttonVariant === "inverse"
        ? "w-full sm:w-auto bg-black text-brand-yellow font-bold hover:bg-black/80 rounded-full px-8 py-6 justify-center"
        : "w-full sm:w-auto bg-brand-yellow text-black font-bold hover:text-brand-yellow rounded-full px-8 py-6 justify-center";

    return (
        <div className={cn("flex flex-col w-full sm:w-auto items-stretch gap-3", className)}>
            {/* Mobile Chrome: Show "Add to Desktop" */}
            {isMobile && isChrome && (
                <Button asChild className={buttonClass}>
                    <Link
                        href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                        className="flex items-center justify-center w-full sm:w-auto"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Chrome className="h-8 w-8 mr-2" />
                        Add to Desktop
                    </Link>
                </Button>
            )}

            {/* Other Mobile: Show Not Available + Discord/Email */}
            {isMobile && !isChrome && (
                <div className="space-y-4 w-full">
                    <div className="bg-neutral-900/10 p-4 rounded-lg border border-neutral-900/20">
                        <p className="font-bold mb-2">Not available on this device</p>
                        <p className="text-sm mb-4 opacity-90">
                            IdleForest is currently available for Desktop (Windows/Mac) and as a browser extension.
                        </p>
                        <div className="flex flex-col gap-3">


                            <EmailForm
                                buttonClassName={onDarkBackground ? "bg-brand-yellow text-brand-navy hover:bg-white" : undefined}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop: Show Desktop App Download */}
            {isDesktop && (
                <div className={`flex flex-col ${forceVertical ? '' : 'sm:flex-row'} w-full sm:w-auto items-stretch ${forceVertical ? '' : 'sm:items-center'} gap-3`}>
                    <div className="relative inline-block w-full sm:w-fit sm:self-center">
                        <Button asChild className={buttonClass}>
                            <Link
                                href={
                                    isMac
                                        ? "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip"
                                        : "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe"
                                }
                                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {isMac ? (
                                    <Apple className="h-8 w-8" />
                                ) : (
                                    <Monitor className="h-8 w-8" />
                                )}
                                {isMac ? "Download for Mac" : "Download for Windows"}
                            </Link>
                        </Button>
                        {/* Angled overlay badge */}
                        <div className="absolute -top-3 -right-4 bg-brand-navy text-brand-yellow px-3 py-1 text-xs font-bold whitespace-nowrap shadow-lg" style={{ transform: 'rotate(12deg)', transformOrigin: 'bottom left' }}>
                            3x TREES
                        </div>
                    </div>

                    {/* Desktop Chrome/Edge: Show Extension Button */}
                    {(isChrome || isEdge) && (
                        <>
                            {!forceVertical && <span className="font-bold text-lg hidden sm:block">or</span>}
                            {forceVertical && <span className="font-bold text-lg text-center">or</span>}
                            <Button asChild className={buttonClass}>
                                <Link
                                    href={
                                        isEdge
                                            ? "https://microsoftedge.microsoft.com/addons/detail/idle-forest-plant-trees/cccklibfpcangcakgpllhcohldgcginb"
                                            : "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                                    }
                                    className="flex items-center justify-center w-full sm:w-auto"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {isEdge ? (
                                        <Globe className="h-8 w-8" />
                                    ) : (
                                        <Chrome className="h-8 w-8" />
                                    )}
                                    {" "}
                                    {isEdge ? "Add to Edge - It's free" : "Add to Chrome - It's free"}
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            )}

            {/* Learn More Link */}
            {showLearnMore && (
                <div className="flex justify-center w-full sm:w-auto">
                    <Button asChild variant="link" className="text-white hover:text-brand-yellow p-0 h-auto font-semibold">
                        <Link href="/" className="flex items-center gap-2">
                            Learn how it works <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
