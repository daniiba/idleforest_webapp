import type { Metadata } from "next";
import DownloadPage from "@/components/download/DownloadPage";

const pageTitle = "Tree Planting App for Mac, Free | IdleForest";
const pageDescription =
  "IdleForest is a free tree planting app for Mac. Install it once and it plants verified trees with your idle bandwidth, even when your browser is closed.";
const canonicalUrl = "https://www.idleforest.com/download/mac";

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
        alt: "IdleForest Mac app",
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

export default function MacDownloadPage() {
  return (
    <DownloadPage
      config={{
        platform: "mac",
        name: "Mac",
        title: "The free tree planting app for Mac",
        lede: "Install once. It funds verified trees in the background, even when your browser is closed.",
        primaryHref: "/download/mac/installer",
        primaryLabel: "Download for Mac — It’s Free",
        chips: ["macOS 11 or later", "Apple Silicon and Intel", "Uses spare bandwidth"],
        steps: [{"title": "Download", "body": "Click the button to get the .dmg file."}, {"title": "Drag to Applications", "body": "Open the .dmg and drag IdleForest into Applications."}, {"title": "You’re done", "body": "Open IdleForest once. It runs on its own from then on."}],
        faqs: [{"question": "Is it really free?", "answer": "Yes. No cost, subscription or donation. Idle bandwidth tasks fund the trees, not you."}, {"question": "Will it slow my computer or internet?", "answer": "No. It only uses bandwidth you are not using and backs off when you need it."}, {"question": "What passes through my connection?", "answer": "Automated requests from paying clients, like uptime checks. Your files, logins and browsing history never enter the process."}, {"question": "Do I need the Chrome extension too?", "answer": "No. The app works on its own and funds more, since it runs even when your browser is closed."}, {"question": "How do I uninstall it?", "answer": "Quit IdleForest and drag it from Applications to the Trash. Trees you already funded stay funded."}],
      }}
    />
  );
}
