import type { Metadata } from "next";
import PlantingsMap from "@/components/PlantingsMap";

export const metadata: Metadata = {
  title: "Planting Map – IdleForest",
  description: "Explore the interactive map of where IdleForest has planted trees with our partners.",
  openGraph: {
    title: "Planting Map – IdleForest",
    description: "Explore the interactive map of where IdleForest has planted trees with our partners.",
    images: [
      { url: "/preview.png", width: 1400, height: 700, alt: "IdleForest Planting Map" },
    ],
    type: "website",
  },
  alternates: { canonical: "/map" },
};

export default function MapPage() {
  return (
    <main className="min-h-screen bg-brand-gray py-16 md:py-24">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-24 pb-6 md:pb-10">
        <h1 className="text-center font-rethink-sans font-extrabold text-4xl md:text-5xl text-brand-navy tracking-tight">Our planting map</h1>
        <p className="mt-3 text-center text-gray-700 ">
          See where we've planted trees with partners like Trees for the Future and Tree-Nation. This map updates as we plant more.
        </p>
      </section>
      <section className="w-full max-w-none sm:max-w-6xl mx-auto px-0 sm:px-6 pb-16 md:pb-24">
        <PlantingsMap />
      
      </section>
    </main>
  );
}
