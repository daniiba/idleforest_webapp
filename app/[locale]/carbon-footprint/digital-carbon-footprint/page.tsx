import { CarbonHubPageTemplate, buildCarbonHubMetadata } from "@/components/carbon/cluster-hub-page";
import { getCarbonHub } from "@/lib/carbon-hubs";

const hub = getCarbonHub("digital-carbon-footprint")!;

export const metadata = buildCarbonHubMetadata(hub);

export default function DigitalCarbonFootprintPage() {
    return <CarbonHubPageTemplate hub={hub} />;
}
