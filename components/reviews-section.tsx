"use client";

import Image from "next/image";

export function ReviewsSection() {
    return (
        <section id="reviews" className="relative bg-[#F7F7F2] text-brand-navy scroll-mt-24">
            <div className="container mx-auto px-6 py-20 md:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        Join 1,000+ Users Funding Trees with IdleForest
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                        See what the community is saying about IdleForest on the Chrome Web Store.
                    </p>
                </div>

                <div className="grid gap-6 max-w-6xl mx-auto md:grid-cols-3 md:items-start">
                    <div className="relative w-full">
                        <Image
                            src="/reviews/image.png"
                            alt="Chrome Web Store Review 1"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-2xl shadow-sm border border-neutral-200"
                            priority={false}
                        />
                    </div>
                    <div className="relative w-full">
                        <Image
                            src="/reviews/image1.png"
                            alt="Chrome Web Store Review 2"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-2xl shadow-sm border border-neutral-200"
                            priority={false}
                        />
                    </div>
                    <div className="relative w-full">
                        <Image
                            src="/reviews/image2.png"
                            alt="Chrome Web Store Review 3"
                            width={1200}
                            height={800}
                            className="w-full h-auto rounded-2xl shadow-sm border border-neutral-200"
                            priority={false}
                        />
                    </div>
                    <a
                        href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-brand-navy underline underline-offset-4 hover:text-black md:col-span-3 md:justify-self-center"
                    >
                        Read all 33 reviews on Chrome Web Store
                    </a>
                </div>
            </div>
        </section>
    );
}
