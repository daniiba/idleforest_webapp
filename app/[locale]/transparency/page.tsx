import type { Metadata } from "next";
import TransparencyPageClient from "./TransparencyPageClient";

const title = "Does IdleForest Actually Plant Trees? See the Proof";
const description =
  "Yes, and you can check it. See IdleForest's verified planting partners, public project receipts, and live tree counter, plus how the funding works.";
const canonical = "https://www.idleforest.com/transparency";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical,
  },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "IdleForest",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1280,
        height: 800,
        alt: "IdleForest tree planting proof",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/preview.png"],
  },
};

export default function TransparencyPage() {
  return <TransparencyPageClient />;
}
