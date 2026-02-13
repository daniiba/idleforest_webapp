
export interface DeviceDetection {
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

export const defaultDeviceInfo: DeviceDetection = {
    isMobile: false,
    isDesktop: true,
    isChrome: false,
    isEdge: false,
    isSafari: false,
    isFirefox: false,
    isMac: false,
    isWindows: false, // Default to false to avoid hydration mismatch if we don't know
    isIOS: false,
    isAndroid: false,
};

export function getDeviceInfo(userAgent: string): DeviceDetection {
    const ua = userAgent;

    // Mobile Detection
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /Mobi|Android/i.test(ua);
    const isDesktop = !isMobile;

    // OS Detection
    // Note: platform is not available on server, so we rely on UA
    const isMac = /Mac|iPod|iPhone|iPad/.test(ua) || /Macintosh/.test(ua);
    const isWindows = /Windows/.test(ua);

    // Browser Detection
    // Edge includes "Edg/"
    const isEdge = /Edg\//.test(ua);
    // Chrome includes "Chrome/" but Edge and Opera also include "Chrome/"
    const isChrome = /Chrome\//.test(ua) && !isEdge && !/OPR\//.test(ua);
    // Safari includes "Safari/" but Chrome also includes "Safari/"
    const isSafari = /Safari\//.test(ua) && !isChrome && !isEdge;
    const isFirefox = /Firefox\//.test(ua);

    return {
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
    };
}
