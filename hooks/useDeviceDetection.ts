import { useState, useEffect } from 'react';

interface DeviceDetection {
    isMobile: boolean;
    isDesktop: boolean;
    isChrome: boolean;
    isEdge: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    isMac: boolean;
    isWindows: boolean;
    isIOS: boolean;
    isAndroid: boolean;
}

export function useDeviceDetection(): DeviceDetection {
    const [deviceInfo, setDeviceInfo] = useState<DeviceDetection>({
        isMobile: false,
        isDesktop: true,
        isChrome: false,
        isEdge: false,
        isSafari: false,
        isFirefox: false,
        isMac: false,
        isWindows: false,
        isIOS: false,
        isAndroid: false,
    });

    useEffect(() => {
        if (typeof navigator === 'undefined') return;

        const ua = navigator.userAgent;
        const platform = navigator.platform;

        // Mobile Detection
        const isIOS = /iPhone|iPad|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);
        const isMobile = isIOS || isAndroid || /Mobi|Android/i.test(ua);
        const isDesktop = !isMobile;

        // OS Detection
        const isMac = /Mac|iPod|iPhone|iPad/.test(platform) || /Macintosh/.test(ua);
        const isWindows = /Win/.test(platform) || /Windows/.test(ua);

        // Browser Detection
        // Edge includes "Edg/"
        const isEdge = /Edg\//.test(ua);
        // Chrome includes "Chrome/" but Edge and Opera also include "Chrome/"
        // So we need to make sure it's not Edge or Opera (OPR)
        const isChrome = /Chrome\//.test(ua) && !isEdge && !/OPR\//.test(ua);
        // Safari includes "Safari/" but Chrome also includes "Safari/"
        // So we need to make sure it's not Chrome or Edge
        const isSafari = /Safari\//.test(ua) && !isChrome && !isEdge;
        const isFirefox = /Firefox\//.test(ua);

        setDeviceInfo({
            isMobile,
            isDesktop,
            isChrome,
            isEdge,
            isSafari,
            isFirefox,
            isMac,
            isWindows,
            isIOS,
            isAndroid,
        });
    }, []);

    return deviceInfo;
}
