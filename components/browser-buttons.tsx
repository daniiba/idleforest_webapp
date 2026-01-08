"use client"
import { useState, useEffect } from "react";
import { Apple } from "lucide-react";

// --- Icons (Using simple SVGs as placeholders - replace with actual icons/images) ---

// Using Lucide Apple icon instead of custom SVG

// Placeholder Windows Icon SVG
export const WindowsIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M3,12V6.75L9,5.43V11.91H3M3,13.09H9V19.57L3,18.25V13.09M10,11.91V4.69L21,3V11.91H10M10,13.09H21V21L10,19.73V13.09Z" />
  </svg>
);


// --- Browser Store Buttons ---

// ChromeStoreButton component
export const ChromeStoreButton = () => (
  <a
    href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 bg-brand-yellow hover:bg-brand-yellow text-gray-900 text-lg h-14 px-8 rounded-md transition-all"
  >
    {/* Use your actual image path */}
    <img src="/chrome.png" className="h-8 w-8" alt="Chrome logo" />
    <div className="flex flex-col items-start leading-tight text-left">
      <span className="text-xs opacity-90">Available in the</span>
      <span className="text-sm font-semibold">Chrome Web Store</span>
    </div>
    {/* Optional Rating - keep or remove */}
    <div className="flex items-center gap-1 ml-2 bg-black/10 px-2 py-1 rounded">
      <span className="text-sm">5</span>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
    </div>
  </a>
);

// EdgeStoreButton component
export const EdgeStoreButton = () => (
  <a
    href="https://microsoftedge.microsoft.com/addons/detail/idle-forest-plant-trees/cccklibfpcangcakgpllhcohldgcginb"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 bg-brand-yellow hover:bg-brand-yellow text-gray-900 text-lg h-14 px-8 rounded-md transition-all"
  >
    {/* Use your actual image path */}
    <img src="/edge.png" className="h-8 w-8" alt="Edge logo" />
    <div className="flex flex-col items-start leading-tight text-left">
      <span className="text-xs opacity-90">Available for</span>
      <span className="text-sm font-semibold">Microsoft Edge</span>
    </div>
    {/* Optional Rating - keep or remove */}
    <div className="flex items-center gap-1 ml-2 bg-black/10 px-2 py-1 rounded">
      <span className="text-sm">5</span>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
    </div>
  </a>
);

// FirefoxStoreButton component
export const FirefoxStoreButton = () => (
  <a
    href="https://addons.mozilla.org/en-US/firefox/addon/idleforest/"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 bg-brand-yellow hover:bg-brand-yellow text-gray-900 text-lg h-14 px-8 rounded-md transition-all"
  >
    {/* Use your actual image path */}
    <img src="/firefox.webp" className="h-8 w-8" alt="Firefox logo" />
    <div className="flex flex-col items-start leading-tight text-left">
      <span className="text-xs opacity-90">Available for</span>
      <span className="text-sm font-semibold">Firefox</span>
    </div>
    {/* Optional Rating - keep or remove */}
    <div className="flex items-center gap-1 ml-2 bg-black/10 px-2 py-1 rounded">
      <span className="text-sm">5</span>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
    </div>
  </a>
);


// --- Desktop Download Buttons ---

// MacDownloadButton component
export const MacDownloadButton = () => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    // Create a temporary link to trigger the download
    const downloadUrl = "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip";

    // Open the download in a new tab
    window.open(downloadUrl, '_blank');

    // Redirect to download success page after a short delay
    setTimeout(() => {
      window.location.href = '/download-success';
    }, 500);
  };

  return (
    <a
      href="#"
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground text-lg h-14 min-w-[260px] sm:min-w-[280px] px-8 rounded-lg shadow-md transition-colors duration-150 border border-transparent hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      {/* Mac/Apple logo from Lucide */}
      <Apple className="h-6 w-6" />
      <div className="flex flex-col items-start leading-tight text-left">
        <span className="text-xs opacity-90">Download for</span>
        <span className="text-sm font-semibold">macOS</span>
      </div>
    </a>
  );
};

// WindowsDownloadButton component
export const WindowsDownloadButton = () => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    // Create a temporary link to trigger the download
    const downloadUrl = "https://ufsnmvbmgwvkhirfnptm.supabase.co/storage/v1/object/sign/idleforest/idleforest.zip?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80M2VjMmViMC1lMzZjLTRkODQtYWQ3Ni0wYjNhYzg2ZTkxNWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpZGxlZm9yZXN0L2lkbGVmb3Jlc3QuemlwIiwiaWF0IjoxNzUwMDE1NjA3LCJleHAiOjI3MTAwMDYwMDd9.oi_qgeqfi2KzHLVPKlwMCR5hQy41TveR8e7dD3-jZj8";

    // Open the download in a new tab
    window.open(downloadUrl, '_blank');

    // Redirect to download success page after a short delay
    setTimeout(() => {
      window.location.href = '/download-success';
    }, 500);
  };

  return (
    <a
      href="#"
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground text-lg h-14 min-w-[260px] sm:min-w-[280px] px-8 rounded-lg shadow-md transition-colors duration-150 border border-transparent hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      <WindowsIcon />
      <div className="flex flex-col items-start leading-tight text-left">
        <span className="text-xs opacity-90">Download for</span>
        <span className="text-sm font-semibold">Windows</span>
      </div>
    </a>
  );
};


// --- Main Combined Component ---

const BrowserButtons = () => {
  const [currentBrowser, setCurrentBrowser] = useState('chrome'); // Default to Chrome
  const [detectedOS, setDetectedOS] = useState<string | null>(null); // 'mac', 'windows', or 'other'

  useEffect(() => {
    // Detect browser from user agent
    const detectBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.indexOf('edg') !== -1 || userAgent.indexOf('edge') !== -1) {
        return 'edge';
      } else if (userAgent.indexOf('firefox') !== -1) {
        return 'firefox';
      } else if (userAgent.indexOf('chrome') !== -1 && userAgent.indexOf('edg') === -1) {
        return 'chrome';
      } else {
        return 'chrome'; // Default
      }
    };

    // Detect Operating System
    const detectOperatingSystem = () => {
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('mac') || platform.includes('iphone') || platform.includes('ipad')) {
        return 'mac';
      } else if (platform.includes('win')) {
        return 'windows';
      } else {
        return 'other'; // For Linux, Android, etc.
      }
    };

    setCurrentBrowser(detectBrowser());
    setDetectedOS(detectOperatingSystem());
  }, []);

  return (
    // Main container stacks sections vertically, centers items on small screens, aligns left on large
    <div className="flex flex-col gap-6 items-center ">

      <p className="text-xl md:text-2xl text-white mb-6 text-center lg:text-left font-medium">Join over <span className="text-brand-yellow font-bold">400</span> people supporting the environment!</p>

      {/* New Group: Extension and Desktop Buttons Side-by-Side (or stacked on small screens) */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

        {/* Part 1: Desktop Download Buttons (Now first) */}
        {/*  <div className="flex flex-col items-center md:items-start gap-4">
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4"> 
            {detectedOS !== 'other' && (
              <div className="absolute top-0 right-0 z-10 transform -translate-y-3/4 translate-x-4 rotate-[8deg] bg-brand-yellow text-white text-xs font-semibold px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
                Plant Trees 3x Faster!
              </div>
            )}
        {detectedOS === 'mac' && <MacDownloadButton />}
            {detectedOS === 'windows' && <WindowsDownloadButton />}
          </div>
        </div> */}

        {/* Part 2: Browser Extension Button (Conditional) (Now second) */}
        <div className="flex justify-center mt-4">
          {currentBrowser === 'edge' ? <EdgeStoreButton /> : <ChromeStoreButton />}

        </div>
      </div>

    </div>
  );
};

export default BrowserButtons;