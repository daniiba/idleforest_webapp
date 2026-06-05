export const SILVEIRA_COMPANY_SLUG = 'silveira'
export const WASTEFREE_COMPANY_SLUG = 'wastefree-planet'
export const PLANETWILD_COMPANY_SLUG = 'planetwild'

const silveiraCompanyAliases = new Set(['silveira', 'silveiratech', 'silveiratechpt'])
const wastefreeCompanyAliases = new Set(['wastefreeplanet', 'wastefree', 'wastefreeplanetorg'])
const planetwildCompanyAliases = new Set(['planetwild', 'planetwildgmbh'])

export function normalizeCompanyIdentity(value: string | null | undefined) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

export function isSilveiraCompanyValue(value: string | null | undefined) {
    const normalizedValue = normalizeCompanyIdentity(value)

    return Array.from(silveiraCompanyAliases).some((alias) => normalizedValue === alias || normalizedValue.includes(alias))
}

export function isWastefreeCompanyValue(value: string | null | undefined) {
    const normalizedValue = normalizeCompanyIdentity(value)

    return Array.from(wastefreeCompanyAliases).some((alias) => normalizedValue === alias || normalizedValue.includes(alias))
}

export function isPlanetwildCompanyValue(value: string | null | undefined) {
    const normalizedValue = normalizeCompanyIdentity(value)

    return Array.from(planetwildCompanyAliases).some((alias) => normalizedValue === alias || normalizedValue.includes(alias))
}

export function isSilveiraCompanySlug(slug: string | null | undefined) {
    return silveiraCompanyAliases.has(normalizeCompanyIdentity(slug))
}

export function isWastefreeCompanySlug(slug: string | null | undefined) {
    return wastefreeCompanyAliases.has(normalizeCompanyIdentity(slug))
}

export function isPlanetwildCompanySlug(slug: string | null | undefined) {
    return planetwildCompanyAliases.has(normalizeCompanyIdentity(slug))
}

export function getCanonicalSilveiraCompanySlug(slug: string | null | undefined) {
    return isSilveiraCompanySlug(slug) ? SILVEIRA_COMPANY_SLUG : String(slug || '')
}

export function getCanonicalWastefreeCompanySlug(slug: string | null | undefined) {
    return isWastefreeCompanySlug(slug) ? WASTEFREE_COMPANY_SLUG : String(slug || '')
}

export function getCanonicalPlanetwildCompanySlug(slug: string | null | undefined) {
    return isPlanetwildCompanySlug(slug) ? PLANETWILD_COMPANY_SLUG : String(slug || '')
}

export function getCanonicalCompanySlug(slug: string | null | undefined) {
    if (isSilveiraCompanySlug(slug)) return SILVEIRA_COMPANY_SLUG
    if (isWastefreeCompanySlug(slug)) return WASTEFREE_COMPANY_SLUG
    if (isPlanetwildCompanySlug(slug)) return PLANETWILD_COMPANY_SLUG

    return String(slug || '')
}

export function getCompanySlugLookupCandidates(slug: string) {
    const canonicalSlug = getCanonicalCompanySlug(slug)

    return Array.from(new Set([canonicalSlug, slug].filter(Boolean)))
}

export function isSilveiraCompanyIdentity(company: { name?: string | null; slug?: string | null; website?: string | null }, websiteHostname?: string | null) {
    return [company.name, company.slug, company.website, websiteHostname].some(isSilveiraCompanyValue)
}

export function isWastefreeCompanyIdentity(company: { name?: string | null; slug?: string | null; website?: string | null }, websiteHostname?: string | null) {
    return [company.name, company.slug, company.website, websiteHostname].some(isWastefreeCompanyValue)
}

export function isPlanetwildCompanyIdentity(company: { name?: string | null; slug?: string | null; website?: string | null }, websiteHostname?: string | null) {
    return [company.name, company.slug, company.website, websiteHostname].some(isPlanetwildCompanyValue)
}
