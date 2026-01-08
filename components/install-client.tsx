
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';

const STORE_URLS = {
  chrome: 'https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk',
  firefox: 'https://addons.mozilla.org/en-GB/firefox/addon/idleforest/',
  edge: 'https://microsoftedge.microsoft.com/addons/detail/idle-forest-plant-trees/cccklibfpcangcakgpllhcohldgcginb',
} as const;

type Browser = keyof typeof STORE_URLS;

export default function InstallClient() {
  const searchParams = useSearchParams();
  const [browser, setBrowser] = useState<Browser>('chrome');
  const ref = searchParams.get('ref');

  useEffect(() => {
    // Detect browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('edg/')) {
      setBrowser('edge');
    } else if (userAgent.includes('firefox/')) {
      setBrowser('firefox');
    }

    // Store referral code in localStorage
    if (ref) {
      localStorage.setItem('idleforest_referral', ref);
    }

    // Auto-redirect to store after a short delay
    const timer = setTimeout(() => {
      window.location.href = STORE_URLS[browser];
    }, 2000);

    return () => clearTimeout(timer);
  }, [ref, browser]);

  return (
    <Card className="max-w-md w-full p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-center">Installing Idle Forest</h1>
      
      <div className="space-y-4">
        <p className="text-center text-gray-600">
          Redirecting you to the {browser.charAt(0).toUpperCase() + browser.slice(1)} Web Store...
        </p>
        
        {/* Loading animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>

        {/* Manual install buttons */}
        <div className="pt-8 space-y-3">
          <p className="text-sm text-center text-gray-500">
            Or install manually for your browser:
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(STORE_URLS).map(([key, url]) => (
              <a
                key={key}
                href={url}
                className={`px-4 py-2 text-center rounded-lg transition-colors
                  ${
                    'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

