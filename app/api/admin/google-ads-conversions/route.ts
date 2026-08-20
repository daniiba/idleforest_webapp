import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

type ConversionRow = {
    attribution_id: string
    milestone: 'desktop_node_connected' | 'active_14d' | 'active_30d'
    conversion_at: string
    conversion_value: number | string
    currency: string
    order_id: string
}

type AttributionRow = {
    id: string
    gclid: string | null
    gbraid: string | null
    wbraid: string | null
    first_seen_at: string
}

const CONVERSION_NAMES = {
    desktop_node_connected: process.env.GOOGLE_ADS_INSTALL_CONVERSION_NAME || 'IdleForest desktop node connected',
    active_14d: process.env.GOOGLE_ADS_ACTIVE_14D_CONVERSION_NAME || 'IdleForest active day 14',
    active_30d: process.env.GOOGLE_ADS_ACTIVE_30D_CONVERSION_NAME || 'IdleForest active day 30',
}

function csvCell(value: unknown) {
    const stringValue = String(value ?? '')
    return /[",\n\r]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
}

function isAuthorized(request: NextRequest) {
    const secret = process.env.GOOGLE_ADS_EXPORT_SECRET || process.env.ACQUISITION_CRON_SECRET || process.env.CRON_SECRET
    const bearer = request.headers.get('authorization') === `Bearer ${secret}`
    const queryKey = request.nextUrl.searchParams.get('key') === secret
    return Boolean(secret && (bearer || queryKey))
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const sinceParam = request.nextUrl.searchParams.get('since')
    const since = sinceParam && !Number.isNaN(new Date(sinceParam).getTime())
        ? new Date(sinceParam)
        : new Date(Date.now() - 89 * 24 * 60 * 60 * 1000)

    const { data: conversions, error: conversionsError } = await admin
        .from('acquisition_conversions')
        .select('attribution_id, milestone, conversion_at, conversion_value, currency, order_id')
        .gte('conversion_at', since.toISOString())
        .order('conversion_at', { ascending: true })

    if (conversionsError) {
        return NextResponse.json({ error: 'Failed to load conversions' }, { status: 500 })
    }

    const typedConversions = (conversions || []) as ConversionRow[]
    const attributionIds = Array.from(new Set(typedConversions.map((row) => row.attribution_id)))
    const { data: attributions, error: attributionsError } = attributionIds.length
        ? await admin
            .from('acquisition_attributions')
            .select('id, gclid, gbraid, wbraid, first_seen_at')
            .in('id', attributionIds)
        : { data: [], error: null }

    if (attributionsError) {
        return NextResponse.json({ error: 'Failed to load conversion attribution' }, { status: 500 })
    }

    const attributionMap = new Map(
        ((attributions || []) as AttributionRow[]).map((row) => [row.id, row])
    )
    const rows = typedConversions.flatMap((conversion) => {
        const attribution = attributionMap.get(conversion.attribution_id)
        if (!attribution || (!attribution.gclid && !attribution.gbraid && !attribution.wbraid)) return []

        const clickAgeDays = (
            new Date(conversion.conversion_at).getTime() - new Date(attribution.first_seen_at).getTime()
        ) / (24 * 60 * 60 * 1000)
        if (clickAgeDays < 0 || clickAgeDays > 90) return []

        return [[
            attribution.gclid,
            attribution.gbraid,
            attribution.wbraid,
            CONVERSION_NAMES[conversion.milestone],
            conversion.conversion_at,
            conversion.conversion_value,
            conversion.currency,
            conversion.order_id,
        ]]
    })

    const header = [
        'GCLID',
        'GBRAID',
        'WBRAID',
        'Conversion Name',
        'Conversion Time',
        'Conversion Value',
        'Conversion Currency',
        'Order ID',
    ]
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="idleforest-google-ads-conversions.csv"',
            'Cache-Control': 'private, no-store',
        },
    })
}
