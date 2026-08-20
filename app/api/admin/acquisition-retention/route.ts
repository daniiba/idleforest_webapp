import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

const MILESTONES = [14, 30, 90] as const
const DAY_MS = 24 * 60 * 60 * 1000

type AttributionRow = {
    id: string
    node_identifier: string
    node_connected_at: string
    node_baseline_requests: number | null
}

type SnapshotRow = {
    attribution_id: string
    snapshot_date: string
    total_requests: number | null
    opt_in: boolean | null
    captured_at: string
}

function isAuthorized(request: NextRequest) {
    const secret = process.env.ACQUISITION_CRON_SECRET || process.env.CRON_SECRET
    return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

function utcDateKey(date: Date) {
    return date.toISOString().slice(0, 10)
}

function addUtcDays(date: Date, days: number) {
    return new Date(date.getTime() + days * DAY_MS)
}

function findSnapshotNear(snapshots: SnapshotRow[], target: Date, toleranceDays = 2) {
    const targetTime = new Date(`${utcDateKey(target)}T00:00:00.000Z`).getTime()
    return snapshots
        .map((snapshot) => ({
            snapshot,
            distance: Math.abs(new Date(`${snapshot.snapshot_date}T00:00:00.000Z`).getTime() - targetTime),
        }))
        .filter(({ distance }) => distance <= toleranceDays * DAY_MS)
        .sort((a, b) => a.distance - b.distance)[0]?.snapshot || null
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const admin = createAdminClient()
        const { data: attributions, error: attributionError } = await admin
            .from('acquisition_attributions')
            .select('id, node_identifier, node_connected_at, node_baseline_requests')
            .not('node_identifier', 'is', null)
            .not('node_connected_at', 'is', null)

        if (attributionError) throw attributionError

        const typedAttributions = (attributions || []) as AttributionRow[]
        const nodeIdentifiers = Array.from(new Set(typedAttributions.map((row) => row.node_identifier)))
        const { data: nodes, error: nodesError } = nodeIdentifiers.length
            ? await admin
                .from('nodes')
                .select('node_identifier, total_requests, opt_in, platform')
                .in('node_identifier', nodeIdentifiers)
                .in('platform', ['win32', 'darwin'])
            : { data: [], error: null }

        if (nodesError) throw nodesError

        const today = utcDateKey(new Date())
        const nodeMap = new Map((nodes || []).map((node) => [node.node_identifier, node]))
        const snapshotRows = typedAttributions.flatMap((attribution) => {
            const node = nodeMap.get(attribution.node_identifier)
            return node ? [{
                attribution_id: attribution.id,
                node_identifier: attribution.node_identifier,
                snapshot_date: today,
                total_requests: Math.max(0, node.total_requests || 0),
                opt_in: node.opt_in,
                captured_at: new Date().toISOString(),
            }] : []
        })

        if (snapshotRows.length) {
            const { error: snapshotError } = await admin
                .from('acquisition_node_snapshots')
                .upsert(snapshotRows, { onConflict: 'attribution_id,snapshot_date' })
            if (snapshotError) throw snapshotError
        }

        const attributionIds = typedAttributions.map((row) => row.id)
        const [{ data: snapshots, error: snapshotsError }, { data: existing, error: existingError }] = attributionIds.length
            ? await Promise.all([
                admin
                    .from('acquisition_node_snapshots')
                    .select('attribution_id, snapshot_date, total_requests, opt_in, captured_at')
                    .in('attribution_id', attributionIds),
                admin
                    .from('acquisition_retention_milestones')
                    .select('attribution_id, milestone_days')
                    .in('attribution_id', attributionIds),
            ])
            : [{ data: [], error: null }, { data: [], error: null }]

        if (snapshotsError) throw snapshotsError
        if (existingError) throw existingError

        const snapshotsByAttribution = new Map<string, SnapshotRow[]>()
        for (const snapshot of (snapshots || []) as SnapshotRow[]) {
            const rows = snapshotsByAttribution.get(snapshot.attribution_id) || []
            rows.push(snapshot)
            snapshotsByAttribution.set(snapshot.attribution_id, rows)
        }

        const existingKeys = new Set(
            (existing || []).map((row) => `${row.attribution_id}:${row.milestone_days}`)
        )
        const retentionRows: Array<Record<string, unknown>> = []
        const conversionRows: Array<Record<string, unknown>> = []

        for (const attribution of typedAttributions) {
            const connectedAt = new Date(attribution.node_connected_at)
            const ageDays = Math.floor((Date.now() - connectedAt.getTime()) / DAY_MS)
            const attributionSnapshots = snapshotsByAttribution.get(attribution.id) || []

            for (const milestone of MILESTONES) {
                if (ageDays < milestone || existingKeys.has(`${attribution.id}:${milestone}`)) continue

                const targetDate = addUtcDays(connectedAt, milestone)
                const endSnapshot = findSnapshotNear(attributionSnapshots, targetDate)
                const startSnapshot = findSnapshotNear(attributionSnapshots, addUtcDays(targetDate, -7))
                if (!endSnapshot || !startSnapshot) continue

                const requestsInLookback = Math.max(
                    0,
                    (endSnapshot.total_requests || 0) - (startSnapshot.total_requests || 0)
                )
                const requestsSinceInstall = Math.max(
                    0,
                    (endSnapshot.total_requests || 0) - (attribution.node_baseline_requests || 0)
                )
                const active = endSnapshot.opt_in !== false && requestsInLookback > 0

                retentionRows.push({
                    attribution_id: attribution.id,
                    milestone_days: milestone,
                    active,
                    requests_in_lookback: requestsInLookback,
                    requests_since_install: requestsSinceInstall,
                    evaluated_at: endSnapshot.captured_at,
                })

                if (active && milestone !== 90) {
                    const milestoneName = `active_${milestone}d`
                    conversionRows.push({
                        attribution_id: attribution.id,
                        milestone: milestoneName,
                        conversion_at: endSnapshot.captured_at,
                        conversion_value: 0,
                        currency: 'EUR',
                        order_id: `${attribution.id}:${milestoneName}`,
                    })
                }
            }
        }

        if (retentionRows.length) {
            const { error } = await admin
                .from('acquisition_retention_milestones')
                .upsert(retentionRows, { onConflict: 'attribution_id,milestone_days' })
            if (error) throw error
        }

        if (conversionRows.length) {
            const { error } = await admin
                .from('acquisition_conversions')
                .upsert(conversionRows, { onConflict: 'attribution_id,milestone' })
            if (error) throw error
        }

        return NextResponse.json({
            success: true,
            trackedNodes: snapshotRows.length,
            evaluatedMilestones: retentionRows.length,
            newGoogleAdsConversions: conversionRows.length,
        })
    } catch (error) {
        console.error('Acquisition retention cron failed', error)
        return NextResponse.json({ error: 'Retention snapshot failed' }, { status: 500 })
    }
}

export const POST = GET
