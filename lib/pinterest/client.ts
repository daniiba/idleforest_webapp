'use client';

export type PinterestEventName = 'lead' | 'signup';

type PinterestTrackInput = {
    eventName: PinterestEventName;
    email?: string | null;
    eventId?: string;
    eventSourceUrl?: string;
    externalId?: string | null;
};

type PinterestTrackPayload = {
    clickId?: string;
    email?: string;
    eventId: string;
    eventName: PinterestEventName;
    eventSourceUrl: string;
    externalId?: string;
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
        window.pintrk('track', input.eventName);
    }

    void sendPinterestConversion({
        clickId: getClickId(),
        email: input.email ?? undefined,
        eventId,
        eventName: input.eventName,
        eventSourceUrl,
        externalId: input.externalId ?? undefined,
    });

    return eventId;
}
