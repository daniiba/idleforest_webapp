import type { Metadata } from "next";
import DownloadPage from "@/components/download/DownloadPage";

const pageTitle = "Tree Planting App for Windows, Free | IdleForest";
const pageDescription =
  "IdleForest is a free tree planting app for Windows. Install it once and it plants verified trees with your idle bandwidth, even when your browser is closed.";
const canonicalUrl = "https://www.idleforest.com/download/windows";

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
        alt: "IdleForest Windows app",
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

export default function WindowsDownloadPage() {
  return (
    <DownloadPage
      config={{
        platform: "windows",
        name: "Windows",
        title: "The free tree planting app for Windows",
        lede: "Install once. It funds verified trees in the background, even when your browser is closed.",
        primaryHref: "/download/windows/installer",
        primaryLabel: "Download for Windows — It’s Free",
        chips: ["Windows 10 and 11", "No account needed", "Uses spare bandwidth"],
        steps: [{"title": "Download", "body": "Click the button to get the .exe installer."}, {"title": "Run the installer", "body": "Open the file and follow the prompts. It takes about a minute."}, {"title": "You’re done", "body": "Open IdleForest once. It runs on its own from then on."}],
        faqs: [{"question": "Is it really free?", "answer": "Yes. No cost, subscription or donation. Idle bandwidth tasks fund the trees, not you."}, {"question": "Will it slow my computer or internet?", "answer": "No. It only uses bandwidth you are not using and backs off when you need it."}, {"question": "What passes through my connection?", "answer": "Automated requests from paying clients, like uptime checks. Your files, logins and browsing history never enter the process."}, {"question": "Do I need the Chrome extension too?", "answer": "No. The app works on its own and funds more, since it runs even when your browser is closed."}, {"question": "How do I uninstall it?", "answer": "Settings, Apps, IdleForest, Uninstall. Trees you already funded stay funded."}],
      }}
    />
  );
}
