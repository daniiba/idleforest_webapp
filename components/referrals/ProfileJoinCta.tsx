import { ArrowRight, TreePine } from 'lucide-react'

type ProfileJoinCtaProps = {
    displayName: string
    invitePath: string | null | undefined
}

// Public profiles get shared in chats and on social media. Visitors who are
// not members yet can join through the profile owner, which turns every
// profile view into a potential referral.
export default function ProfileJoinCta({ displayName, invitePath }: ProfileJoinCtaProps) {
    const href = invitePath || '/auth/user/signup'

    return (
        <section
            className="flex flex-col gap-4 border-2 border-black bg-brand-yellow p-6 sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="profile-join-heading"
        >
            <div className="flex items-center gap-4">
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center border-2 border-black bg-white sm:flex" aria-hidden="true">
                    <TreePine className="h-6 w-6" />
                </span>
                <div>
                    <h2 id="profile-join-heading" className="font-candu text-2xl font-extrabold uppercase leading-none text-brand-navy">
                        Grow a forest with {displayName}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-neutral-800">
                        IdleForest turns bandwidth your computer isn&apos;t using into real trees. Free, and set up in two minutes.
                    </p>
                </div>
            </div>
            <a
                href={href}
                className="inline-flex shrink-0 items-center justify-center gap-2 border-2 border-black bg-brand-navy px-5 py-3 text-sm font-black uppercase text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
                Join {displayName}
                <ArrowRight className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
            </a>
        </section>
    )
}
