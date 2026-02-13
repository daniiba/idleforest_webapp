import { useState, useEffect } from 'react';
import { DeviceDetection, getDeviceInfo, defaultDeviceInfo } from '@/lib/device-detection';

export function useDeviceDetection(initialState?: DeviceDetection): DeviceDetection {
    const [deviceInfo, setDeviceInfo] = useState<DeviceDetection>(
        initialState || defaultDeviceInfo
    );

    useEffect(() => {
        if (typeof navigator === 'undefined') return;

        const ua = navigator.userAgent;
        // Use the shared utility to get device info from client UA
        const info = getDeviceInfo(ua);

        setDeviceInfo(info);
    }, []);

    return deviceInfo;
}
