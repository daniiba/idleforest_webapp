'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function WelcomePage() {
	return (
		<div className="relative min-h-screen flex items-center justify-center p-4 bg-brand-gray overflow-hidden">
		
			{/* Yellow brand shape for depth and consistency */}
			<Image
				src="/yellow-shape.svg"
				alt=""
				fill
				sizes="150vw"
				className="absolute -bottom-20 -left-10 object-cover pointer-events-none select-none opacity-100"
			/>
				<Card className="relative max-w-2xl w-full p-8 space-y-8 shadow-lg border border-black/10 bg-white rounded-xl">
				<div className="space-y-4">
					<h1 className="text-4xl font-bold text-center text-black">Welcome to Your Forest! 🌳</h1>
					
					<p className="text-center text-neutral-700 text-lg">
						To activate the extension, open the Idleforest extension and click <span className="font-semibold">Start Planting</span>.
					</p>
				</div>
				<div className="space-y-6">
					<div className="space-y-4">
						<h2 className="text-2xl font-medium text-black">What's Next</h2>
						<ul className="space-y-4 text-neutral-800">
							<li className="flex items-start bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
								<span className="mr-3 flex-shrink-0 w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center text-black font-medium">1</span>
								<span>Open the Idleforest browser extension from your toolbar</span>
							</li>
							<li className="flex items-start bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
								<span className="mr-3 flex-shrink-0 w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center text-black font-medium">2</span>
								<div className="flex-1">
									<p>Click <span className="font-semibold">Start Planting</span> to activate tree planting</p>
									<div className="mt-3 w-full rounded-lg overflow-hidden border border-neutral-200">
										<Image
											src="/onboarding/start_extension.png"
											alt="Open the Idleforest extension and click Start Planting"
											width={1200}
											height={750}
											className="w-full h-auto object-cover"
											priority
										/>
									</div>
								</div>
							</li>
							<li className="flex items-start bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
								<span className="mr-3 flex-shrink-0 w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center text-black font-medium">3</span>
								<span>Browse normally and check back here to see your impact grow</span>
							</li>
						</ul>
					</div>



					<div className="bg-white p-6 rounded-lg border border-black/10">
						<p className="text-center text-black text-lg font-medium">
							Click <span className="font-semibold">Start Planting</span> in the extension to begin planting real trees automatically. 🌱
						</p>
					</div>

					<div className="space-y-4">
						<p className="text-sm text-center text-neutral-700">
							Thank you for joining our mission to make the internet a greener place
						</p>
						<p className="text-sm text-center text-neutral-600">
							Once you've clicked Start Planting, you can close this page and continue browsing normally
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}