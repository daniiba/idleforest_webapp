import { CarbonHubPageTemplate, buildCarbonHubMetadata } from "@/components/carbon/cluster-hub-page";
import { getCarbonHub } from "@/lib/carbon-hubs";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params }: PageProps) {
    const hub = await getCarbonHub("ai", params.locale);
    return buildCarbonHubMetadata(hub!);
}

export default async function AiCarbonFootprintPage({ params }: PageProps) {
    const hub = await getCarbonHub("ai", params.locale);
    if (!hub) {
        notFound();
    }
    return <CarbonHubPageTemplate hub={hub} locale={params.locale} />;
}
