export interface AnimalTrackPoint {
	lat: number
	lng: number
	recordedAt: string
	label: string
}

export interface AnimalFieldImage {
	url: string
	alt: string
	capturedAt: string
	credit: string
}

export interface AnimalStoreItem {
	name: string
	price: string
	description: string
}

export interface MovebankSource {
	studyId: number
	studyName: string
	individualLocalIdentifier: string
	taxon: string
	sensorType: string
	licenseType: string
	citation: string
	studyUrl: string
	apiUrl: string
}

export interface AnimalTrackingProfile {
	id: string
	name: string
	species: string
	status: string
	teamTarget: number
	locationLabel: string
	trackingDelay: string
	signalLabel: string
	updateFrequency: string
	causeName: string
	causeUrl: string
	donationGoalUsd: number
	donatedUsd: number
	storeTheme: string
	story: string
	heroImage: string
	imageAlt: string
	latestImages: AnimalFieldImage[]
	storeItems: AnimalStoreItem[]
	gpsTrack: AnimalTrackPoint[]
	source: MovebankSource
}

export const MOVEBANK_ALBATROSS_STUDY = {
	id: 2911040,
	name: 'Galapagos Albatrosses',
	url: 'https://www.movebank.org/cms/webapp?gwt_fragment=page=studies,path=study2911040',
	apiUrl: 'https://www.movebank.org/movebank/service/public/json',
	licenseType: 'CC_0',
	citation: 'Cruz S, Proaño CB, Anderson D, Huyvaert K, Wikelski M. 2013. Data from: The Environmental-Data Automated Track Annotation (Env-DATA) System: Linking animal tracks with environmental data. Movebank Data Repository. https://doi.org/10.5441/001/1.3hp3s250',
	taxon: 'Phoebastria irrorata',
	sensorType: 'gps',
}

const albatrossSource = (individualLocalIdentifier: string): MovebankSource => ({
	studyId: MOVEBANK_ALBATROSS_STUDY.id,
	studyName: MOVEBANK_ALBATROSS_STUDY.name,
	individualLocalIdentifier,
	taxon: MOVEBANK_ALBATROSS_STUDY.taxon,
	sensorType: MOVEBANK_ALBATROSS_STUDY.sensorType,
	licenseType: MOVEBANK_ALBATROSS_STUDY.licenseType,
	citation: MOVEBANK_ALBATROSS_STUDY.citation,
	studyUrl: MOVEBANK_ALBATROSS_STUDY.url,
	apiUrl: MOVEBANK_ALBATROSS_STUDY.apiUrl,
})

export const ANIMAL_TRACKING_PROFILES: AnimalTrackingProfile[] = [
	{
		id: 'alba-1163',
		name: 'Albatross 1163',
		species: 'Waved albatross',
		status: 'Real Movebank GPS',
		teamTarget: 25,
		locationLabel: 'Galapagos breeding and foraging route',
		trackingDelay: 'Archived public dataset',
		signalLabel: 'GPS tag',
		updateFrequency: 'Fetched from Movebank public JSON',
		causeName: 'Galapagos Conservancy',
		causeUrl: 'https://www.galapagos.org/give/',
		donationGoalUsd: 1800,
		donatedUsd: 0,
		storeTheme: 'Waved albatross field capsule',
		story: 'This profile uses real GPS locations from the public Movebank Galapagos Albatrosses study. Store and cause copy are IdleForest campaign scaffolding; the movement route is the verified data layer.',
		heroImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mated_pair_of_Waved_albatross_%28Phoebastria_irrorata%29.jpg?width=1200',
		imageAlt: 'Mated pair of waved albatrosses',
		latestImages: [
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Waved_Albatross_pair.jpg?width=900',
				alt: 'Pair of waved albatrosses on Espanola Island',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Waved_Albatross_%28Phoebastria_irrorata%29_-pair.jpg?width=900',
				alt: 'Waved albatross pair',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoebastria_irrorata_-Waved_Albatross_adult_and_chick.jpg?width=900',
				alt: 'Waved albatross adult and chick',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
		],
		storeItems: [
			{ name: 'Route patch', price: '$18', description: 'Campaign product concept for Galapagos conservation support.' },
			{ name: 'Field log pin', price: '$9', description: 'Small add-on concept for team unlock campaigns.' },
			{ name: 'Albatross print', price: '$28', description: 'Premium reward concept for larger team campaigns.' },
		],
		gpsTrack: [
			{ lat: -0.8058915, lng: -87.4855635, recordedAt: '2008-09-27', label: 'Movebank fix 1' },
			{ lat: -0.8028057, lng: -87.5098401, recordedAt: '2008-09-27', label: 'Movebank fix 2' },
			{ lat: -0.8003032, lng: -87.5382702, recordedAt: '2008-09-27', label: 'Movebank fix 3' },
			{ lat: -0.7931009, lng: -87.544123, recordedAt: '2008-09-27', label: 'Movebank fix 4' },
			{ lat: -0.7951477, lng: -87.4791078, recordedAt: '2008-09-27', label: 'Movebank fix 5' },
			{ lat: -0.7660345, lng: -87.4386168, recordedAt: '2008-09-27', label: 'Movebank fix 6' },
			{ lat: -0.7640404, lng: -87.5690427, recordedAt: '2008-09-27', label: 'Movebank fix 7' },
			{ lat: -0.8839956, lng: -88.2267762, recordedAt: '2008-09-27', label: 'Movebank fix 8' },
			{ lat: -0.9706767, lng: -88.6682966, recordedAt: '2008-09-27', label: 'Movebank fix 9' },
			{ lat: -0.9878766, lng: -88.8574839, recordedAt: '2008-09-27', label: 'Movebank fix 10' },
			{ lat: -1.0260562, lng: -89.0090819, recordedAt: '2008-09-28', label: 'Movebank fix 11' },
			{ lat: -1.0110304, lng: -89.042051, recordedAt: '2008-09-28', label: 'Movebank fix 12' },
			{ lat: -0.9879673, lng: -89.0665396, recordedAt: '2008-09-28', label: 'Movebank fix 13' },
			{ lat: -0.9583294, lng: -89.0915004, recordedAt: '2008-09-28', label: 'Movebank fix 14' },
			{ lat: -0.938888, lng: -89.114899, recordedAt: '2008-09-28', label: 'Movebank fix 15' },
			{ lat: -0.9268222, lng: -89.1407852, recordedAt: '2008-09-28', label: 'Movebank fix 16' },
			{ lat: -0.9175476, lng: -89.1723993, recordedAt: '2008-09-28', label: 'Movebank fix 17' },
			{ lat: -0.9111471, lng: -89.2025945, recordedAt: '2008-09-28', label: 'Movebank fix 18' },
			{ lat: -0.9990224, lng: -89.396952, recordedAt: '2008-09-28', label: 'Movebank fix 19' },
			{ lat: -1.249344, lng: -89.5653114, recordedAt: '2008-09-28', label: 'Latest Movebank fix' },
		],
		source: albatrossSource('1163-1163'),
	},
	{
		id: 'alba-2131',
		name: 'Albatross 2131',
		species: 'Waved albatross',
		status: 'Real Movebank GPS',
		teamTarget: 50,
		locationLabel: 'Espanola and Galapagos nearshore loop',
		trackingDelay: 'Archived public dataset',
		signalLabel: 'GPS tag',
		updateFrequency: 'Fetched from Movebank public JSON',
		causeName: 'Galapagos Conservancy',
		causeUrl: 'https://www.galapagos.org/give/',
		donationGoalUsd: 2600,
		donatedUsd: 0,
		storeTheme: 'Island route capsule',
		story: 'This profile is mapped from real locations for individual 2131-2131 in Movebank study 2911040. The route is public, archived research data rather than a live current animal location.',
		heroImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Waved_Albatross_%28Phoebastria_irrorata%29_-3_on_Espanola.jpg?width=1200',
		imageAlt: 'Waved albatrosses on Espanola Island',
		latestImages: [
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mated_pair_of_Waved_albatross_%28Phoebastria_irrorata%29.jpg?width=900',
				alt: 'Mated pair of waved albatrosses',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Waved_Albatross_pair.jpg?width=900',
				alt: 'Waved albatross pair',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoebastria_irrorata_-Waved_Albatross_adult_and_chick.jpg?width=900',
				alt: 'Waved albatross adult and chick',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
		],
		storeItems: [
			{ name: 'Island patch', price: '$18', description: 'Campaign product concept for Galapagos conservation support.' },
			{ name: 'GPS route card', price: '$12', description: 'Printed route concept based on public Movebank data.' },
			{ name: 'Seabird tee', price: '$32', description: 'Store anchor concept for team campaigns.' },
		],
		gpsTrack: [
			{ lat: -1.4257572, lng: -89.8374421, recordedAt: '2008-08-01', label: 'Movebank fix 1' },
			{ lat: -1.4203552, lng: -89.8503916, recordedAt: '2008-08-01', label: 'Movebank fix 2' },
			{ lat: -1.4159588, lng: -89.8604057, recordedAt: '2008-08-01', label: 'Movebank fix 3' },
			{ lat: -1.4142973, lng: -89.868782, recordedAt: '2008-08-01', label: 'Movebank fix 4' },
			{ lat: -1.38315, lng: -89.7414058, recordedAt: '2008-08-01', label: 'Movebank fix 5' },
			{ lat: -1.3894743, lng: -89.6209118, recordedAt: '2008-08-01', label: 'Movebank fix 6' },
			{ lat: -1.3894463, lng: -89.6209441, recordedAt: '2008-08-01', label: 'Movebank fix 7' },
			{ lat: -1.3584857, lng: -89.5008491, recordedAt: '2008-08-01', label: 'Movebank fix 8' },
			{ lat: -1.3580124, lng: -89.5169976, recordedAt: '2008-08-01', label: 'Movebank fix 9' },
			{ lat: -1.3644984, lng: -89.5287635, recordedAt: '2008-08-01', label: 'Movebank fix 10' },
			{ lat: -1.3717158, lng: -89.5427987, recordedAt: '2008-08-01', label: 'Movebank fix 11' },
			{ lat: -1.389542, lng: -89.6210018, recordedAt: '2008-08-01', label: 'Movebank fix 12' },
			{ lat: -1.3894776, lng: -89.6209406, recordedAt: '2008-08-02', label: 'Movebank fix 13' },
			{ lat: -1.3894715, lng: -89.6209199, recordedAt: '2008-08-02', label: 'Movebank fix 14' },
			{ lat: -1.3890065, lng: -89.6210908, recordedAt: '2008-08-02', label: 'Movebank fix 15' },
			{ lat: -1.3889972, lng: -89.6210616, recordedAt: '2008-08-02', label: 'Movebank fix 16' },
			{ lat: -1.389032, lng: -89.6211273, recordedAt: '2008-08-02', label: 'Movebank fix 17' },
			{ lat: -1.3890785, lng: -89.6210322, recordedAt: '2008-08-02', label: 'Movebank fix 18' },
			{ lat: -1.3890327, lng: -89.6210462, recordedAt: '2008-08-02', label: 'Movebank fix 19' },
			{ lat: -1.3890252, lng: -89.6210788, recordedAt: '2008-08-02', label: 'Latest Movebank fix' },
		],
		source: albatrossSource('2131-2131'),
	},
	{
		id: 'alba-4262',
		name: 'Albatross 4262',
		species: 'Waved albatross',
		status: 'Real Movebank GPS',
		teamTarget: 100,
		locationLabel: 'Galapagos coastal foraging movement',
		trackingDelay: 'Archived public dataset',
		signalLabel: 'GPS tag',
		updateFrequency: 'Fetched from Movebank public JSON',
		causeName: 'Galapagos Conservancy',
		causeUrl: 'https://www.galapagos.org/give/',
		donationGoalUsd: 4200,
		donatedUsd: 0,
		storeTheme: 'Open-ocean flight capsule',
		story: 'This profile uses public Movebank GPS points for individual 4262-84830876. It gives us real route rendering now, while the adoption/store parts remain the product layer around the data.',
		heroImage: 'https://commons.wikimedia.org/wiki/Special:FilePath/Waved_Albatross_pair.jpg?width=1200',
		imageAlt: 'Pair of waved albatrosses in the Galapagos',
		latestImages: [
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Waved_Albatross_%28Phoebastria_irrorata%29_-3_on_Espanola.jpg?width=900',
				alt: 'Waved albatrosses on Espanola',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mated_pair_of_Waved_albatross_%28Phoebastria_irrorata%29.jpg?width=900',
				alt: 'Mated pair of waved albatrosses',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
			{
				url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoebastria_irrorata_-Waved_Albatross_adult_and_chick.jpg?width=900',
				alt: 'Waved albatross adult and chick',
				capturedAt: 'Species reference',
				credit: 'Wikimedia Commons',
			},
		],
		storeItems: [
			{ name: 'Flight map print', price: '$28', description: 'Premium route-print concept for team campaigns.' },
			{ name: 'Research pin', price: '$9', description: 'Small product concept for conservation support.' },
			{ name: 'Team certificate', price: '$16', description: 'Printable unlock concept tied to the public route.' },
		],
		gpsTrack: [
			{ lat: -1.3726998, lng: -89.7403708, recordedAt: '2008-07-05', label: 'Movebank fix 1' },
			{ lat: -1.3727033, lng: -89.7403495, recordedAt: '2008-07-05', label: 'Movebank fix 2' },
			{ lat: -1.3727063, lng: -89.7403663, recordedAt: '2008-07-05', label: 'Movebank fix 3' },
			{ lat: -1.372781, lng: -89.7400609, recordedAt: '2008-07-05', label: 'Movebank fix 4' },
			{ lat: -1.3725496, lng: -89.7401877, recordedAt: '2008-07-05', label: 'Movebank fix 5' },
			{ lat: -1.3736857, lng: -89.7581263, recordedAt: '2008-07-05', label: 'Movebank fix 6' },
			{ lat: -1.3607476, lng: -89.7715568, recordedAt: '2008-07-05', label: 'Movebank fix 7' },
			{ lat: -1.3491038, lng: -89.7829594, recordedAt: '2008-07-05', label: 'Movebank fix 8' },
			{ lat: -1.3368108, lng: -89.7814306, recordedAt: '2008-07-05', label: 'Movebank fix 9' },
			{ lat: -1.3236788, lng: -89.7832377, recordedAt: '2008-07-05', label: 'Movebank fix 10' },
			{ lat: -1.372662, lng: -89.7400734, recordedAt: '2008-07-06', label: 'Movebank fix 11' },
			{ lat: -1.3726153, lng: -89.7400614, recordedAt: '2008-07-06', label: 'Movebank fix 12' },
			{ lat: -1.372586, lng: -89.7401869, recordedAt: '2008-07-06', label: 'Movebank fix 13' },
			{ lat: -1.3726037, lng: -89.740067, recordedAt: '2008-07-06', label: 'Movebank fix 14' },
			{ lat: -1.3725986, lng: -89.7400425, recordedAt: '2008-07-06', label: 'Movebank fix 15' },
			{ lat: -1.3725996, lng: -89.7400432, recordedAt: '2008-07-06', label: 'Movebank fix 16' },
			{ lat: -1.3725973, lng: -89.7400444, recordedAt: '2008-07-06', label: 'Movebank fix 17' },
			{ lat: -1.3725946, lng: -89.740062, recordedAt: '2008-07-06', label: 'Movebank fix 18' },
			{ lat: -1.3726035, lng: -89.7400632, recordedAt: '2008-07-06', label: 'Movebank fix 19' },
			{ lat: -1.3726746, lng: -89.7400716, recordedAt: '2008-07-06', label: 'Latest Movebank fix' },
		],
		source: albatrossSource('4262-84830876'),
	},
]

export function getUnlockedAnimalTrackingProfiles(activeDesktopMembers: number) {
	return ANIMAL_TRACKING_PROFILES.filter((profile) => activeDesktopMembers >= profile.teamTarget)
}

export function getNextAnimalTrackingProfile(activeDesktopMembers: number) {
	return ANIMAL_TRACKING_PROFILES
		.slice()
		.sort((a, b) => a.teamTarget - b.teamTarget)
		.find((profile) => activeDesktopMembers < profile.teamTarget) || null
}

export function getTeamAnimalTrackingProfiles(activeDesktopMembers: number) {
	const unlocked = getUnlockedAnimalTrackingProfiles(activeDesktopMembers)
	const next = getNextAnimalTrackingProfile(activeDesktopMembers)

	return {
		unlocked,
		next,
		all: ANIMAL_TRACKING_PROFILES,
	}
}
