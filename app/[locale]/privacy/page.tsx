import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | IdleForest",
    description: "IdleForest privacy policy for the website, browser extension, and desktop apps.",
    alternates: {
        canonical: "https://www.idleforest.com/privacy",
    },
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-brand-gray px-6 py-20 text-black">
            <article className="mx-auto max-w-4xl">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-neutral-600">Privacy</p>
                <h1 className="mt-4 font-candu text-5xl uppercase leading-none md:text-7xl">
                    Privacy Policy
                </h1>
                <p className="mt-6 text-lg text-neutral-700">
                    Last updated: May 29, 2026. This policy explains how IdleForest handles data across our website, browser extension, and desktop apps.
                </p>

                <div className="mt-12 space-y-10 text-neutral-800">
                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">What the extension and apps do not collect</h2>
                        <p className="mt-3">
                            IdleForest does not collect your browsing history, tab contents, bookmarks, search history, cookies, login credentials, personal files, or payment information. Traffic used for idle bandwidth tasks is sessionless and does not include personal identifiers from your browsing session.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Extension and desktop app data</h2>
                        <p className="mt-3">
                            We process limited operational data needed to run the service, measure impact, prevent abuse, and calculate trees funded. This may include installation status, app version, platform type, anonymous usage counters, bandwidth-task totals, timestamps, and error diagnostics.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Website analytics and cookies</h2>
                        <p className="mt-3">
                            The IdleForest website uses analytics, attribution, and session cookies to understand visits, improve onboarding, detect referrals, and keep users signed in. These tools may process device, browser, page-view, referrer, and approximate location data.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">How idle bandwidth is used</h2>
                        <p className="mt-3">
                            Idle bandwidth tasks are limited to public, sessionless backend tasks such as uptime checks, market research, and passive public-site data collection. IdleForest does not route private account activity, ad fraud, crypto mining, credential collection, or malicious activity through your device.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Legal basis under GDPR</h2>
                        <p className="mt-3">
                            Where GDPR applies, we process data based on contract performance for account and app functionality, legitimate interests for security, analytics, abuse prevention, and impact reporting, consent where required for optional marketing or cookies, and legal obligation where records must be retained.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Data sharing</h2>
                        <p className="mt-3">
                            We share data only with service providers that help us operate IdleForest, such as hosting, database, authentication, analytics, email, and payment or attribution tools. We do not sell personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Retention</h2>
                        <p className="mt-3">
                            Account data is retained while your account exists. Operational logs, analytics, and security records are kept only as long as needed for reliability, fraud prevention, reporting, and legal compliance, then deleted or aggregated.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Your rights</h2>
                        <p className="mt-3">
                            Depending on where you live, you may request access, correction, deletion, portability, restriction, or objection to processing. You may also withdraw consent where processing relies on consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black">Contact and DPO</h2>
                        <p className="mt-3">
                            For privacy requests or Data Protection Officer inquiries, contact us at{" "}
                            <a className="font-bold underline" href="mailto:hello@idleforest.com">
                                hello@idleforest.com
                            </a>
                            . You may also contact your local data protection authority if you believe your rights have not been respected.
                        </p>
                    </section>
                </div>
            </article>
        </main>
    );
}
