import { ArrowRight } from 'lucide-react'

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
        <a
            href={href}
            className="group flex items-center justify-between gap-4 border-2 border-black bg-brand-yellow px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
            <span className="font-candu text-lg font-extrabold uppercase leading-none text-brand-navy sm:text-2xl">
                Grow a forest with {displayName}
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 border-2 border-black bg-brand-navy px-4 py-2 text-xs font-black uppercase text-white">
                Join free
                <ArrowRight className="h-4 w-4 text-brand-yellow transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
        </a>
    )
}
