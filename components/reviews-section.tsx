"use client";

import Image from "next/image";

const reviews = [
    {
        quote: "works great and I like to support planting trees",
        name: "Charles P.",
        date: "12.08.2025",
    },
    {
        quote: "Great concept, a brilliant and great idea for reforestation!",
        name: "Joao V.",
        date: "27.09.2025",
    },
    {
        quote: "Great way to contribute to the environment without any extra efforts!",
        name: "Kroes",
        date: "05.02.2025",
    },
];

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
                    <div className="grid w-full gap-4 md:grid-cols-3">
                        {reviews.map((review) => (
                            <article key={`${review.name}-${review.date}`} className="flex h-full flex-col border-2 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-black" aria-label="5 star review">5/5 stars</div>
                                <p className="mt-4 flex-1 text-base leading-7 text-neutral-800">
                                    "{review.quote}"
                                </p>
                                <div className="mt-5 border-t border-black/10 pt-3 text-sm font-bold text-neutral-700">
                                    {review.name} - {review.date}
                                </div>
                            </article>
                        ))}
                    </div>
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
