// Flat brand illustration: spare bandwidth (laptop) -> paid public-data tasks
// (browser) -> funded trees (sapling). Inline SVG so it stays crisp, themes
// with the brand palette and adds no image request.
const NAVY = "#0B101F";
const LIME = "#E0F146";
const GREEN_DARK = "#1F5A3A";
const GREEN = "#2F7D4F";
const GREEN_LIGHT = "#7BB661";
const LINE = "#E2E4E0";

const PATH_ONE = "M302 236 L 392 236";
const PATH_TWO = "M742 236 L 860 236";

export default function IdleBandwidthArt({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 1200 340"
            role="presentation"
            aria-hidden="true"
            focusable="false"
            className={className}
        >
            <style>{`@media (prefers-reduced-motion: reduce){.ib-flow{display:none}}`}</style>

            {/* connecting lines */}
            <g fill="none" strokeLinecap="round">
                <path d={PATH_ONE} stroke={GREEN} strokeWidth="5" />
                <path d={PATH_TWO} stroke={GREEN} strokeWidth="5" />
            </g>
            <circle cx="302" cy="236" r="9" fill="#fff" stroke={GREEN} strokeWidth="5" />
            <circle cx="860" cy="236" r="9" fill="#fff" stroke={GREEN} strokeWidth="5" />

            {[PATH_ONE, PATH_TWO].map((d, pathIndex) =>
                [0, 1].map((dotIndex) => (
                    <circle key={`${pathIndex}-${dotIndex}`} className="ib-flow" r="6" fill={LIME} stroke={NAVY} strokeWidth="1.5">
                        <animateMotion dur="2.6s" begin={`${dotIndex * 1.3}s`} repeatCount="indefinite" path={d} />
                    </circle>
                ))
            )}

            {/* 1 · laptop with spare bandwidth (bottom sits on the shared baseline, y=290) */}
            <g transform="translate(170 290) scale(1.15) translate(-170 -290) translate(0 34)">
                <ellipse cx="170" cy="262" rx="120" ry="10" fill={NAVY} opacity="0.08" />
                <rect x="80" y="118" width="180" height="122" rx="14" fill={NAVY} />
                <rect x="90" y="128" width="160" height="102" rx="8" fill="#182036" />
                <g stroke={LIME} strokeWidth="8" strokeLinecap="round">
                    <line x1="170" y1="160" x2="170" y2="198" />
                    <line x1="153" y1="170" x2="187" y2="188" />
                    <line x1="153" y1="188" x2="187" y2="170" />
                </g>
                <rect x="58" y="240" width="224" height="16" rx="8" fill="#C9CDD2" />
                <rect x="140" y="240" width="60" height="6" rx="3" fill="#AEB3BA" />

                {/* wifi */}
                <g fill="none" strokeLinecap="round" strokeWidth="7">
                    <path d="M158.7 92.7 A16 16 0 0 1 181.3 92.7" stroke={LIME} />
                    <path d="M147.4 81.4 A32 32 0 0 1 192.6 81.4" stroke={GREEN_LIGHT} />
                    <path d="M136.1 70.1 A48 48 0 0 1 203.9 70.1" stroke={GREEN} />
                </g>
                <circle cx="170" cy="104" r="6" fill={LIME} stroke={NAVY} strokeWidth="2" />
            </g>

            {/* 2 · browser tasks for paying clients */}
            <g transform="translate(20 0)">
                <rect x="440" y="58" width="270" height="60" rx="16" fill="#DADDD7" />
                <rect x="372" y="84" width="290" height="176" rx="16" fill="#fff" stroke={LINE} strokeWidth="2" />
                <path d="M372 100 a16 16 0 0 1 16 -16 h258 a16 16 0 0 1 16 16 v14 h-290z" fill={NAVY} />
                <circle cx="394" cy="99" r="5" fill="#fff" />
                <circle cx="412" cy="99" r="5" fill="#fff" />
                <circle cx="430" cy="99" r="5" fill="#8B93A1" />

                <g fill="none" stroke={NAVY} strokeWidth="4">
                    <circle cx="428" cy="176" r="30" />
                    <ellipse cx="428" cy="176" rx="12" ry="30" />
                    <line x1="398" y1="176" x2="458" y2="176" />
                </g>
                <g fill={GREEN}>
                    <circle cx="492" cy="150" r="6" />
                    <circle cx="492" cy="176" r="6" />
                    <circle cx="492" cy="202" r="6" />
                </g>
                <g fill="#D3D6DC">
                    <rect x="510" y="145" width="118" height="10" rx="5" />
                    <rect x="510" y="171" width="118" height="10" rx="5" />
                    <rect x="510" y="197" width="80" height="10" rx="5" />
                </g>

                {/* paid / verified card */}
                <rect x="516" y="214" width="206" height="76" rx="16" fill="#fff" stroke={LINE} strokeWidth="2" />
                <circle cx="556" cy="252" r="20" fill={LIME} />
                <path d="M546 252 l7 8 l14 -17" fill="none" stroke={NAVY} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="588" y="238" width="112" height="10" rx="5" fill="#D3D6DC" />
                <rect x="588" y="258" width="70" height="10" rx="5" fill="#D3D6DC" />
            </g>

            {/* 3 · funded trees: one half is drawn once and mirrored around x=1010 */}
            <g transform="translate(0 -20)">
                <defs>
                    <g id="ib-tree-half">
                        <polygon points="900,176 926,222 874,222" fill={GREEN_DARK} />
                        <polygon points="900,200 932,256 868,256" fill={GREEN_DARK} />
                        <polygon points="952,214 970,246 934,246" fill={GREEN_LIGHT} />
                        <path d="M1010 214 C 1010 164 948 140 916 150 C 920 198 962 224 1010 214Z" fill={GREEN} />
                        <path d="M950 274 C 946 258, 956 248, 966 246 C 968 260, 962 270, 950 274Z" fill={GREEN_LIGHT} />
                    </g>
                </defs>

                <circle cx="1010" cy="170" r="104" fill="#E9EEE6" />

                {/* ground */}
                <ellipse cx="1010" cy="284" rx="170" ry="26" fill={NAVY} />
                <path d="M900 270 C 940 236, 1080 236, 1120 270 C 1080 282, 940 282, 900 270Z" fill="#8FBF7A" opacity="0.55" />

                {/* trunk */}
                <path d="M1010 278 L1010 160" fill="none" stroke="#7A4E2D" strokeWidth="9" strokeLinecap="round" />

                <use href="#ib-tree-half" />
                <use href="#ib-tree-half" transform="translate(2020 0) scale(-1 1)" />

                {/* top leaf */}
                <path d="M1010 170 C 992 132 996 100 1010 84 C 1024 100 1028 132 1010 170Z" fill={GREEN_LIGHT} />
            </g>
        </svg>
    );
}
