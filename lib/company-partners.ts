export const SILVEIRA_COMPANY_SLUG = 'silveira'

const silveiraCompanyAliases = new Set(['silveira', 'silveiratech', 'silveiratechpt'])

export function normalizeCompanyIdentity(value: string | null | undefined) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

export function isSilveiraCompanyValue(value: string | null | undefined) {
    const normalizedValue = normalizeCompanyIdentity(value)

    return Array.from(silveiraCompanyAliases).some((alias) => normalizedValue === alias || normalizedValue.includes(alias))
}

export function isSilveiraCompanySlug(slug: string | null | undefined) {
    return silveiraCompanyAliases.has(normalizeCompanyIdentity(slug))
}

export function getCanonicalSilveiraCompanySlug(slug: string | null | undefined) {
    return isSilveiraCompanySlug(slug) ? SILVEIRA_COMPANY_SLUG : String(slug || '')
}

export function getCompanySlugLookupCandidates(slug: string) {
    const canonicalSlug = getCanonicalSilveiraCompanySlug(slug)

    return Array.from(new Set([canonicalSlug, slug].filter(Boolean)))
}

export function isSilveiraCompanyIdentity(company: { name?: string | null; slug?: string | null; website?: string | null }, websiteHostname?: string | null) {
    return [company.name, company.slug, company.website, websiteHostname].some(isSilveiraCompanyValue)
}
