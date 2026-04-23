import { CarbonHubPageTemplate, buildCarbonHubMetadata } from "@/components/carbon/cluster-hub-page";
import { getCarbonHub } from "@/lib/carbon-hubs";

const hub = getCarbonHub("streaming")!;

export const metadata = buildCarbonHubMetadata(hub);

export default function StreamingCarbonFootprintPage() {
    return <CarbonHubPageTemplate hub={hub} />;
}
