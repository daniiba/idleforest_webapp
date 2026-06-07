export const SUPPORTED_LOCALES = ["en", "fr", "de", "es", "pt"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const TRANSLATED_ROUTES: Record<string, SupportedLocale[]> = {
    "/": ["en", "fr", "de", "es", "pt"],
    "/transparency": ["en", "fr", "de", "es", "pt"],
    "/business": ["en", "fr", "de", "es", "pt"],
    "/terms": ["en", "fr", "de", "es", "pt"],
    "/discord-bot": ["en", "fr", "de", "es", "pt"],
    "/use-idleforest-with-ecosia": ["en", "fr", "de", "es", "pt"],
    "/ecosia-alternatives": ["en", "fr", "de", "es", "pt"],
    "/tree-planting-extension": ["en", "fr", "de", "es", "pt"],
    "/is-ecosia-legit-safe": ["en", "fr", "de", "es", "pt"],
    "/ecosia": ["en", "fr", "de", "es", "pt"],
    "/reviews": ["en", "fr", "de", "es", "pt"],
    "/map": ["en", "fr", "de", "es", "pt"],
    "/teams": ["en", "fr", "de", "es", "pt"],
    "/report": ["en", "fr", "de", "es", "pt"],
    "/carbon-footprint": ["en", "fr", "de", "es", "pt"],
};

export const TRANSLATED_CARBON_SLUGS = [
    "chatgpt",
    "tiktok",
    "netflix",
    "instagram",
    "fortnite",
    "youtube",
    "minecraft",
    "zoom",
    "snapchat",
    "twitch",
    "microsoft-teams",
    "claude",
    "google-meet",
    "google-chrome",
    "gemini",
    "streaming",
    "ai",
    "digital-carbon-footprint",
] as const;

const LOCALE_PREFIX_PATTERN = /^\/(fr|de|es|pt)(?=\/|$)/;

export function pathWithoutLocale(pathname: string) {
    const stripped = pathname.replace(LOCALE_PREFIX_PATTERN, "") || "/";
    return stripped === "" ? "/" : stripped;
}

export function localePrefix(locale: string) {
    return locale === "en" ? "" : `/${locale}`;
}

export function canonicalUrl(pathWithoutLocaleValue: string, locale: string) {
    const path = pathWithoutLocaleValue === "/" ? "" : pathWithoutLocaleValue;
    return `https://www.idleforest.com${localePrefix(locale)}${path}`;
}

export function translatedLocalesForPath(path: string): SupportedLocale[] | undefined {
    const normalizedPath = path === "" ? "/" : path;
    const carbonSlugMatch = normalizedPath.match(/^\/carbon-footprint\/([^/]+)$/);

    if (carbonSlugMatch) {
        return TRANSLATED_CARBON_SLUGS.includes(carbonSlugMatch[1] as typeof TRANSLATED_CARBON_SLUGS[number])
            ? ["en", "fr", "de", "es", "pt"]
            : undefined;
    }

    return TRANSLATED_ROUTES[normalizedPath];
}

export function routeAlternates(path: string, locale: string) {
    const normalizedPath = path === "" ? "/" : path;
    const canonical = canonicalUrl(normalizedPath, locale);
    const availableLocales = translatedLocalesForPath(normalizedPath);

    if (!availableLocales) {
        return { canonical };
    }

    return {
        canonical,
        languages: {
            ...Object.fromEntries(
                availableLocales.map((availableLocale) => [
                    availableLocale,
                    canonicalUrl(normalizedPath, availableLocale),
                ])
            ),
            "x-default": canonicalUrl(normalizedPath, "en"),
        },
    };
}
