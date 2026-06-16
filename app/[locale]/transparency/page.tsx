import type { Metadata } from "next";
import TransparencyPageClient from "./TransparencyPageClient";
import { routeAlternates } from "@/lib/i18n-routes";

const title = "Does IdleForest Actually Plant Trees? See the Proof";
const description =
  "Yes, and you can check it. See IdleForest's verified planting partners, public project receipts, and live tree counter, plus how the funding works.";
const canonical = "https://www.idleforest.com/transparency";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: routeAlternates("/transparency", params.locale),
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
}

export default function TransparencyPage() {
  return <TransparencyPageClient />;
}
