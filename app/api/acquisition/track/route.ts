import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

import {
    ACQUISITION_COOKIE,
    cleanAttributionValue,
    normalizeAttributionId,
} from '@/lib/acquisition-attribution'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const attributionId = normalizeAttributionId(cookieStore.get(ACQUISITION_COOKIE)?.value)
        if (!attributionId) {
            return NextResponse.json({ error: 'Missing attribution session' }, { status: 400 })
        }

        const body = await request.json()
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const requestHeaders = await headers()
        const userAgent = requestHeaders.get('user-agent') || ''
        const now = new Date().toISOString()

        const row = {
            id: attributionId,
            user_id: user?.id || null,
            gclid: cleanAttributionValue(body.gclid, 250),
            gbraid: cleanAttributionValue(body.gbraid, 250),
            wbraid: cleanAttributionValue(body.wbraid, 250),
            utm_source: cleanAttributionValue(body.utm_source, 120),
            utm_medium: cleanAttributionValue(body.utm_medium, 120),
            utm_campaign: cleanAttributionValue(body.utm_campaign, 250),
            utm_term: cleanAttributionValue(body.utm_term, 250),
            utm_content: cleanAttributionValue(body.utm_content, 250),
            campaign_id: cleanAttributionValue(body.campaignid, 80),
            ad_group_id: cleanAttributionValue(body.adgroupid, 80),
            creative_id: cleanAttributionValue(body.creative, 80),
            device: cleanAttributionValue(body.device, 30),
            network: cleanAttributionValue(body.network, 30),
            match_type: cleanAttributionValue(body.matchtype, 30),
            landing_path: cleanAttributionValue(body.landing_path, 1000),
            referrer: cleanAttributionValue(body.referrer, 1000),
            user_agent: cleanAttributionValue(userAgent, 1000),
            first_seen_at: now,
            last_seen_at: now,
            updated_at: now,
        }

        const admin = createAdminClient()
        const { error: insertError } = await admin.from('acquisition_attributions').insert(row)

        if (insertError?.code === '23505') {
            const { id: _id, first_seen_at: _firstSeenAt, ...updateFields } = row
            const { error: updateError } = await admin
                .from('acquisition_attributions')
                .update({
                    ...updateFields,
                    user_id: user?.id || undefined,
                    last_seen_at: now,
                    updated_at: now,
                })
                .eq('id', attributionId)

            if (updateError) throw updateError
        } else if (insertError) {
            throw insertError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Acquisition attribution error', error)
        return NextResponse.json({ error: 'Failed to record attribution' }, { status: 500 })
    }
}
