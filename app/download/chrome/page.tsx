import type { Metadata } from "next";
import DownloadPage from "@/components/download/DownloadPage";

const pageTitle = "Tree Planting Chrome Extension, Free | IdleForest";
const pageDescription =
  "IdleForest is a free Chrome extension that plants verified trees with your idle bandwidth. Add it in one click, no signup, no cost, and browse like always.";
const canonicalUrl = "https://www.idleforest.com/download/chrome";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    siteName: "IdleForest",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1280,
        height: 800,
        alt: "IdleForest Chrome extension",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/preview.png"],
  },
};

export default function ChromeDownloadPage() {
  return (
    <DownloadPage
      config={{
        platform: "chrome",
        name: "Chrome",
        title: "The free tree planting Chrome extension",
        lede: "Add it in one click. It funds verified trees while Chrome is open, with no change to how you browse.",
        primaryHref: "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk",
        primaryLabel: "Add to Chrome — It’s Free",
        external: true,
        chips: ["Installs in one click", "No search engine switch", "4.8 stars from 33 reviews"],
        steps: [{"title": "Open the store", "body": "Click the button to open the Chrome Web Store page."}, {"title": "Add to Chrome", "body": "Click “Add to Chrome” and confirm."}, {"title": "Browse as usual", "body": "It runs quietly while Chrome is open."}],
        faqs: [{"question": "Is it really free?", "answer": "Yes. No cost, subscription or donation. Idle bandwidth tasks fund the trees, not you."}, {"question": "Will it slow Chrome or my internet?", "answer": "No. It only uses bandwidth you are not using and backs off when you need it."}, {"question": "What passes through my connection?", "answer": "Automated requests from paying clients, like uptime checks. Your files, logins and browsing history never enter the process."}, {"question": "Desktop app or extension?", "answer": "The desktop app funds more, since it runs even when your browser is closed. You can use both."}, {"question": "How do I remove it?", "answer": "Open chrome://extensions and remove IdleForest. Trees you already funded stay funded."}],
      }}
    />
  );
}
