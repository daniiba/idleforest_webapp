import type { Metadata } from 'next'
import { AnimalTrackingStudio } from '@/components/animal-tracking/AnimalTrackingStudio'
import { buildLocalizedAlternates, getLocalizedUrl } from '@/lib/carbon-routing'

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
	const title = 'Tracked Animals | IdleForest'
	const description = 'Follow real public Movebank GPS tracks with field images, cause funding, and clearly cited movement data.'

	return {
		title,
		description,
		alternates: buildLocalizedAlternates('/animals', params.locale),
		openGraph: {
			title,
			description,
			url: getLocalizedUrl('/animals', params.locale),
			type: 'website',
		},
	}
}

export default function AnimalsPage() {
	return (
		<div className="container mx-auto px-4 pb-16 pt-32">
			<div className="mx-auto max-w-6xl">
				<div className="mb-6 border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
					<div className="inline-flex border-2 border-black bg-brand-yellow px-3 py-1 text-xs font-extrabold uppercase text-black">
						IdleForest animal tracking
					</div>
					<h1 className="mt-4 text-4xl font-black uppercase leading-none text-black md:text-6xl">
						Track the animals teams unlock
					</h1>
					<p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-neutral-700">
						These first profiles use public Movebank GPS data from the Galapagos Albatrosses study. The store and donation layer is campaign scaffolding around a cited, real movement dataset.
					</p>
				</div>

				<AnimalTrackingStudio />
			</div>
		</div>
	)
}
