export const ACQUISITION_COOKIE = 'idleforest_acquisition_id'
export const ACQUISITION_COOKIE_MAX_AGE = 90 * 24 * 60 * 60

export const ACQUISITION_QUERY_KEYS = [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'campaignid',
    'adgroupid',
    'creative',
    'device',
    'network',
    'matchtype',
] as const

export function normalizeAttributionId(value: string | null | undefined) {
    if (!value) return null
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
        ? value
        : null
}

export function hasAcquisitionParameters(searchParams: URLSearchParams) {
    return ACQUISITION_QUERY_KEYS.some((key) => Boolean(searchParams.get(key)))
}

export function cleanAttributionValue(value: unknown, maxLength = 500) {
    if (typeof value !== 'string') return null
    const normalized = value.trim()
    return normalized ? normalized.slice(0, maxLength) : null
}
