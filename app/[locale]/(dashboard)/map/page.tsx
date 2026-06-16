import type { Metadata } from "next";
import PlantingsMap from "@/components/PlantingsMap";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routeAlternates } from "@/lib/i18n-routes";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Map' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      images: [
        { url: "/preview.png", width: 1400, height: 700, alt: t('title') },
      ],
      type: "website",
    },
    alternates: routeAlternates("/map", locale),
  };
}

export default function MapPage() {
  const t = useTranslations("Map");
  return (
    <main className="min-h-screen bg-brand-gray py-16 md:py-24">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-24 pb-6 md:pb-10">
        <h1 className="text-center font-rethink-sans font-extrabold text-4xl md:text-5xl text-brand-navy tracking-tight">{t('heading')}</h1>
        <p className="mt-3 text-center text-gray-700 ">
          {t('text')}
        </p>
      </section>
      <section className="w-full max-w-none sm:max-w-6xl mx-auto px-0 sm:px-6 pb-16 md:pb-24">
        <PlantingsMap />
      </section>
    </main>
  );
}
