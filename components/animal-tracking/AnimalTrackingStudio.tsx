'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
	ArrowUpRight,
	CalendarDays,
	Camera,
	HeartHandshake,
	MapPinned,
	RadioTower,
	ShoppingBag,
	Target,
} from 'lucide-react'
import { Link } from '@/navigation'
import {
	ANIMAL_TRACKING_PROFILES,
	AnimalTrackingProfile,
} from '@/lib/animal-tracking'

interface MovebankTrackingResponse {
	source?: {
		studyName: string
		studyUrl: string
		licenseType: string
		citation: string
		fetchedAt: string
	}
	profiles?: AnimalTrackingProfile[]
}

function formatCurrency(value: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(value)
}

function projectTrack(track: AnimalTrackingProfile['gpsTrack']) {
	const lngs = track.map((point) => point.lng)
	const lats = track.map((point) => point.lat)
	const minLng = Math.min(...lngs)
	const maxLng = Math.max(...lngs)
	const minLat = Math.min(...lats)
	const maxLat = Math.max(...lats)
	const lngSpan = Math.max(maxLng - minLng, 0.01)
	const latSpan = Math.max(maxLat - minLat, 0.01)

	return track.map((point) => ({
		...point,
		x: 8 + ((point.lng - minLng) / lngSpan) * 84,
		y: 92 - ((point.lat - minLat) / latSpan) * 84,
	}))
}

function AnimalMap({ animal }: { animal: AnimalTrackingProfile }) {
	const points = useMemo(() => projectTrack(animal.gpsTrack), [animal])
	const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
	const latest = points[points.length - 1]
	const first = points[0]

	return (
		<div className="border-2 border-black bg-[#f5f7ef] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
			<div className="flex flex-col gap-3 border-b-2 border-black bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-2 text-xs font-extrabold uppercase text-neutral-500">
						<MapPinned className="h-4 w-4 text-green-700" />
						{animal.locationLabel}
					</div>
					<h2 className="mt-1 text-2xl font-black uppercase leading-tight text-black">{animal.name}'s route</h2>
				</div>
				<div className="flex flex-wrap gap-2 text-[11px] font-extrabold uppercase text-black">
					<span className="border-2 border-black bg-brand-yellow px-2 py-1">{animal.signalLabel}</span>
					<span className="border-2 border-black bg-white px-2 py-1">{animal.trackingDelay}</span>
				</div>
			</div>

			<div className="grid gap-0 lg:grid-cols-[1fr_260px]">
				<div className="relative min-h-[320px] overflow-hidden bg-[#dceadf] p-3">
					<svg viewBox="0 0 100 100" className="h-full min-h-[320px] w-full" role="img" aria-label={`${animal.name} GPS route map`}>
						<defs>
							<pattern id={`grid-${animal.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
								<path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(11,16,31,0.12)" strokeWidth="0.35" />
							</pattern>
							<linearGradient id={`route-${animal.id}`} x1="0%" x2="100%" y1="0%" y2="100%">
								<stop offset="0%" stopColor="#0B101F" />
								<stop offset="50%" stopColor="#1f8f60" />
								<stop offset="100%" stopColor="#E0F146" />
							</linearGradient>
						</defs>
						<rect width="100" height="100" fill={`url(#grid-${animal.id})`} />
						<path d="M4 76 C18 62 28 70 38 54 C50 34 62 46 78 25 C87 13 94 18 98 10" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="8" strokeLinecap="round" />
						<path d="M0 84 C18 77 24 88 42 80 C58 73 62 84 80 72 C90 65 95 70 100 62 L100 100 L0 100Z" fill="rgba(11,16,31,0.1)" />
						<path d={path} fill="none" stroke={`url(#route-${animal.id})`} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
						{points.map((point, index) => (
							<g key={`${point.recordedAt}-${point.label}`}>
								<circle cx={point.x} cy={point.y} r={index === points.length - 1 ? 2.8 : 1.7} fill={index === points.length - 1 ? '#E0F146' : '#ffffff'} stroke="#0B101F" strokeWidth="0.8" />
							</g>
						))}
						<text x={first.x} y={Math.max(5, first.y - 4)} fontSize="3" fontWeight="800" fill="#0B101F">start</text>
						<text x={Math.min(76, latest.x + 3)} y={Math.max(5, latest.y - 3)} fontSize="3" fontWeight="800" fill="#0B101F">latest</text>
					</svg>
				</div>

				<div className="border-t-2 border-black bg-white p-4 lg:border-l-2 lg:border-t-0">
					<div className="space-y-3">
						{animal.gpsTrack.slice().reverse().slice(0, 5).map((point) => (
							<div key={`${point.recordedAt}-${point.label}`} className="border-2 border-black bg-neutral-50 p-3">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-black uppercase text-black">{point.label}</p>
									<p className="text-[10px] font-extrabold uppercase text-neutral-500">{point.recordedAt}</p>
								</div>
								<p className="mt-1 font-mono text-xs text-neutral-700">
									{point.lat.toFixed(2)}, {point.lng.toFixed(2)}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

function AnimalSelector({
	profiles,
	selectedId,
	activeDesktopMembers,
	onSelect,
}: {
	profiles: AnimalTrackingProfile[]
	selectedId: string
	activeDesktopMembers?: number
	onSelect: (id: string) => void
}) {
	return (
		<div className="grid gap-3 md:grid-cols-3">
			{profiles.map((profile) => {
				const locked = typeof activeDesktopMembers === 'number' && activeDesktopMembers < profile.teamTarget
				const selected = selectedId === profile.id

				return (
					<button
						key={profile.id}
						type="button"
						onClick={() => onSelect(profile.id)}
						className={`min-h-[112px] border-2 border-black bg-white p-3 text-left transition-all hover:translate-x-[1px] hover:translate-y-[1px] ${
							selected ? 'shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]' : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-lg font-black uppercase text-black">{profile.name}</p>
								<p className="text-xs font-extrabold uppercase text-neutral-500">{profile.species}</p>
							</div>
							<span className={`border-2 border-black px-2 py-1 text-[10px] font-extrabold uppercase ${locked ? 'bg-neutral-100 text-neutral-500' : 'bg-brand-yellow text-black'}`}>
								{locked ? `${profile.teamTarget} desktop` : 'Unlocked'}
							</span>
						</div>
						<p className="mt-3 line-clamp-2 text-xs font-semibold leading-relaxed text-neutral-700">{profile.locationLabel}</p>
					</button>
				)
			})}
		</div>
	)
}

export function AnimalTrackingStudio({
	initialAnimalId,
	activeDesktopMembers,
	teamName,
	showTeamProgress = false,
}: {
	initialAnimalId?: string
	activeDesktopMembers?: number
	teamName?: string
	showTeamProgress?: boolean
}) {
	const [profiles, setProfiles] = useState(ANIMAL_TRACKING_PROFILES)
	const [sourceFetchedAt, setSourceFetchedAt] = useState<string | null>(null)
	const [sourceError, setSourceError] = useState<string | null>(null)
	const firstUnlocked = typeof activeDesktopMembers === 'number'
		? profiles.find((profile) => activeDesktopMembers >= profile.teamTarget)
		: profiles[0]
	const [selectedAnimalId, setSelectedAnimalId] = useState(initialAnimalId || firstUnlocked?.id || ANIMAL_TRACKING_PROFILES[0].id)
	const selectedAnimal = profiles.find((profile) => profile.id === selectedAnimalId) || profiles[0]
	const donationPercent = Math.min(100, Math.round((selectedAnimal.donatedUsd / selectedAnimal.donationGoalUsd) * 100))
	const nextAnimal = typeof activeDesktopMembers === 'number'
		? profiles
			.slice()
			.sort((a, b) => a.teamTarget - b.teamTarget)
			.find((profile) => activeDesktopMembers < profile.teamTarget) || null
		: null

	useEffect(() => {
		let isMounted = true

		async function loadMovebankTracks() {
			try {
				const response = await fetch('/api/animal-tracking/movebank')
				if (!response.ok) {
					throw new Error('Movebank route failed')
				}

				const data = await response.json() as MovebankTrackingResponse
				if (!isMounted) return

				if (data.profiles?.length) {
					setProfiles(data.profiles)
				}
				if (data.source?.fetchedAt) {
					setSourceFetchedAt(data.source.fetchedAt)
				}
				setSourceError(null)
			} catch (error) {
				if (!isMounted) return
				console.error('Failed to load Movebank animal tracks:', error)
				setSourceError('Using cached public Movebank route data')
			}
		}

		loadMovebankTracks()

		return () => {
			isMounted = false
		}
	}, [])

	return (
		<section className="space-y-6">
			{showTeamProgress && typeof activeDesktopMembers === 'number' && (
				<div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<div className="inline-flex items-center gap-2 border-2 border-black bg-green-100 px-3 py-1 text-xs font-extrabold uppercase text-green-900">
								<Target className="h-4 w-4" />
								Team tracking
							</div>
							<h2 className="mt-2 text-2xl font-black uppercase text-black">{teamName || 'This team'} animal tracker</h2>
							<p className="mt-1 max-w-2xl text-sm font-medium text-neutral-700">
								{activeDesktopMembers.toLocaleString()} active desktop members are counted toward tracked profile unlocks.
							</p>
						</div>
						{nextAnimal ? (
							<div className="border-2 border-black bg-brand-yellow p-3 text-sm font-black uppercase text-black">
								{Math.max(0, nextAnimal.teamTarget - activeDesktopMembers).toLocaleString()} to {nextAnimal.name}
							</div>
						) : (
							<div className="border-2 border-black bg-green-500 p-3 text-sm font-black uppercase text-white">
								All real profiles unlocked
							</div>
						)}
					</div>
				</div>
			)}

			<AnimalSelector
				profiles={profiles}
				selectedId={selectedAnimal.id}
				activeDesktopMembers={activeDesktopMembers}
				onSelect={setSelectedAnimalId}
			/>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="space-y-6">
					<div className="overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
						<div className="relative min-h-[360px]">
							<Image
								src={selectedAnimal.heroImage}
								alt={selectedAnimal.imageAlt}
								fill
								unoptimized
								sizes="(min-width: 1024px) 720px, 100vw"
								className="absolute inset-0 h-full w-full object-cover"
							/>
							<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 text-white">
								<div className="mb-3 flex flex-wrap gap-2">
									<span className="border-2 border-white bg-black/60 px-2 py-1 text-[11px] font-extrabold uppercase">{selectedAnimal.status}</span>
									<span className="border-2 border-white bg-brand-yellow px-2 py-1 text-[11px] font-extrabold uppercase text-black">{selectedAnimal.teamTarget} desktop target</span>
								</div>
								<h1 className="text-4xl font-black uppercase leading-none md:text-6xl">{selectedAnimal.name}</h1>
								<p className="mt-2 text-sm font-bold uppercase tracking-wide text-white/80">{selectedAnimal.species}</p>
							</div>
						</div>
						<div className="p-5">
							<p className="text-base font-medium leading-relaxed text-neutral-800">{selectedAnimal.story}</p>
							<div className="mt-4 border-2 border-black bg-neutral-50 p-3 text-xs font-bold text-neutral-700">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<span className="uppercase text-black">
										Source: {selectedAnimal.source.studyName} / {selectedAnimal.source.individualLocalIdentifier}
									</span>
									<a
										href={selectedAnimal.source.studyUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 font-extrabold uppercase text-black underline-offset-2 hover:underline"
									>
										Movebank study <ArrowUpRight className="h-3 w-3" />
									</a>
								</div>
								<p className="mt-2 leading-relaxed">
									License: {selectedAnimal.source.licenseType}. {selectedAnimal.source.citation}
								</p>
								{sourceFetchedAt && (
									<p className="mt-2 uppercase text-neutral-500">
										Refreshed from Movebank {new Date(sourceFetchedAt).toLocaleString()}
									</p>
								)}
								{sourceError && (
									<p className="mt-2 uppercase text-amber-700">{sourceError}</p>
								)}
							</div>
						</div>
					</div>

					<AnimalMap animal={selectedAnimal} />

					<div className="grid gap-4 md:grid-cols-3">
						{selectedAnimal.latestImages.map((image) => (
							<div key={`${image.url}-${image.capturedAt}`} className="overflow-hidden border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
								<div className="relative h-44 w-full">
									<Image
										src={image.url}
										alt={image.alt}
										fill
										unoptimized
										sizes="(min-width: 768px) 33vw, 100vw"
										className="object-cover"
									/>
								</div>
								<div className="p-3">
									<div className="flex items-center gap-2 text-[10px] font-extrabold uppercase text-neutral-500">
										<Camera className="h-3.5 w-3.5" />
										{image.capturedAt}
									</div>
									<p className="mt-1 text-xs font-bold text-neutral-800">{image.credit}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<aside className="space-y-4">
					<div className="border-2 border-black bg-brand-yellow p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
						<div className="flex items-center gap-2 text-xs font-black uppercase text-black">
							<HeartHandshake className="h-4 w-4" />
							Cause
						</div>
						<h2 className="mt-2 text-2xl font-black uppercase text-black">{selectedAnimal.causeName}</h2>
						<div className="mt-4 h-3 border-2 border-black bg-white">
							<div className="h-full bg-green-500" style={{ width: `${donationPercent}%` }} />
						</div>
						<div className="mt-2 flex justify-between gap-3 text-xs font-extrabold uppercase text-black">
							<span>{formatCurrency(selectedAnimal.donatedUsd)}</span>
							<span>{formatCurrency(selectedAnimal.donationGoalUsd)}</span>
						</div>
						<a
							href={selectedAnimal.causeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-4 inline-flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-4 py-3 text-sm font-extrabold uppercase text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
						>
							Donate <ArrowUpRight className="h-4 w-4" />
						</a>
					</div>

					<div className="border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
						<div className="flex items-center gap-2 text-xs font-black uppercase text-neutral-500">
							<ShoppingBag className="h-4 w-4" />
							{selectedAnimal.storeTheme}
						</div>
						<div className="mt-4 space-y-3">
							{selectedAnimal.storeItems.map((item) => (
								<div key={item.name} className="border-2 border-black bg-neutral-50 p-3">
									<div className="flex items-center justify-between gap-3">
										<p className="text-sm font-black uppercase text-black">{item.name}</p>
										<p className="text-sm font-black text-green-700">{item.price}</p>
									</div>
									<p className="mt-1 text-xs font-medium leading-relaxed text-neutral-700">{item.description}</p>
								</div>
							))}
						</div>
					</div>

					<div className="grid gap-3 border-2 border-black bg-white p-5 text-sm shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
						<div className="flex items-center gap-3">
							<RadioTower className="h-5 w-5 text-green-700" />
							<span className="font-bold text-neutral-800">{selectedAnimal.updateFrequency}</span>
						</div>
						<div className="flex items-center gap-3">
							<CalendarDays className="h-5 w-5 text-green-700" />
							<span className="font-bold text-neutral-800">{selectedAnimal.gpsTrack[selectedAnimal.gpsTrack.length - 1].recordedAt} latest visible fix</span>
						</div>
					</div>

					<Link
						href="/teams"
						className="inline-flex w-full items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 text-sm font-extrabold uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
					>
						Find a team <ArrowUpRight className="h-4 w-4" />
					</Link>
				</aside>
			</div>
		</section>
	)
}
