import { NextResponse } from 'next/server'
import { ANIMAL_TRACKING_PROFILES, MOVEBANK_ALBATROSS_STUDY } from '@/lib/animal-tracking'

interface MovebankLocation {
	timestamp?: number
	location_long?: number
	location_lat?: number
}

interface MovebankIndividual {
	individual_local_identifier: string
	individual_taxon_canonical_name?: string
	locations?: MovebankLocation[]
}

interface MovebankResponse {
	individuals?: MovebankIndividual[]
}

function formatMovebankDate(timestamp?: number) {
	if (!timestamp) return 'Unknown date'
	return new Date(timestamp).toISOString().slice(0, 10)
}

function buildMovebankUrl() {
	const params = new URLSearchParams({
		study_id: String(MOVEBANK_ALBATROSS_STUDY.id),
		max_events_per_individual: '40',
		sensor_type: MOVEBANK_ALBATROSS_STUDY.sensorType,
		attributes: 'timestamp,location_long,location_lat',
	})

	for (const profile of ANIMAL_TRACKING_PROFILES) {
		params.append('individual_local_identifiers', profile.source.individualLocalIdentifier)
	}

	return `${MOVEBANK_ALBATROSS_STUDY.apiUrl}?${params.toString()}`
}

export async function GET() {
	try {
		const response = await fetch(buildMovebankUrl(), {
			headers: {
				Accept: 'application/json',
			},
			next: {
				revalidate: 60 * 60 * 12,
			},
		})

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Movebank request failed', status: response.status },
				{ status: 502 }
			)
		}

		const data = await response.json() as MovebankResponse
		const tracks = new Map<string, MovebankLocation[]>(
			data.individuals?.map((individual) => [
				individual.individual_local_identifier,
				individual.locations ?? [],
			]) ?? []
		)

		const profiles = ANIMAL_TRACKING_PROFILES.map((profile) => {
			const locations = tracks.get(profile.source.individualLocalIdentifier) ?? []
			const gpsTrack = locations
				.filter((location) => typeof location.location_lat === 'number' && typeof location.location_long === 'number')
				.map((location, index, all) => ({
					lat: location.location_lat as number,
					lng: location.location_long as number,
					recordedAt: formatMovebankDate(location.timestamp),
					label: index === all.length - 1 ? 'Latest Movebank fix' : `Movebank fix ${index + 1}`,
				}))

			return {
				...profile,
				gpsTrack: gpsTrack.length > 0 ? gpsTrack : profile.gpsTrack,
			}
		})

		return NextResponse.json({
			source: {
				studyId: MOVEBANK_ALBATROSS_STUDY.id,
				studyName: MOVEBANK_ALBATROSS_STUDY.name,
				studyUrl: MOVEBANK_ALBATROSS_STUDY.url,
				licenseType: MOVEBANK_ALBATROSS_STUDY.licenseType,
				citation: MOVEBANK_ALBATROSS_STUDY.citation,
				fetchedAt: new Date().toISOString(),
			},
			profiles,
		})
	} catch (error) {
		console.error('Movebank animal tracking error:', error)
		return NextResponse.json({ error: 'Failed to load Movebank tracking data' }, { status: 500 })
	}
}
