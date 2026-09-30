import type { Metadata } from "next";
import DownloadPage from "@/components/download/DownloadPage";

const pageTitle = "Tree Planting App for Linux, Free | IdleForest";
const pageDescription =
  "IdleForest is a free tree planting app for Linux. Install the 64-bit .deb package and fund verified trees with your idle bandwidth, even when your browser is closed.";
const canonicalUrl = "https://www.idleforest.com/download/linux";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    siteName: "IdleForest",
    type: "website",
    images: [{ url: "/preview.png", width: 1280, height: 800, alt: "IdleForest Linux app" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/preview.png"],
  },
};

export default function LinuxDownloadPage() {
  return (
    <DownloadPage
      config={{
        platform: "linux",
        name: "Linux",
        title: "The free tree planting app for Linux",
        lede: "Install once. It funds verified trees in the background, even when your browser is closed.",
        primaryHref: "/download/linux/installer",
        primaryLabel: "Download for Linux — It’s Free",
        chips: ["64-bit .deb package", "x64 Debian-based systems", "Uses spare bandwidth"],
        steps: [{"title": "Download", "body": "Click the button to get the 64-bit .deb package."}, {"title": "Install the .deb", "body": "Open it with your package installer and follow the prompts."}, {"title": "Launch once", "body": "Open IdleForest. It runs on its own from then on."}],
        faqs: [{"question": "Is it really free?", "answer": "Yes. No cost, subscription or donation. Idle bandwidth tasks fund the trees, not you."}, {"question": "Will it slow my computer or internet?", "answer": "No. It only uses bandwidth you are not using and backs off when you need it."}, {"question": "What passes through my connection?", "answer": "Automated requests from paying clients, like uptime checks. Your files, logins and browsing history never enter the process."}, {"question": "Which Linux systems work?", "answer": "The first release is a 64-bit .deb for x64 systems that support Debian packages."}, {"question": "How do I uninstall it?", "answer": "Remove IdleForest with your software or package manager. Trees you already funded stay funded."}],
      }}
    />
  );
}
