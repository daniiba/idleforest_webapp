// Small flat spot illustrations for the Mossy Earth support page.
// Same palette and style as IdleBandwidthArt so the page feels drawn, not iconed.
import type { SVGProps } from "react";

const NAVY = "#0B101F";
const LIME = "#E0F146";
const GREEN = "#347D67";
const GREEN_DARK = "#1F5A3A";
const GREEN_LIGHT = "#7BB661";
const PAPER = "#F7F7F2";
const BARK = "#7A4E2D";
const AMBER = "#E8A23A";
const CORAL = "#E2725B";

type ArtProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: ArtProps) {
    return (
        <svg viewBox="0 0 96 96" role="presentation" aria-hidden="true" focusable="false" {...props}>
            {children}
        </svg>
    );
}

/** A bird on a branch: bringing back lost species. */
export function SpeciesArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#E4F0EA" />
            <path d="M14 72 H84" stroke={BARK} strokeWidth="5" strokeLinecap="round" />
            <path d="M70 72 c8 -2 12 -8 12 -14" stroke={BARK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M80 60 c-2 -6 4 -10 8 -6 c-1 5 -4 8 -8 6Z" fill={GREEN_LIGHT} />
            <polygon points="30,52 12,44 15,60" fill={GREEN_DARK} />
            <ellipse cx="46" cy="53" rx="19" ry="15" fill={GREEN} />
            <ellipse cx="53" cy="59" rx="11" ry="7.5" fill={PAPER} />
            <circle cx="63" cy="40" r="10" fill={GREEN} />
            <polygon points="71,38 82,42 71,46" fill={AMBER} />
            <circle cx="65" cy="38" r="2" fill={NAVY} />
            <ellipse cx="41" cy="52" rx="11" ry="7" fill={GREEN_DARK} transform="rotate(-12 41 52)" />
            <path d="M44 68 V72 M52 68 V72" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round" />
        </Frame>
    );
}

/** A weed with a stop ring: controlling invasive species. */
export function InvasiveArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#F6EBD6" />
            <g fill={GREEN_DARK}>
                <path d="M48 70 C42 54 34 46 26 44 C30 56 38 64 48 70Z" />
                <path d="M48 70 C54 54 62 46 70 44 C66 56 58 64 48 70Z" />
                <path d="M48 70 C44 50 46 36 48 26 C52 36 54 50 48 70Z" fill={GREEN} />
            </g>
            <path d="M32 72 H64" stroke={BARK} strokeWidth="5" strokeLinecap="round" />
            <circle cx="48" cy="48" r="30" fill="none" stroke={CORAL} strokeWidth="6" />
            <path d="M27 69 L69 27" stroke={CORAL} strokeWidth="6" strokeLinecap="round" />
        </Frame>
    );
}

/** A seedling in dry, cracked ground: restoring degraded habitats. */
export function HabitatArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#E4F0EA" />
            <ellipse cx="48" cy="72" rx="34" ry="9" fill={NAVY} />
            <path d="M22 72 l6 -3 l4 3 M64 72 l5 -3 l6 3" stroke="#3B4256" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M48 70 V40" stroke={BARK} strokeWidth="5" strokeLinecap="round" />
            <path d="M48 52 C48 40 62 34 72 37 C71 48 60 56 48 52Z" fill={GREEN} />
            <path d="M48 58 C40 48 30 47 24 50 C27 60 38 64 48 58Z" fill={GREEN_DARK} />
            <path d="M48 40 C43 32 46 24 51 20 C56 26 54 34 48 40Z" fill={GREEN_LIGHT} />
            <g fill={LIME} stroke={NAVY} strokeWidth="1.5">
                <circle cx="24" cy="30" r="3" />
                <circle cx="74" cy="22" r="2.5" />
            </g>
        </Frame>
    );
}

/** A globe: ecosystems that funding overlooks. */
export function EcosystemArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill="#DCECF0" />
            <circle cx="48" cy="48" r="28" fill="#6FB3CF" />
            <path d="M30 40 C34 30 46 28 50 34 C54 40 48 44 44 46 C40 50 32 52 30 40Z" fill={GREEN} />
            <path d="M56 54 C62 50 72 52 72 58 C70 68 60 72 56 66 C54 62 54 58 56 54Z" fill={GREEN_LIGHT} />
            <path d="M34 62 C38 60 42 64 40 68 C36 70 32 66 34 62Z" fill={GREEN_DARK} />
            <path d="M32 34 A22 22 0 0 1 48 26" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
            <ellipse cx="48" cy="80" rx="20" ry="4" fill={NAVY} opacity="0.12" />
        </Frame>
    );
}

/** A profile card with a check: join. */
export function JoinArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill={LIME} />
            <rect x="20" y="28" width="56" height="40" rx="9" fill="#fff" />
            <circle cx="37" cy="45" r="7" fill={NAVY} />
            <path d="M26 62 c2 -8 18 -8 22 0" fill={NAVY} />
            <rect x="52" y="40" width="18" height="5" rx="2.5" fill="#D3D6DC" />
            <rect x="52" y="50" width="12" height="5" rx="2.5" fill="#D3D6DC" />
            <circle cx="72" cy="62" r="11" fill={GREEN} stroke="#fff" strokeWidth="3" />
            <path d="M67 62 l4 4 l6 -8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
    );
}

/** A laptop receiving the app: install. */
export function InstallArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill={LIME} />
            <rect x="22" y="26" width="52" height="36" rx="6" fill={NAVY} />
            <rect x="27" y="31" width="42" height="26" rx="3" fill="#182036" />
            <path d="M48 34 V49 M41 43 l7 7 l7 -7" fill="none" stroke={LIME} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="16" y="62" width="64" height="8" rx="4" fill="#C9CDD2" />
            <rect x="40" y="62" width="16" height="3.5" rx="1.75" fill="#AEB3BA" />
        </Frame>
    );
}

/** A moon over a growing sprout: let it run while you rest. */
export function RunArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill={LIME} />
            <path d="M58 20 a19 19 0 1 0 14 30 a15 15 0 0 1 -14 -30Z" fill={NAVY} />
            <g fill="#fff" stroke={NAVY} strokeWidth="1.5">
                <circle cx="30" cy="26" r="2.5" />
                <circle cx="74" cy="34" r="2" />
            </g>
            <ellipse cx="48" cy="76" rx="24" ry="5" fill={NAVY} />
            <path d="M48 74 V62" stroke={BARK} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M48 66 C48 58 56 55 62 57 C61 63 55 68 48 66Z" fill={GREEN} />
            <path d="M48 68 C43 62 37 62 33 64 C35 70 42 72 48 68Z" fill={GREEN_DARK} />
        </Frame>
    );
}
