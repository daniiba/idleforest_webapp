"use client";

import { Gauge, Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const trustItems = [
    {
        key: "security",
        icon: ShieldCheck,
    },
    {
        key: "privacy",
        icon: Lock,
    },
    {
        key: "performance",
        icon: Gauge,
    },
] as const;

export default function HeroTrustSignals() {
    const t = useTranslations("Landing.hero");

    return (
        <div className="grid gap-4 border-t border-black/10 pt-4 text-neutral-800 sm:grid-cols-3 sm:gap-0">
            {trustItems.map(({ key, icon: Icon }, index) => (
                <div
                    key={key}
                    className={`sm:px-4 ${index === 0 ? "sm:pl-0" : "sm:border-l sm:border-black/10"} ${index === trustItems.length - 1 ? "sm:pr-0" : ""}`}
                >
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                        <Icon className="h-3.5 w-3.5 text-black" />
                        <span>{t(`${key}_label`)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6">
                        {t(`${key}_detail`)}
                    </p>
                </div>
            ))}
        </div>
    );
}
