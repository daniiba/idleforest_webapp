import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import TeamClient from "./TeamClient";
import { notFound } from "next/navigation";
import { buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";
import { LOCALE_NAMES } from "@/lib/seo-locales";

// Define Page Params
type Props = {
	params: { locale: string; slug: string };
	searchParams: { [key: string]: string | string[] | undefined };
}

async function getTeam(slug: string) {
	const supabase = await createClient();
	const { data: team } = await supabase
		.from("teams")
		.select("*, team_daily_stats(*)") // Fetch stats for schema
		.eq("slug", slug)
		.single();

	return team;
}

export async function generateMetadata(
	{ params }: Props,
): Promise<Metadata> {
	const { slug } = params;
	const team = await getTeam(slug);

	if (!team) {
		return {
			title: `Team Not Found | IdleForest ${LOCALE_NAMES[params.locale] || 'English'}`,
		};
	}

	const localeName = LOCALE_NAMES[params.locale] || 'English';
	const title = `${team.name} | IdleForest Teams (${localeName})`;
	const description = team.description || `Join ${team.name} on IdleForest and plant trees together!`;
	const path = `/teams/${slug}`;

	return {
		title,
		description,
		alternates: buildLocalizedAlternates(path, params.locale),
		openGraph: {
			title: `${team.name} - IdleForest Team (${localeName})`,
			description,
			url: getLocalizedUrl(path, params.locale),
			images: team.image_url ? [team.image_url] : [],
			type: "website",
		},
	};
}

export default async function TeamPage({ params }: Props) {
	const { slug } = params;
	const team = await getTeam(slug);

	if (!team) {
		notFound();
	}

	// Get latest member count and total points
	// Check if we have stats
	const latestStats = team.team_daily_stats?.[0] || {};
	const memberCount = latestStats.member_count || 0; // Fallback or we might need another query if stats empty

	// JSON-LD for "Organization"
	// As per User Strategy: "@type": "Organization", "memberOf": "IdleForest"
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": team.name,
		"description": team.description || `A team on IdleForest planting trees.`,
		"url": `https://idleforest.com/teams/${team.slug}`,
		"logo": team.image_url || "https://idleforest.com/logo.png",
		"memberOf": {
			"@type": "Organization",
			"name": "IdleForest",
			"url": "https://idleforest.com"
		},
		"interactionStatistic": [
			{
				"@type": "InteractionCounter",
				"interactionType": "https://schema.org/JoinAction",
				"userInteractionCount": memberCount
			},
			{
				"@type": "InteractionCounter",
				"interactionType": "https://schema.org/LikeAction",
				"userInteractionCount": team.total_points // Using points as a proxy for "likes" or "score"
			}
		]
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<TeamClient />
		</>
	);
}
