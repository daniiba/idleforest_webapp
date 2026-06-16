import type { Metadata } from "next";
import { ArrowRight, MessageCircle, ShieldCheck, Star } from "lucide-react";
import Navigation from "@/components/navigation";
import { ReviewsSection } from "@/components/reviews-section";
import { Card } from "@/components/ui/card";
import { Link } from "@/navigation";
import { routeAlternates } from "@/lib/i18n-routes";

const title = "IdleForest Reviews and User Proof";
const description =
  "Read IdleForest user reviews, Chrome Web Store proof, and links to the transparency page that verifies how idle bandwidth funds trees.";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    alternates: routeAlternates("/reviews", params.locale),
    openGraph: {
      title,
      description,
      url: "https://www.idleforest.com/reviews",
      siteName: "IdleForest",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-brand-gray text-black">
      <Navigation />

      <section className="border-b-2 border-black bg-brand-yellow">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
              <Star className="h-4 w-4" />
              User proof
            </p>
            <h1 className="font-rethink-sans text-[40px] font-extrabold leading-tight sm:text-5xl md:text-6xl">
              IdleForest Reviews
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
              See what people say after installing IdleForest, then check the transparency page for the planting
              receipts, partner records, and open-source code behind the model.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy text-brand-yellow">
        <div className="container mx-auto grid gap-6 px-6 py-12 md:grid-cols-3">
          {[
            {
              icon: <MessageCircle className="h-6 w-6" />,
              title: "Chrome Web Store reviews",
              body: "Community feedback from people using the extension in real browsers.",
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: "Proof beyond ratings",
              body: "Reviews show user experience; the transparency page shows the funding and planting chain.",
            },
            {
              icon: <Star className="h-6 w-6" />,
              title: "Quiet social proof",
              body: "This page keeps reviews separate from the planting receipts so each claim has its own evidence.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-2 border-brand-yellow bg-black/20 p-6 text-brand-yellow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-yellow text-black">
                {item.icon}
              </div>
              <h2 className="font-rethink-sans text-xl font-extrabold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-brand-yellow/80">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <ReviewsSection />

      <section className="border-t-2 border-black bg-brand-yellow">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="font-rethink-sans text-3xl font-extrabold">Want the planting proof too?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-800">
            Reviews tell you how the app feels to use. The transparency page shows how IdleForest funds verified trees.
          </p>
          <Link
            href="/transparency"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-brand-yellow hover:bg-black"
          >
            See the planting proof <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
