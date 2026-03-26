'use client';

export type PinterestEventName = 'lead' | 'signup';

type PinterestTrackInput = {
    eventName: PinterestEventName;
    email?: string | null;
    eventId?: string;
    eventSourceUrl?: string;
    externalId?: string | null;
    customData?: Record<string, any>;
};

type PinterestTrackPayload = {
    clickId?: string;
    email?: string;
    eventId: string;
    eventName: PinterestEventName;
    eventSourceUrl: string;
    externalId?: string;
    customData?: Record<string, any>;
};

function readCookie(name: string) {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));

    return match ? decodeURIComponent(match[1]) : undefined;
}

function createEventId(eventName: PinterestEventName) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `idleforest-${eventName}-${crypto.randomUUID()}`;
    }

    return `idleforest-${eventName}-${Date.now()}`;
}

function getEventSourceUrl(eventSourceUrl?: string) {
    if (typeof window === 'undefined') {
        return eventSourceUrl ?? 'https://idleforest.com';
    }

    try {
        return new URL(eventSourceUrl ?? window.location.href, window.location.origin).toString();
    } catch {
        return window.location.href;
    }
}

function getClickId() {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return readCookie('_epik') ?? new URLSearchParams(window.location.search).get('epik') ?? undefined;
}

function sendPinterestConversion(payload: PinterestTrackPayload) {
    return fetch('/api/pinterest/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        keepalive: true,
        body: JSON.stringify(payload),
    }).catch(() => undefined);
}

export function trackPinterestEvent(input: PinterestTrackInput) {
    if (typeof window === 'undefined') {
        return null;
    }

    const eventId = input.eventId ?? createEventId(input.eventName);
    const eventSourceUrl = getEventSourceUrl(input.eventSourceUrl);

    if (typeof window.pintrk === 'function') {
        if (input.email) {
            window.pintrk('set', { em: input.email });
        }

        const dataObj = input.customData && Object.keys(input.customData).length > 0 ? input.customData : undefined;
        // Pinterest accepts the standard event data object as the third argument, and options (like event_id) as the fourth.
        if (dataObj) {
            window.pintrk('track', input.eventName, dataObj, { event_id: eventId });
        } else {
            // No custom data, just pass the options with event_id
            window.pintrk('track', input.eventName, undefined, { event_id: eventId });
        }
    }

    void sendPinterestConversion({
        clickId: getClickId(),
        email: input.email ?? undefined,
        eventId,
        eventName: input.eventName,
        eventSourceUrl,
        externalId: input.externalId ?? undefined,
        customData: input.customData,
    });

    return eventId;
}
