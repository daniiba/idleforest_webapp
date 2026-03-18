import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

type PinterestEventName = 'lead' | 'signup';

type PinterestTrackRequest = {
    clickId?: string;
    email?: string;
    eventId?: string;
    eventName?: PinterestEventName;
    eventSourceUrl?: string;
    externalId?: string;
};

function hashValue(value?: string) {
    if (!value) {
        return undefined;
    }

    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function getClientIp(request: NextRequest) {
    const forwardedFor = request.headers.get('x-forwarded-for');

    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || undefined;
    }

    return request.headers.get('x-real-ip') ?? undefined;
}

export async function POST(request: NextRequest) {
    const accessToken = process.env.PINTEREST_CONVERSION_ACCESS_TOKEN;
    const adAccountId = process.env.PINTEREST_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
        return NextResponse.json({ ok: false, skipped: true }, { status: 202 });
    }

    let body: PinterestTrackRequest;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (!body.eventName || !body.eventSourceUrl) {
        return NextResponse.json({ error: 'eventName and eventSourceUrl are required.' }, { status: 400 });
    }

    const userData: Record<string, string> = {};
    const clientIp = getClientIp(request);
    const clientUserAgent = request.headers.get('user-agent');
    const hashedEmail = hashValue(body.email);
    const hashedExternalId = hashValue(body.externalId);

    if (body.clickId) {
        userData.click_id = body.clickId;
    }

    if (clientIp) {
        userData.client_ip_address = clientIp;
    }

    if (clientUserAgent) {
        userData.client_user_agent = clientUserAgent;
    }

    if (hashedEmail) {
        userData.email_address = hashedEmail;
    }

    if (hashedExternalId) {
        userData.external_id = hashedExternalId;
    }

    const pinterestResponse = await fetch(`https://api.pinterest.com/v5/ad_accounts/${adAccountId}/events`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: [
                {
                    action_source: 'web',
                    event_id: body.eventId ?? `idleforest-${body.eventName}-${Date.now()}`,
                    event_name: body.eventName,
                    event_source_url: body.eventSourceUrl,
                    event_time: Math.floor(Date.now() / 1000),
                    partner_name: 'direct',
                    user_data: userData,
                },
            ],
        }),
        cache: 'no-store',
    });

    if (!pinterestResponse.ok) {
        const errorBody = await pinterestResponse.text();
        console.error('[Pinterest] Conversion API error', pinterestResponse.status, errorBody);

        return NextResponse.json(
            {
                error: 'Pinterest conversion request failed.',
            },
            { status: 502 }
        );
    }

    return NextResponse.json({ ok: true });
}
