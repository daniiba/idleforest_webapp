import type { CarbonData } from "@/lib/carbon-data";
import { INDEXABLE_COMPARE_SLUGS } from "@/lib/carbon-compares";
import { SUPPORTED_LOCALES, canonicalUrl, localePrefix, routeAlternates } from "@/lib/i18n-routes";

const SITE_URL = "https://www.idleforest.com";

export const CARBON_LOCALES = SUPPORTED_LOCALES;

export function getLocalizedPath(path: string, locale: string): string {
    return `${localePrefix(locale)}${path === "/" ? "" : path}` || "/";
}

export function getLocalizedUrl(path: string, locale: string): string {
    return canonicalUrl(path === "" ? "/" : path, locale);
}

export function buildLocalizedAlternates(path: string, locale: string) {
    return routeAlternates(path === "" ? "/" : path, locale);
}

export function normalizeComparisonSlugs(slugA: string, slugB: string): [string, string] {
    return [slugA, slugB].sort((left, right) => left.localeCompare(right)) as [string, string];
}

export function buildComparisonSlug(slugA: string, slugB: string): string {
    const [normalizedA, normalizedB] = normalizeComparisonSlugs(slugA, slugB);
    return `${normalizedA}-vs-${normalizedB}`;
}

export function buildComparisonPath(slugA: string, slugB: string): string {
    return `/carbon-footprint/compare/${buildComparisonSlug(slugA, slugB)}`;
}

export function isIndexableComparison(slugA: string, slugB: string): boolean {
    return INDEXABLE_COMPARE_SLUGS.has(buildComparisonSlug(slugA, slugB));
}

export function getIndexableComparisonPaths(): string[] {
    return Array.from(INDEXABLE_COMPARE_SLUGS).map((comparisonSlug) => `/carbon-footprint/compare/${comparisonSlug}`);
}

export function getComparisonPaths(items: Pick<CarbonData, "slug" | "category">[]): string[] {
    const byCategory = items.reduce<Record<string, string[]>>((accumulator, item) => {
        accumulator[item.category] = accumulator[item.category] || [];
        accumulator[item.category].push(item.slug);
        return accumulator;
    }, {});

    return Object.values(byCategory).flatMap((slugs) => {
        const sortedSlugs = [...slugs].sort((left, right) => left.localeCompare(right));
        const paths: string[] = [];

        for (let i = 0; i < sortedSlugs.length; i += 1) {
            for (let j = i + 1; j < sortedSlugs.length; j += 1) {
                paths.push(buildComparisonPath(sortedSlugs[i], sortedSlugs[j]));
            }
        }

        return paths;
    });
}
