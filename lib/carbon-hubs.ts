import { CarbonData, CARBON_DATA } from "./carbon-data";

export interface CarbonHubDefinition {
    slug: string;
    title: string;
    seoTitle: string;
    seoDescription: string;
    queryChips: string[];
    eyebrow: string;
    intro: string;
    categoryFilter?: string[];
    sections: { title: string; body: string }[];
}

export const CARBON_HUBS: Record<string, CarbonHubDefinition> = {
    "ai": {
        slug: "ai",
        title: "AI Carbon Footprint",
        seoTitle: "AI Carbon Footprint: Emissions from Artificial Intelligence | IdleForest",
        seoDescription: "Understand the carbon footprint of AI models like ChatGPT, Midjourney, and LLMs. Learn how training and inference contribute to global digital emissions.",
        queryChips: ["ai carbon footprint", "carbon footprint of chatgpt", "llm emissions", "ai co2"],
        eyebrow: "AI Emissions Hub",
        intro: "Artificial Intelligence offers incredible capabilities, but these systems require massive amounts of energy. From training neural networks to processing millions of daily prompts, AI's carbon footprint is growing rapidly.",
        categoryFilter: ["AI"],
        sections: [
            {
                title: "Training vs. Inference",
                body: "Training a large language model uses thousands of GPUs running for months, creating a singular massive footprint. However, inference (the everyday use of models like ChatGPT) happens millions of times a day and adds up over time."
            },
            {
                title: "Hardware and Cooling",
                body: "Data centers hosting AI hardware must be kept cool, which often requires significant water and electricity. The overall impact depends heavily on whether the data center runs on renewable energy."
            }
        ]
    },
    "streaming": {
        slug: "streaming",
        title: "Streaming Carbon Footprint",
        seoTitle: "Streaming Carbon Footprint: YouTube, Netflix, Spotify | IdleForest",
        seoDescription: "Compare the carbon emissions of top streaming platforms. Estimate how binge-watching Netflix or listening to Spotify adds to your footprint.",
        queryChips: ["streaming carbon footprint", "netflix emissions", "youtube carbon footprint", "spotify co2"],
        eyebrow: "Streaming Emissions Hub",
        intro: "Streaming video and audio relies on complex networks to deliver high-quality media directly to your device. As resolutions increase, so does the amount of data transferred, which uses more server and network energy.",
        categoryFilter: ["Streaming"],
        sections: [
            {
                title: "Data Centers to Devices",
                body: "Streaming's carbon footprint comes from three main sources: the data centers storing the media, the transmission networks delivering it, and the device you use to watch or listen."
            },
            {
                title: "Audio vs. Video",
                body: "Video streaming requires significantly more bandwidth than audio. Watching 4K video consumes considerably more energy and generates more emissions compared to standard definition streaming or listening to music."
            }
        ]
    },
    "digital-carbon-footprint": {
        slug: "digital-carbon-footprint",
        title: "Digital Carbon Footprint",
        seoTitle: "What is a Digital Carbon Footprint? Definition & Guide | IdleForest",
        seoDescription: "Learn what a digital carbon footprint is and how your internet usage, emails, and Zoom meetings contribute to global carbon emissions.",
        queryChips: ["digital carbon footprint", "internet emissions", "reduce digital footprint", "carbon footprint of internet"],
        eyebrow: "Digital Sustainability Hub",
        intro: "Every email sent, video watched, and website loaded uses a fraction of electrical energy. While individual actions seem tiny, billions of connected devices and data centers combine to form our global digital carbon footprint.",
        categoryFilter: ["Browsing", "Social", "Work"],
        sections: [
            {
                title: "The Invisible Cloud",
                body: "When we save files to the cloud, they are actually stored on physical servers in massive data centers. These facilities run 24/7 and consume enormous amounts of electricity."
            },
            {
                title: "How Can You Reduce It?",
                body: "You can reduce your digital carbon footprint by keeping devices longer, streaming efficiently, closing unused browser tabs, and turning off video during meetings when appropriate."
            }
        ]
    }
};

export function getCarbonHub(slug: string): CarbonHubDefinition | undefined {
    return CARBON_HUBS[slug];
}

export function getCarbonHubPages(hub: CarbonHubDefinition): CarbonData[] {
    if (hub.categoryFilter && hub.categoryFilter.length > 0) {
        return CARBON_DATA.filter(data => hub.categoryFilter!.includes(data.category));
    }
    return CARBON_DATA;
}
