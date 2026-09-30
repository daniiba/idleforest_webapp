// Small flat illustrations for the download pages.
import type { SVGProps } from "react";

const NAVY = "#0B101F";
const LIME = "#E0F146";
const GREEN = "#347D67";
const BOX = "#D8B98A";
const BOX_DARK = "#B8935F";

type ArtProps = SVGProps<SVGSVGElement>;

function Frame({ children, ...props }: ArtProps) {
    return (
        <svg viewBox="0 0 96 96" role="presentation" aria-hidden="true" focusable="false" {...props}>
            {children}
        </svg>
    );
}

/** A package with a download arrow: get the installer. */
export function PackageArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill={LIME} />
            <path d="M22 38 L48 26 L74 38 V66 L48 78 L22 66Z" fill={BOX} stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M22 38 L48 50 L74 38 M48 50 V78" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M22 38 L48 50 V78 L22 66Z" fill={BOX_DARK} opacity="0.55" />
            <path d="M48 8 V24 M41 17 l7 7 l7 -7" fill="none" stroke={NAVY} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
    );
}

/** A window with a progress bar: run the installer. */
export function InstallerArt(props: ArtProps) {
    return (
        <Frame {...props}>
            <circle cx="48" cy="48" r="46" fill={LIME} />
            <rect x="16" y="22" width="64" height="52" rx="8" fill="#fff" stroke={NAVY} strokeWidth="2.5" />
            <path d="M16 34 H80" stroke={NAVY} strokeWidth="2.5" />
            <g fill={NAVY}>
                <circle cx="24" cy="28" r="2" />
                <circle cx="31" cy="28" r="2" />
                <circle cx="38" cy="28" r="2" />
            </g>
            <rect x="26" y="50" width="44" height="8" rx="4" fill="#E2E4E0" />
            <rect x="26" y="50" width="30" height="8" rx="4" fill={GREEN} />
            <path d="M26 42 h24" stroke="#C9CDD2" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="68" r="11" fill={NAVY} />
            <path d="M65 68 l4 4 l7 -9" fill="none" stroke={LIME} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
    );
}
