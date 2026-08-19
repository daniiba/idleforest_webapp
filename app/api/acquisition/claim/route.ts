import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import {
    ACQUISITION_COOKIE,
    claimDesktopNodeForAttribution,
    normalizeAttributionId,
} from '@/lib/acquisition-attribution'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
    const destination = new URL('/download-success', request.url)
    const cookieStore = await cookies()
    const attributionId = normalizeAttributionId(cookieStore.get(ACQUISITION_COOKIE)?.value)
    const nodeIdentifier = request.nextUrl.searchParams.get('node')?.trim().slice(0, 250)

    if (!attributionId || !nodeIdentifier) {
        destination.searchParams.set('tracking', 'missing')
        return NextResponse.redirect(destination)
    }

    const admin = createAdminClient()
    const { data: node } = await admin
        .from('nodes')
        .select('node_identifier, platform, total_requests, created_at, opt_in')
        .eq('node_identifier', nodeIdentifier)
        .in('platform', ['win32', 'darwin'])
        .maybeSingle()

    if (!node) {
        destination.searchParams.set('tracking', 'node-not-found')
        return NextResponse.redirect(destination)
    }

    const result = await claimDesktopNodeForAttribution({ attributionId, node })
    destination.searchParams.set('tracking', result.claimed ? 'connected' : result.reason)
    return NextResponse.redirect(destination)
}
