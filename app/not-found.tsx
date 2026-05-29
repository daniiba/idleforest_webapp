import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    alternates: undefined,
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <main className="min-h-screen bg-brand-gray px-6 py-24 text-black">
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-neutral-600">404</p>
                <h1 className="mt-4 font-candu text-5xl uppercase leading-none md:text-7xl">
                    Page not found
                </h1>
                <p className="mt-6 text-lg text-neutral-700">
                    The page you were looking for does not exist.
                </p>
                <Link
                    href="/"
                    className="mt-8 inline-flex rounded-full bg-brand-yellow px-6 py-3 font-bold text-black hover:bg-black hover:text-brand-yellow"
                >
                    Back to IdleForest
                </Link>
            </div>
        </main>
    );
}
