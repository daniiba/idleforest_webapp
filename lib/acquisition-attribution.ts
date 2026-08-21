import { createAdminClient } from '@/lib/supabase/admin'
import {
    ACQUISITION_COOKIE,
    ACQUISITION_COOKIE_MAX_AGE,
    cleanAttributionValue,
    hasAcquisitionParameters,
    normalizeAttributionId,
} from '@/lib/acquisition-constants'

export {
    ACQUISITION_COOKIE,
    ACQUISITION_COOKIE_MAX_AGE,
    cleanAttributionValue,
    hasAcquisitionParameters,
    normalizeAttributionId,
}

export type DesktopNodeForAttribution = {
    node_identifier: string | null
    platform: string | null
    total_requests: number | null
    created_at: string | null
    opt_in?: boolean | null
}

export async function claimDesktopNodeForAttribution({
    attributionId,
    node,
    userId,
}: {
    attributionId: string
    node: DesktopNodeForAttribution
    userId?: string | null
}) {
    const normalizedId = normalizeAttributionId(attributionId)
    if (!normalizedId || !node.node_identifier || !['win32', 'darwin', 'linux'].includes(node.platform || '')) {
        return { claimed: false, reason: 'invalid-attribution-or-node' } as const
    }

    const admin = createAdminClient()
    const { data: attribution, error: attributionError } = await admin
        .from('acquisition_attributions')
        .select('id, first_seen_at, node_identifier')
        .eq('id', normalizedId)
        .maybeSingle()

    if (attributionError || !attribution) {
        return { claimed: false, reason: 'attribution-not-found' } as const
    }

    if (attribution.node_identifier && attribution.node_identifier !== node.node_identifier) {
        return { claimed: false, reason: 'already-claimed' } as const
    }

    const firstSeenAt = new Date(attribution.first_seen_at).getTime()
    const nodeCreatedAt = node.created_at ? new Date(node.created_at).getTime() : Number.NaN
    const attributionWindowStart = firstSeenAt - 10 * 60 * 1000
    const attributionWindowEnd = firstSeenAt + 7 * 24 * 60 * 60 * 1000

    if (!Number.isFinite(nodeCreatedAt) || nodeCreatedAt < attributionWindowStart || nodeCreatedAt > attributionWindowEnd) {
        return { claimed: false, reason: 'node-outside-attribution-window' } as const
    }

    const connectedAt = node.created_at || new Date().toISOString()
    const { error: updateError } = await admin
        .from('acquisition_attributions')
        .update({
            user_id: userId || undefined,
            node_identifier: node.node_identifier,
            node_platform: node.platform,
            node_connected_at: connectedAt,
            node_baseline_requests: Math.max(0, node.total_requests || 0),
            updated_at: new Date().toISOString(),
        })
        .eq('id', normalizedId)
        .is('node_identifier', null)

    if (updateError) {
        console.error('Failed to claim desktop acquisition attribution', updateError)
        return { claimed: false, reason: 'claim-failed' } as const
    }

    await admin.from('acquisition_conversions').upsert({
        attribution_id: normalizedId,
        milestone: 'desktop_node_connected',
        conversion_at: connectedAt,
        conversion_value: 0,
        currency: 'EUR',
        order_id: `${normalizedId}:desktop_node_connected`,
    }, { onConflict: 'attribution_id,milestone' })

    return { claimed: true } as const
}

export async function recordAcquisitionDownload({
    attributionId,
    platform,
    referrer,
    userAgent,
}: {
    attributionId: string
    platform: 'win32' | 'darwin' | 'linux'
    referrer?: string | null
    userAgent?: string | null
}) {
    const now = new Date().toISOString()
    const admin = createAdminClient()
    const { data: updated, error: updateError } = await admin
        .from('acquisition_attributions')
        .update({ download_clicked_at: now, intended_platform: platform, updated_at: now })
        .eq('id', attributionId)
        .select('id')

    if (updateError || updated?.length) return

    let referrerUrl: URL | null = null
    try {
        referrerUrl = referrer ? new URL(referrer) : null
    } catch {
        referrerUrl = null
    }

    const params = referrerUrl?.searchParams
    const { error: insertError } = await admin.from('acquisition_attributions').insert({
        id: attributionId,
        gclid: cleanAttributionValue(params?.get('gclid'), 250),
        gbraid: cleanAttributionValue(params?.get('gbraid'), 250),
        wbraid: cleanAttributionValue(params?.get('wbraid'), 250),
        utm_source: cleanAttributionValue(params?.get('utm_source'), 120),
        utm_medium: cleanAttributionValue(params?.get('utm_medium'), 120),
        utm_campaign: cleanAttributionValue(params?.get('utm_campaign'), 250),
        utm_term: cleanAttributionValue(params?.get('utm_term'), 250),
        utm_content: cleanAttributionValue(params?.get('utm_content'), 250),
        campaign_id: cleanAttributionValue(params?.get('campaignid'), 80),
        ad_group_id: cleanAttributionValue(params?.get('adgroupid'), 80),
        creative_id: cleanAttributionValue(params?.get('creative'), 80),
        device: cleanAttributionValue(params?.get('device'), 30),
        network: cleanAttributionValue(params?.get('network'), 30),
        match_type: cleanAttributionValue(params?.get('matchtype'), 30),
        landing_path: referrerUrl ? `${referrerUrl.pathname}${referrerUrl.search}` : null,
        referrer: cleanAttributionValue(referrer, 1000),
        user_agent: cleanAttributionValue(userAgent, 1000),
        intended_platform: platform,
        download_clicked_at: now,
        first_seen_at: now,
        last_seen_at: now,
        updated_at: now,
    })

    if (insertError && insertError.code !== '23505') {
        console.error('Failed to record acquisition download', insertError)
    }
}

export async function recordAcquisitionDownloadBestEffort(
    input: Parameters<typeof recordAcquisitionDownload>[0],
    timeoutMs = 500,
) {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined
    try {
        await Promise.race([
            recordAcquisitionDownload(input),
            new Promise<void>((resolve) => {
                timeoutHandle = setTimeout(resolve, timeoutMs)
            }),
        ])
    } catch (error) {
        console.error('Failed to record acquisition download before redirect', error)
    } finally {
        if (timeoutHandle) clearTimeout(timeoutHandle)
    }
}
