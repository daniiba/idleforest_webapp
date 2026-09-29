"use client";

import { BadgeCheck, Chrome, Star } from "lucide-react";
import { useTranslations } from "next-intl";

const trustItems = [
    {
        key: "security",
        icon: Chrome,
    },
    {
        key: "privacy",
        icon: Star,
    },
    {
        key: "performance",
        icon: BadgeCheck,
    },
] as const;

export default function HeroTrustSignals() {
    const t = useTranslations("Landing.hero");

    return (
        <ul className="flex flex-wrap gap-1.5">
            {trustItems.map(({ key, icon: Icon }) => (
                <li
                    key={key}
                    title={t(`${key}_detail`)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-1 pl-1.5 pr-3 text-[13px] font-semibold text-brand-navy shadow-sm"
                >
                    <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            key === "privacy" ? "bg-brand-yellow" : "bg-brand-navy text-brand-yellow"
                        }`}
                    >
                        <Icon className={`h-3 w-3 ${key === "privacy" ? "fill-current" : ""}`} aria-hidden="true" />
                    </span>
                    {t(`${key}_label`)}
                    <span className="sr-only">{t(`${key}_detail`)}</span>
                </li>
            ))}
        </ul>
    );
}
