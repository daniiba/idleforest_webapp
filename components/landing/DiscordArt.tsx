// Flat spot illustrations for the Discord bot page.
import type { SVGProps } from "react";

const NAVY = "#0B101F";
const LIME = "#E0F146";
const BLURPLE = "#5865F2";
const BLURPLE_DARK = "#4752C4";
const GREEN = "#347D67";
const GOLD = "#F2B84B";
const GOLD_DARK = "#D9962B";

type ArtProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: ArtProps) {
    return (
        <svg viewBox="0 0 96 96" role="presentation" aria-hidden="true" focusable="false" {...props}>
            {children}
        </svg>
    );
}

/** A trophy: leaderboard. */
export function TrophyArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#F6EBD6" />
            <path d="M28 24 H68 V40 C68 52 58 60 48 60 C38 60 28 52 28 40Z" fill={GOLD} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M28 30 H20 C20 42 24 46 30 47 M68 30 H76 C76 42 72 46 66 47" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 60 V70" stroke={NAVY} strokeWidth="2.5" />
            <rect x="34" y="70" width="28" height="9" rx="3" fill={GOLD_DARK} stroke={NAVY} strokeWidth="2.5" />
            <path d="M40 32 V42" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <circle cx="48" cy="38" r="6" fill={LIME} stroke={NAVY} strokeWidth="2" />
        </Frame>
    );
}

/** A tree with a lightning bolt: real-time tracking. */
export function BoltArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#E4F0EA" />
            <polygon points="48,16 66,44 30,44" fill={GREEN} />
            <polygon points="48,30 70,62 26,62" fill="#1F5A3A" />
            <rect x="44" y="62" width="8" height="12" rx="2" fill="#7A4E2D" />
            <path d="M60 14 L46 40 H56 L50 60 L72 32 H60 L66 14Z" fill={LIME} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
        </Frame>
    );
}

/** A medal on a ribbon: milestone badges. */
export function MedalArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#DCECF0" />
            <path d="M32 14 L44 44 M64 14 L52 44" stroke={BLURPLE} strokeWidth="9" strokeLinecap="butt" />
            <circle cx="48" cy="58" r="20" fill={GOLD} stroke={NAVY} strokeWidth="2.5" />
            <circle cx="48" cy="58" r="13" fill={GOLD_DARK} opacity="0.35" />
            <path d="M48 47 L51.5 54.5 L60 55.6 L54 61.4 L55.5 69.7 L48 65.8 L40.5 69.7 L42 61.4 L36 55.6 L44.5 54.5Z" fill={LIME} stroke={NAVY} strokeWidth="1.8" strokeLinejoin="round" />
        </Frame>
    );
}

/** A friendly bot face: add the bot. */
export function BotArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill={LIME} />
            <path d="M48 18 V26" stroke={NAVY} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="48" cy="15" r="4.5" fill={BLURPLE} stroke={NAVY} strokeWidth="2" />
            <rect x="22" y="26" width="52" height="42" rx="14" fill={BLURPLE} stroke={NAVY} strokeWidth="2.5" />
            <rect x="29" y="34" width="38" height="26" rx="9" fill={BLURPLE_DARK} />
            <circle cx="40" cy="47" r="5" fill="#fff" />
            <circle cx="56" cy="47" r="5" fill="#fff" />
            <circle cx="41" cy="48" r="2.4" fill={NAVY} />
            <circle cx="57" cy="48" r="2.4" fill={NAVY} />
            <path d="M43 56 C46 59 50 59 53 56" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <rect x="14" y="40" width="8" height="14" rx="4" fill={NAVY} />
            <rect x="74" y="40" width="8" height="14" rx="4" fill={NAVY} />
            <rect x="34" y="70" width="28" height="8" rx="4" fill={NAVY} />
        </Frame>
    );
}
