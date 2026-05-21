import type { Metadata } from "next";
import { buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";
import { BUSINESS_TITLE_BY_LOCALE, getLocaleMeta } from "@/lib/seo-locales";

const description = "Turn your organization's unused bandwidth into verified reforestation impact with IdleForest business onboarding, certificates, and team dashboards.";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    const title = getLocaleMeta(BUSINESS_TITLE_BY_LOCALE, params.locale);

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
