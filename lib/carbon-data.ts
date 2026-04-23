export interface CarbonSeoFaq {
    question: string;
    answer: string;
}

export interface CarbonSeoContent {
    intro: string;
    searchTopics: string[];
    faq: CarbonSeoFaq[];
}

export interface CarbonData {
    app_name: string;
    category: string;
    avg_usage_hours_day: number | "N/A";
    co2_per_hour_grams: number;
    yearly_impact_kg: number;
    human_equivalent: string;
    trees_to_offset: number;
    idleforest_pitch: string;
    slug: string;
    icon_slug?: string; // Optional override for SimpleIcons (e.g. "googlechrome" for "google-chrome")
    seo?: CarbonSeoContent;
}

export function getIconUrl(data: CarbonData): string {
    if (data.icon_slug?.startsWith("fallback:")) {
        return data.icon_slug;
    }
    // Default to slug, remove dashes/spaces if no override provided, as SimpleIcons usually uses flat lowercase
    // But some have specific slugs.
    const iconSlug = data.icon_slug || data.slug.replace(/-/g, "");
    return `https://cdn.simpleicons.org/${iconSlug}`;
}

export const CARBON_DATA: CarbonData[] = [
    {
        app_name: "Fortnite",
        category: "Gaming",
        avg_usage_hours_day: 2.5,
        co2_per_hour_grams: 150,
        yearly_impact_kg: 136.8,
        human_equivalent: "Driving a car for 550 km",
        trees_to_offset: 7,
        idleforest_pitch: "Gamers have high bandwidth. Let your rig plant trees while you sleep.",
        slug: "fortnite",
    },
    {
        app_name: "Netflix",
        category: "Streaming",
        avg_usage_hours_day: 2.0,
        co2_per_hour_grams: 55,
        yearly_impact_kg: 40.1,
        human_equivalent: "Charging 5,000 smartphones",
        trees_to_offset: 2,
        idleforest_pitch: "Offset your binge-watching automatically.",
        slug: "netflix",
        seo: {
            intro: "Netflix has strong impression volume already, but weak click-through. That usually means the page needs better search-intent alignment around streaming emissions and per-hour viewing questions.",
            searchTopics: [
                "netflix carbon footprint",
                "netflix co2 emissions",
                "co2 emissions per hour netflix streaming",
                "netflix annual carbon emissions",
                "netflix streaming co2 emissions per hour"
            ],
            faq: [
                {
                    question: "What is Netflix's carbon footprint?",
                    answer: "Netflix emissions come from streaming infrastructure, network delivery, and the device you watch on. Total impact increases with watch time, resolution, and the energy mix powering your hardware and data delivery."
                },
                {
                    question: "How much CO2 does streaming Netflix create per hour?",
                    answer: "Per-hour estimates vary by methodology, so it helps to be clear about assumptions and to estimate impact based on actual viewing habits rather than a single fixed number."
                }
            ]
        }
    },
    {
        app_name: "TikTok",
        category: "Social",
        avg_usage_hours_day: 1.5,
        co2_per_hour_grams: 160,
        yearly_impact_kg: 87.6,
        human_equivalent: "Driving 350km in a car",
        trees_to_offset: 5,
        idleforest_pitch: "Scroll guilt-free by planting trees in the background.",
        slug: "tiktok",
        seo: {
            intro: "TikTok's footprint comes from video delivery, device energy use, and the time people spend scrolling. This page gives a simple way to understand how short-form video can add up over time.",
            searchTopics: [
                "tiktok carbon footprint",
                "tiktok annual carbon emissions",
                "tiktok annual co2 emissions",
                "tiktok carbon emissions",
                "tiktok co2 emissions"
            ],
            faq: [
                {
                    question: "What is TikTok's carbon footprint?",
                    answer: "TikTok's footprint depends on video delivery, device energy use, and time spent scrolling. IdleForest estimates the impact with a simple usage-based calculator so visitors can understand and offset their own viewing habits."
                },
                {
                    question: "Why does short-form video still create emissions?",
                    answer: "Even short videos rely on data transfer, device energy, and cloud infrastructure. Frequent autoplay and endless scrolling can add up surprisingly quickly over a year."
                }
            ]
        }
    },
    {
        app_name: "ChatGPT",
        category: "AI",
        avg_usage_hours_day: 0.5,
        co2_per_hour_grams: 150,
        yearly_impact_kg: 27.3,
        human_equivalent: "Charging your smartphone 3,300 times",
        trees_to_offset: 2,
        idleforest_pitch: "AI is smart. You should be too. Offset your prompts.",
        slug: "chatgpt",
        icon_slug: "ollama",
        seo: {
            intro: "ChatGPT uses energy for every request, response, and supporting system behind the model. This page helps explain how everyday AI use contributes to digital emissions.",
            searchTopics: [
                "carbon footprint of chatgpt",
                "chatgpt co2",
                "chatgpt co2 emissions per query",
                "how much carbon does chatgpt emit",
                "what is the carbon footprint of chatgpt"
            ],
            faq: [
                {
                    question: "How much CO2 does ChatGPT produce?",
                    answer: "The exact number depends on model size, hardware efficiency, and how many prompts are generated. The true footprint varies, which is why it helps to look at practical usage-based estimates rather than a single universal number."
                },
                {
                    question: "Why should ChatGPT link to broader AI emissions content?",
                    answer: "People often start with ChatGPT and then want to understand AI energy use more broadly. Looking at both the specific tool and the wider topic gives a clearer picture of how AI affects emissions."
                }
            ]
        }
    },
    {
        app_name: "Zoom",
        category: "Work",
        avg_usage_hours_day: 3.0,
        co2_per_hour_grams: 50,
        yearly_impact_kg: 54.7,
        human_equivalent: "Driving form London to Oxford",
        trees_to_offset: 3,
        idleforest_pitch: "Remote work saves commutes but burns energy. Make your meetings carbon neutral.",
        slug: "zoom",
        seo: {
            intro: "Zoom meetings use energy for video delivery, networking, and the devices involved in every call. This page explains how work-related digital habits contribute to a broader digital carbon footprint.",
            searchTopics: [
                "zoom carbon footprint",
                "carbon footprint of a zoom call",
                "carbon footprint of zoom",
                "zoom carbon emissions"
            ],
            faq: [
                {
                    question: "What is the carbon footprint of a Zoom call?",
                    answer: "A Zoom call uses emissions from video delivery, networking, and device power. The more participants, longer call times, and higher video quality you use, the higher the total impact becomes."
                },
                {
                    question: "Does remote work eliminate meeting emissions?",
                    answer: "Remote work can reduce commuting emissions, but video meetings still require electricity and data transfer. That is why it makes sense to measure both the savings and the remaining digital footprint."
                }
            ]
        }
    },
    {
        app_name: "Instagram",
        category: "Social",
        avg_usage_hours_day: 1.0,
        co2_per_hour_grams: 90,
        yearly_impact_kg: 32.8,
        human_equivalent: "Driving 130km in a standard car",
        trees_to_offset: 2,
        idleforest_pitch: "Offset your scroll time without changing your habits.",
        slug: "instagram",
        seo: {
            intro: "Instagram's footprint comes from media delivery, mobile device power use, and the energy needed to store and serve content at global scale. This page puts that impact into everyday terms.",
            searchTopics: [
                "instagram carbon footprint",
                "carbon footprint of instagram",
                "how much energy does instagram use",
                "instagram carbon"
            ],
            faq: [
                {
                    question: "What is Instagram's carbon footprint?",
                    answer: "Instagram's footprint comes from video and image delivery, mobile device power use, and the energy required to store and serve content globally. Time spent in the app matters more than most users expect."
                },
                {
                    question: "Why can social media still have a measurable climate impact?",
                    answer: "Social platforms may feel lightweight, but billions of photos, videos, and ad impressions require data centers, networks, and devices to stay active all the time."
                }
            ]
        }
    },
    {
        app_name: "Bitcoin (1 Tx)",
        category: "Crypto",
        avg_usage_hours_day: "N/A",
        co2_per_hour_grams: 400000,
        yearly_impact_kg: 400.0,
        human_equivalent: "Burning half a ton of coal",
        trees_to_offset: 20,
        idleforest_pitch: "Crypto has a cost. IdleForest helps you pay it back to the planet.",
        slug: "bitcoin",
    },
    {
        app_name: "YouTube",
        category: "Streaming",
        avg_usage_hours_day: 1.0,
        co2_per_hour_grams: 46,
        yearly_impact_kg: 16.8,
        human_equivalent: "Manufacturing 2 plastic bottles",
        trees_to_offset: 1,
        idleforest_pitch: "Watch videos while planting a real forest.",
        slug: "youtube",
        seo: {
            intro: "YouTube's footprint comes from video processing, storage, network delivery, and the electricity used by the devices people stream on. This page explains how those pieces add up over time.",
            searchTopics: [
                "youtube annual carbon emissions",
                "youtube annual co2 emissions",
                "annual co2 emissions from youtube streaming",
                "youtube carbon footprint",
                "carbon footprint of youtube"
            ],
            faq: [
                {
                    question: "What is YouTube's carbon footprint?",
                    answer: "YouTube's impact comes from video processing, content delivery, storage, and the electricity used by the devices people stream on. Long watch sessions and higher video quality increase the total footprint."
                },
                {
                    question: "Why do YouTube emissions often get discussed as annual totals?",
                    answer: "Streaming happens at enormous scale, so annual estimates help people understand how quickly everyday viewing habits add up across a year instead of focusing only on single sessions."
                }
            ]
        }
    },
    {
        app_name: "Twitch",
        category: "Streaming",
        avg_usage_hours_day: 2.0,
        co2_per_hour_grams: 55,
        yearly_impact_kg: 40.1,
        human_equivalent: "Driving a car for 160km",
        trees_to_offset: 2,
        idleforest_pitch: "Support your favorite streamers without hurting the planet.",
        slug: "twitch",
    },
    {
        app_name: "League of Legends",
        category: "Gaming",
        avg_usage_hours_day: 2.5,
        co2_per_hour_grams: 120,
        yearly_impact_kg: 109.5,
        human_equivalent: "Driving a car for 450 km",
        trees_to_offset: 6,
        idleforest_pitch: "Turn your gaming addiction into a reforestation project.",
        slug: "league-of-legends",
        icon_slug: "leagueoflegends",
    },
    {
        app_name: "Google Chrome",
        category: "Browsing",
        avg_usage_hours_day: 4.0,
        co2_per_hour_grams: 25,
        yearly_impact_kg: 36.5,
        human_equivalent: "Charging your phone for a year",
        trees_to_offset: 2,
        idleforest_pitch: "Your browser is open anyway. Make it work for the earth.",
        slug: "google-chrome",
        icon_slug: "googlechrome",
    },
    {
        app_name: "Minecraft",
        category: "Gaming",
        avg_usage_hours_day: 2,
        co2_per_hour_grams: 100,
        yearly_impact_kg: 73,
        human_equivalent: "Driving 290km in a gas car",
        trees_to_offset: 4,
        idleforest_pitch: "Building blocks? Build a forest instead.",
        slug: "minecraft",
        icon_slug: "fallback:gamepad",
    },
    {
        app_name: "Microsoft Teams",
        category: "Work",
        avg_usage_hours_day: 2,
        co2_per_hour_grams: 50,
        yearly_impact_kg: 36.5,
        human_equivalent: "Using an LED bulb for 3 years non-stop",
        trees_to_offset: 2,
        idleforest_pitch: "Work meetings add up. Offset your 9-to-5.",
        slug: "microsoft-teams",
        icon_slug: "fallback:users",
    },
    {
        app_name: "Twitter / X",
        category: "Social",
        avg_usage_hours_day: 1.0,
        co2_per_hour_grams: 36,
        yearly_impact_kg: 13.1,
        human_equivalent: "Driving 50km in a car",
        trees_to_offset: 1,
        idleforest_pitch: "Doomscrolling? Make it green planting.",
        slug: "twitter",
        icon_slug: "x",
    },
    {
        app_name: "Spotify",
        category: "Streaming",
        avg_usage_hours_day: 3.0,
        co2_per_hour_grams: 2,
        yearly_impact_kg: 2.2,
        human_equivalent: "Boiling 5 kettles of water",
        trees_to_offset: 1,
        idleforest_pitch: "Your soundtrack shouldn't cost the Earth.",
        slug: "spotify",
    },
    {
        app_name: "Roblox",
        category: "Gaming",
        avg_usage_hours_day: 1.5,
        co2_per_hour_grams: 60,
        yearly_impact_kg: 32.8,
        human_equivalent: "Driving 130km in a car",
        trees_to_offset: 2,
        idleforest_pitch: "Play together, plant together.",
        slug: "roblox",
    },
    {
        app_name: "Ethereum (Tx)",
        category: "Crypto",
        avg_usage_hours_day: "N/A",
        co2_per_hour_grams: 13,
        yearly_impact_kg: 0.013,
        human_equivalent: "Charging 1 smartphone",
        trees_to_offset: 1,
        idleforest_pitch: "Proof of Stake is better, but planting trees is best.",
        slug: "ethereum",
        icon_slug: "ethereum",
    },
    {
        app_name: "Google Meet",
        category: "Work",
        avg_usage_hours_day: 2.0,
        co2_per_hour_grams: 45,
        yearly_impact_kg: 32.8,
        human_equivalent: "Driving 130km in a car",
        trees_to_offset: 2,
        idleforest_pitch: "Meeting adjourned. Trees planted.",
        slug: "google-meet",
        icon_slug: "googlemeet",
    },
    {
        app_name: "Snapchat",
        category: "Social",
        avg_usage_hours_day: 0.5,
        co2_per_hour_grams: 50,
        yearly_impact_kg: 9.1,
        human_equivalent: "Driving 36km in a car",
        trees_to_offset: 1,
        idleforest_pitch: "Snaps disappear. CO2 stays. Offset it.",
        slug: "snapchat",
    },
    {
        app_name: "Reddit",
        category: "Social",
        avg_usage_hours_day: 1.0,
        co2_per_hour_grams: 25,
        yearly_impact_kg: 9.1,
        human_equivalent: "Driving 36km in a car",
        trees_to_offset: 1,
        idleforest_pitch: "Karma points for the planet.",
        slug: "reddit",
    },
];

export function getCarbonData(slug: string): CarbonData | undefined {
    return CARBON_DATA.find((data) => data.slug === slug);
}

export function getAllSlugs(): string[] {
    return CARBON_DATA.map((data) => data.slug);
}

export function getCarbonCategories(): { category: string; items: CarbonData[] }[] {
    const grouped = CARBON_DATA.reduce<Record<string, CarbonData[]>>((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return Object.entries(grouped).map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.app_name.localeCompare(b.app_name)),
    }));
}

export function getFeaturedCarbonPages(limit: number = 6): CarbonData[] {
    const featuredSlugs = ["chatgpt", "instagram", "tiktok", "youtube", "netflix", "zoom"];
    return CARBON_DATA.filter((item) => featuredSlugs.includes(item.slug)).slice(0, limit);
}

export function getRelatedCarbonData(currentSlug: string, category: string, limit: number = 3): CarbonData[] {
    // 1. Filter by category, exclude current
    let related = CARBON_DATA.filter(
        (data) => data.category === category && data.slug !== currentSlug
    );

    // 2. If not enough, fill with others (excluding current and already picked)
    if (related.length < limit) {
        const others = CARBON_DATA.filter(
            (data) => data.category !== category && data.slug !== currentSlug
        );
        // Shuffle others to get random fill
        const shuffled = others.sort(() => 0.5 - Math.random());
        related = [...related, ...shuffled.slice(0, limit - related.length)];
    }

    // 3. Shuffle result to keep it dynamic (optional, or just take first N)
    // For SEO, consistent links are sometimes better, but dynamic is fine here for discovery.
    // Let's just return the first N to be stable or shuffle if we want variety.
    // Taking first N matches.
    return related.slice(0, limit);
}
