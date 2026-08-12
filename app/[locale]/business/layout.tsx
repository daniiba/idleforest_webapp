import type { Metadata } from "next";
import { buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";
import { BUSINESS_TITLE_BY_LOCALE, getLocaleMeta } from "@/lib/seo-locales";

const descriptions: Record<string, string> = {
    en: "Environmental NGOs and conservation organizations can apply to receive community-powered funding through IdleForest.",
    es: "Las ONG ambientales y organizaciones de conservación pueden solicitar financiación impulsada por su comunidad a través de IdleForest.",
    de: "Umwelt-NGOs und Naturschutzorganisationen können sich bei IdleForest für gemeinschaftsbasierte Finanzierung bewerben.",
    pt: "ONG ambientais e organizações de conservação podem candidatar-se a financiamento impulsionado pela comunidade através do IdleForest.",
    fr: "Les ONG environnementales et organismes de conservation peuvent demander un financement porté par leur communauté via IdleForest.",
};

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    const title = getLocaleMeta(BUSINESS_TITLE_BY_LOCALE, params.locale);
    const description = getLocaleMeta(descriptions, params.locale);

    return {
        title,
        description,
        alternates: buildLocalizedAlternates('/business', params.locale),
        openGraph: {
            title,
            description,
            url: getLocalizedUrl('/business', params.locale),
            type: 'website',
        },
    };
}

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
