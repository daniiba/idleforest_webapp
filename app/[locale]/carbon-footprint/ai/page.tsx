import { CarbonHubPageTemplate, buildCarbonHubMetadata } from "@/components/carbon/cluster-hub-page";
import { getCarbonHub } from "@/lib/carbon-hubs";

const hub = getCarbonHub("ai")!;

export const metadata = buildCarbonHubMetadata(hub);

export default function AiCarbonFootprintPage() {
    return <CarbonHubPageTemplate hub={hub} />;
}
