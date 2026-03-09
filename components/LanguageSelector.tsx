"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function LanguageSelector({ variant = "default" }: { variant?: "default" | "mobile" }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageChange = (newLocale: string) => {
        // Replace the locale in the pathname
        const segments = pathname.split("/");
        // If the first segment is a locale, replace it. Otherwise prepend.
        // However, with next-intl middleware and 'as-needed' prefix, 
        // the pathname returned by usePathname ALREADY includes the locale if necessary?
        // Actually, next/navigation's usePathname returns the path *with* the locale if integrated.
        // BUT we need to be careful with next-intl.

        // Simplest way with next-intl is to construct the new path.
        // If default locale is hidden, current pathname might not have it.

        // 1. Remove any existing locale prefix robustly
        let cleanPath = pathname;
        for (const lang of languages) {
            // Match both exact locale paths like "/es" and prefixed paths like "/es/something"
            const regex = new RegExp(`^/${lang.code}(/|$)`);
            if (regex.test(cleanPath)) {
                cleanPath = cleanPath.replace(regex, '/');
                break;
            }
        }

        // Ensure cleanPath doesn't double-slash or stay empty
        if (cleanPath === "" || cleanPath === "//") cleanPath = "/";

        // 2. Add new locale prefix (unless it's default 'en')
        const newPath = newLocale === "en" ? cleanPath : `/${newLocale}${cleanPath === "/" ? "" : cleanPath}`;

        // Explicitly set the next-intl cookie so that returning to the default root ('/')
        // does not result in a redirection back to the previous locale.
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        window.location.href = newPath;
    };

    if (variant === "mobile") {
        return (
            <div className="flex flex-col gap-2 mt-4">
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Language</p>
                <div className="grid grid-cols-2 gap-2">
                    {languages.map((lang) => (
                        <Button
                            key={lang.code}
                            variant={locale === lang.code ? "default" : "outline"}
                            className={`justify-start gap-2 ${locale === lang.code ? "bg-brand-yellow text-black border-black" : "border-transparent bg-transparent"}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            {lang.name}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-black/5">
                    <span className="text-xl leading-none">
                        {languages.find((l) => l.code === locale)?.flag || "🌐"}
                    </span>
                    <span className="sr-only">Switch language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="gap-3 cursor-pointer"
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className={`flex-1 ${locale === lang.code ? "font-bold" : ""}`}>
                            {lang.name}
                        </span>
                        {locale === lang.code && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
