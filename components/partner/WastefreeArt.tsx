// Flat spot illustrations for the Waste Free Planet support page.
import type { SVGProps } from "react";

const NAVY = "#0B101F";
const LIME = "#E0F146";
const GREEN = "#347D67";
const WATER = "#6FB3CF";
const WATER_DARK = "#3F8DB0";
const GLASS = "#BFE3F0";
const SKIN_1 = "#E8B58F";
const SKIN_2 = "#B9784F";
const SKIN_3 = "#8A5A3B";

type ArtProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: ArtProps) {
    return (
        <svg viewBox="0 0 96 96" role="presentation" aria-hidden="true" focusable="false" {...props}>
            {children}
        </svg>
    );
}

/** Three people together: a community that cares. */
export function CommunityArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#DCECF0" />
            <path d="M14 78 C14 64 24 58 32 58 C40 58 48 64 48 78Z" fill={GREEN} />
            <path d="M48 78 C48 64 56 58 64 58 C72 58 82 64 82 78Z" fill={WATER_DARK} />
            <circle cx="30" cy="46" r="8" fill={SKIN_2} />
            <circle cx="66" cy="46" r="8" fill={SKIN_3} />
            <path d="M28 82 C28 62 38 54 48 54 C58 54 68 62 68 82Z" fill={LIME} />
            <circle cx="48" cy="40" r="10" fill={SKIN_1} />
            <path d="M39 38 C40 30 56 30 57 38 C52 34 44 34 39 38Z" fill={NAVY} />
        </Frame>
    );
}

/** A laptop dropping a coin into the water: the funding mechanism. */
export function FundingArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#E4F0EA" />
            <circle cx="60" cy="24" r="11" fill={LIME} stroke={NAVY} strokeWidth="2.5" />
            <path d="M56 24 h8 M60 20 v8" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M60 37 V44" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 5" />
            <rect x="22" y="44" width="46" height="28" rx="5" fill={NAVY} />
            <rect x="26" y="48" width="38" height="20" rx="3" fill="#182036" />
            <path d="M35 58 h20" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
            <rect x="16" y="72" width="58" height="7" rx="3.5" fill="#C9CDD2" />
            <path d="M6 84 C18 78 28 90 40 84 C52 78 62 90 74 84 C82 80 88 82 90 84 V90 H6Z" fill={WATER} />
        </Frame>
    );
}

/** A bottle pulled from the sea: cleanup. */
export function CleanupArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#DCECF0" />
            <g transform="rotate(-18 48 46)">
                <rect x="43" y="14" width="10" height="7" rx="2" fill={NAVY} />
                <path d="M44 21 h8 v8 c6 3 10 8 10 16 v28 a5 5 0 0 1 -5 5 H39 a5 5 0 0 1 -5 -5 V45 c0 -8 4 -13 10 -16Z" fill={GLASS} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M40 48 v22" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            </g>
            <path d="M4 78 C16 70 26 84 38 78 C50 72 60 84 72 78 C80 74 88 76 92 78 V92 H4Z" fill={WATER} />
            <path d="M4 86 C16 80 26 92 38 86 C50 80 60 92 72 86 C80 82 88 84 92 86 V92 H4Z" fill={WATER_DARK} />
            <circle cx="74" cy="34" r="12" fill={LIME} stroke={NAVY} strokeWidth="2.5" />
            <path d="M68 34 l5 5 l9 -11" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
    );
}
