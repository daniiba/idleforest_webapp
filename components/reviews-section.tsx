"use client";

import Image from "next/image";

export function ReviewsSection() {
    return (
        <section id="reviews" className="relative bg-brand-gray text-black scroll-mt-24">
            <div className="container mx-auto px-6 py-20 md:py-24">
                <div className="text-center mb-12">
                    <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                        Join 1,000+ Users Planting Trees Just by Browsing
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
                        See what the community is saying about IdleForest on the Chrome Web Store.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
                    <div className="relative w-full">
                        <Image
                            src="/reviews/image.png"
                            alt="Chrome Web Store Review 1"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-lg shadow-lg border border-neutral-200"
                            priority={false}
                        />
                    </div>
                    <div className="relative w-full">
                        <Image
                            src="/reviews/image1.png"
                            alt="Chrome Web Store Review 2"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-lg shadow-lg border border-neutral-200"
                            priority={false}
                        />
                    </div>
                    <div className="relative w-full">
                        <Image
                            src="/reviews/image2.png"
                            alt="Chrome Web Store Review 3"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-lg shadow-lg border border-neutral-200"
                            priority={false}
                        />
                    </div>
                    <a
                        href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-black underline hover:text-brand-yellow"
                    >
                        Read all 33 reviews on Chrome Web Store
                    </a>
                </div>
            </div>
        </section>
    );
}
