// Flat spot illustrations for the Silveira Tech support page pillars.
import type { SVGProps } from "react";

const NAVY = "#0B101F";
const LIME = "#E0F146";
const GREEN = "#347D67";
const GREEN_DARK = "#1F5A3A";
const GREEN_LIGHT = "#7BB661";
const STONE = "#CFC8B8";
const STONE_DARK = "#A89F8B";
const SLATE = "#3B4256";
const AMBER = "#E8A23A";

type ArtProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: ArtProps) {
    return (
        <svg viewBox="0 0 96 96" role="presentation" aria-hidden="true" focusable="false" {...props}>
            {children}
        </svg>
    );
}

/** A schist village house on a hill: village regeneration. */
export function VillageArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#ECE4D6" />
            <path d="M6 78 C24 62 44 60 48 62 C58 60 78 62 90 78 C80 88 16 88 6 78Z" fill={GREEN_LIGHT} />
            <rect x="26" y="44" width="34" height="26" fill={STONE} />
            <g stroke={STONE_DARK} strokeWidth="1.5" strokeLinecap="round">
                <path d="M26 52 H60 M26 60 H60 M35 44 V52 M50 52 V60 M40 60 V70" />
            </g>
            <polygon points="22,45 43,26 64,45" fill={SLATE} />
            <rect x="52" y="30" width="6" height="12" fill={SLATE} />
            <rect x="37" y="56" width="10" height="14" rx="5" fill={AMBER} />
            <rect x="29" y="49" width="6" height="6" rx="1" fill="#DCECF0" />
            <path d="M66 72 V56 M66 64 l6 -6 M66 68 l-6 -5" stroke="#7A4E2D" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="66" cy="52" r="8" fill={GREEN} />
        </Frame>
    );
}

/** Native forest rising over hills: ecological restoration. */
export function ForestArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#E4F0EA" />
            <path d="M4 70 C22 52 40 56 52 60 C66 52 82 54 92 68 C80 86 16 86 4 70Z" fill={GREEN_LIGHT} />
            <g fill={GREEN_DARK}>
                <polygon points="26,26 38,50 14,50" />
                <polygon points="26,38 41,64 11,64" />
            </g>
            <g fill={GREEN}>
                <polygon points="70,30 81,52 59,52" />
                <polygon points="70,42 84,66 56,66" />
            </g>
            <rect x="46" y="52" width="5" height="16" rx="2" fill="#7A4E2D" />
            <circle cx="48.5" cy="46" r="11" fill={GREEN_LIGHT} stroke={GREEN_DARK} strokeWidth="2" />
            <ellipse cx="48" cy="76" rx="26" ry="4" fill={NAVY} opacity="0.15" />
        </Frame>
    );
}

/** A leaf grown from circuit lines: technology for good. */
export function TechArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#DCECF0" />
            <path d="M28 66 C22 40 44 20 72 22 C74 50 56 72 28 66Z" fill={GREEN} />
            <path d="M28 66 C40 54 52 42 64 30" stroke={LIME} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <g stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M42 54 H54 V64" />
                <path d="M52 42 H64 V50" />
                <path d="M34 60 V72 H22" />
            </g>
            <g fill={LIME} stroke={NAVY} strokeWidth="2">
                <circle cx="54" cy="66" r="3.5" />
                <circle cx="64" cy="52" r="3.5" />
                <circle cx="20" cy="72" r="3.5" />
            </g>
        </Frame>
    );
}
