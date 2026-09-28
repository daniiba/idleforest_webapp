// Isometric "forest island" visualisation of a member's impact.
//
// The main island is the member's own forest, built from stacked contour
// terraces. Every mark on it is a tree: green for trees they planted, yellow
// (with a pulsing ring) for trees earned through invites. Each person they
// invited gets a satellite island, sized by that person's trees and linked
// to the main island by an animated root.
//
// Dependency-free and deterministic (seeded by member id), so the same code
// renders the web page, the desktop app and server-side share images, and a
// member's trees stay where they were as the forest grows.

export type ForestFriend = {
    label?: string | null
    trees: number
    contributing?: boolean
}

export type ForestSceneInput = {
    ownTrees: number
    inviteTrees: number
    friends: ForestFriend[]
    seed: string
}

type TreeKind = 'own' | 'invite' | 'friend'

type TreeMark = {
    x: number
    y: number
    kind: TreeKind
    size: number
    delay: number
}

type Layer = {
    points: string
    shadowPoints: string
    fill: string
    stroke: string
}

type Island = {
    kind: 'main' | 'friend'
    depth: number
    layers: Layer[]
    trees: TreeMark[]
    title: string
    label: { text: string; x: number; y: number } | null
    sprout: { x: number; y: number } | null
}

export type ForestScene = {
    viewBox: { x: number; y: number; width: number; height: number }
    islands: Island[]
    links: string[]
    glow: { cx: number; cy: number; rx: number; ry: number }
    treesPerMark: number
    hiddenFriends: number
}

const TILT = 0.56
const MAIN_RADIUS = 120
const MAIN_LEVELS = 7
const MAIN_LEVEL_HEIGHT = 9
const MAX_MAIN_MARKS = 180
const MAX_FRIEND_MARKS = 26
const MAX_FRIEND_ISLANDS = 12

export const FOREST_COLORS = {
    own: '#7BE0A0',
    ownShade: '#3FA56B',
    invite: '#E0F146',
    inviteShade: '#A9B82A',
    friend: '#A7E8C0',
    friendShade: '#5CA67C',
    contour: '#E0F146',
    link: '#E0F146',
    label: '#F4F7DC',
}

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

function hashString(value: string) {
    let hash = 2166136261
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
    }
    return hash >>> 0
}

function rng(seed: string) {
    let state = hashString(seed) || 1
    return () => {
        state = (state + 0x6D2B79F5) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

type Wave = { k: number; amplitude: number; phase: number }

function makeWaves(random: () => number, strength: number): Wave[] {
    return [2, 3, 4, 5, 7].map(k => ({
        k,
        amplitude: (strength * (0.4 + random() * 0.6)) / Math.sqrt(k),
        phase: random() * Math.PI * 2,
    }))
}

function waveAt(waves: Wave[], theta: number) {
    return waves.reduce((sum, wave) => sum + wave.amplitude * Math.sin(wave.k * theta + wave.phase), 0)
}

function project(x: number, y: number, z: number) {
    return { x, y: y * TILT - z }
}

function lerpColor(from: string, to: string, t: number) {
    const a = parseInt(from.slice(1), 16)
    const b = parseInt(to.slice(1), 16)
    const channel = (shift: number) => Math.round(((a >> shift) & 255) + (((b >> shift) & 255) - ((a >> shift) & 255)) * t)
    return `#${((1 << 24) | (channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).slice(1)}`
}

type Terrace = {
    cx: number
    cy: number
    z: number
    radius: number
    waves: Wave[]
    sharedWaves: Wave[]
}

function terraceRadius(terrace: Terrace, theta: number) {
    return terrace.radius * (1 + waveAt(terrace.sharedWaves, theta) + waveAt(terrace.waves, theta))
}

function buildTerraces(options: {
    random: () => number
    cx: number
    cy: number
    radius: number
    levels: number
    levelHeight: number
    topScale: number
    roughness: number
}): Terrace[] {
    const { random, cx, cy, radius, levels, levelHeight, topScale, roughness } = options
    const sharedWaves = makeWaves(random, roughness)
    const driftAngle = random() * Math.PI * 2
    const terraces: Terrace[] = []
    let centerX = cx
    let centerY = cy

    for (let level = 0; level < levels; level += 1) {
        const t = levels === 1 ? 0 : level / (levels - 1)
        const scale = 1 - t * (1 - topScale)
        if (level > 0) {
            // Drift each terrace a little so the peak sits off-centre, like real terrain.
            const angle = driftAngle + (random() - 0.5) * 1.4
            const step = radius * (0.02 + random() * 0.035)
            centerX += Math.cos(angle) * step
            centerY += Math.sin(angle) * step
        }
        terraces.push({
            cx: centerX,
            cy: centerY,
            z: level * levelHeight,
            radius: radius * scale,
            waves: makeWaves(random, roughness * 0.45),
            sharedWaves,
        })
    }

    return terraces
}

function terraceLayers(terraces: Terrace[], thickness: number, palette: { bottom: string; top: string }, contourOpacity: number): Layer[] {
    const samples = 72
    return terraces.map((terrace, level) => {
        const top: string[] = []
        const shadow: string[] = []
        for (let index = 0; index < samples; index += 1) {
            const theta = (index / samples) * Math.PI * 2
            const r = terraceRadius(terrace, theta)
            const point = project(terrace.cx + Math.cos(theta) * r, terrace.cy + Math.sin(theta) * r, terrace.z)
            top.push(`${point.x.toFixed(1)},${point.y.toFixed(1)}`)
            shadow.push(`${point.x.toFixed(1)},${(point.y + thickness).toFixed(1)}`)
        }
        const t = terraces.length === 1 ? 1 : level / (terraces.length - 1)
        return {
            points: top.join(' '),
            shadowPoints: shadow.join(' '),
            fill: lerpColor(palette.bottom, palette.top, t),
            stroke: `rgba(224,241,70,${(contourOpacity * (0.55 + 0.45 * t)).toFixed(2)})`,
        }
    })
}

function topTerraceAt(terraces: Terrace[], x: number, y: number) {
    for (let level = terraces.length - 1; level >= 0; level -= 1) {
        const terrace = terraces[level]
        const dx = x - terrace.cx
        const dy = y - terrace.cy
        const theta = Math.atan2(dy, dx)
        if (Math.hypot(dx, dy) <= terraceRadius(terrace, theta) * 0.9) return terrace
    }
    return null
}

function placeTrees(options: {
    terraces: Terrace[]
    count: number
    kind: TreeKind
    size: number
    seed: string
    spread: number
}): TreeMark[] {
    const { terraces, count, kind, size, seed, spread } = options
    const random = rng(seed)
    const base = terraces[0]
    const marks: TreeMark[] = []
    let attempts = 0

    while (marks.length < count && attempts < count * 20) {
        attempts += 1
        const theta = random() * Math.PI * 2
        const rho = Math.sqrt(random()) * spread
        const x = base.cx + Math.cos(theta) * terraceRadius(base, theta) * rho
        const y = base.cy + Math.sin(theta) * terraceRadius(base, theta) * rho
        const terrace = topTerraceAt(terraces, x, y)
        if (!terrace) continue
        const point = project(x, y, terrace.z)
        marks.push({ x: point.x, y: point.y, kind, size, delay: 0 })
    }

    return marks
}

function islandDepth(terraces: Terrace[]) {
    return project(terraces[0].cx, terraces[0].cy, 0).y
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

/** What the legend needs to explain: how many trees one mark stands for, and friends not drawn. */
export function forestSceneSummary(input: Pick<ForestSceneInput, 'ownTrees' | 'inviteTrees' | 'friends'>) {
    const trees = Math.max(0, Math.floor(input.ownTrees || 0)) + Math.max(0, Math.floor(input.inviteTrees || 0))
    return {
        treesPerMark: Math.max(1, Math.ceil(trees / MAX_MAIN_MARKS)),
        hiddenFriends: Math.max(0, input.friends.length - MAX_FRIEND_ISLANDS),
    }
}

export function buildForestScene(input: ForestSceneInput): ForestScene {
    const ownTrees = Math.max(0, Math.floor(input.ownTrees || 0))
    const inviteTrees = Math.max(0, Math.floor(input.inviteTrees || 0))
    const random = rng(`${input.seed}:terrain`)

    // One mark can stand for several trees so large forests stay readable.
    const treesPerMark = Math.max(1, Math.ceil((ownTrees + inviteTrees) / MAX_MAIN_MARKS))
    const ownMarks = ownTrees > 0 ? Math.max(1, Math.round(ownTrees / treesPerMark)) : 0
    const inviteMarks = inviteTrees > 0 ? Math.max(1, Math.round(inviteTrees / treesPerMark)) : 0

    const mainTerraces = buildTerraces({
        random,
        cx: 0,
        cy: 0,
        radius: MAIN_RADIUS,
        levels: MAIN_LEVELS,
        levelHeight: MAIN_LEVEL_HEIGHT,
        topScale: 0.3,
        roughness: 0.16,
    })

    const mainTrees = [
        ...placeTrees({ terraces: mainTerraces, count: ownMarks, kind: 'own', size: 6.5, seed: `${input.seed}:own`, spread: 0.93 }),
        ...placeTrees({ terraces: mainTerraces, count: inviteMarks, kind: 'invite', size: 7.5, seed: `${input.seed}:invite`, spread: 0.93 }),
    ]

    const islands: Island[] = [{
        kind: 'main',
        depth: islandDepth(mainTerraces),
        layers: terraceLayers(mainTerraces, 6, { bottom: '#131c33', top: '#4b5b80' }, 0.9),
        trees: mainTrees,
        title: 'Your forest',
        label: null,
        sprout: ownMarks + inviteMarks === 0 ? project(mainTerraces[mainTerraces.length - 1].cx, mainTerraces[mainTerraces.length - 1].cy, mainTerraces[mainTerraces.length - 1].z) : null,
    }]

    const friends = [...input.friends]
        .map(friend => ({ ...friend, trees: Math.max(0, Math.floor(friend.trees || 0)) }))
        .sort((a, b) => b.trees - a.trees)
    const shownFriends = friends.slice(0, MAX_FRIEND_ISLANDS)
    const links: string[] = []
    const angleOffset = random() * Math.PI * 2

    shownFriends.forEach((friend, index) => {
        const friendRandom = rng(`${input.seed}:friend:${index}`)
        const angle = angleOffset + (index / shownFriends.length) * Math.PI * 2 + (friendRandom() - 0.5) * 0.35
        const radius = friend.trees > 0 ? Math.min(44, 16 + Math.sqrt(friend.trees) * 2.4) : 11
        // Measure from the main island's actual shore in this direction, and
        // stagger alternate islands outwards so neighbours and labels don't collide.
        const shore = terraceRadius(mainTerraces[0], angle)
        const stagger = shownFriends.length > 6 && index % 2 === 1 ? 46 : 0
        const distance = shore + radius + 34 + stagger + friendRandom() * 16
        const cx = Math.cos(angle) * distance
        const cy = Math.sin(angle) * distance
        const levels = friend.trees > 0 ? 2 + Math.min(3, Math.floor(Math.log10(friend.trees + 1) * 1.6)) : 1

        const terraces = buildTerraces({
            random: friendRandom,
            cx,
            cy,
            radius,
            levels,
            levelHeight: 5,
            topScale: 0.45,
            roughness: 0.14,
        })

        const marks = friend.trees > 0
            ? Math.min(MAX_FRIEND_MARKS, Math.max(1, Math.round(friend.trees / treesPerMark)))
            : 0
        const topTerrace = terraces[terraces.length - 1]
        const topPoint = project(topTerrace.cx, topTerrace.cy, topTerrace.z)
        const labelText = friend.label ? friend.label.slice(0, 18) : ''

        islands.push({
            kind: 'friend',
            depth: islandDepth(terraces),
            layers: terraceLayers(terraces, 4, { bottom: '#111a30', top: '#34436a' }, friend.trees > 0 ? 0.7 : 0.4),
            trees: placeTrees({ terraces, count: marks, kind: 'friend', size: 5, seed: `${input.seed}:friend-trees:${index}`, spread: 0.85 }),
            title: `${friend.label || 'Someone you invited'}: ${friend.trees.toLocaleString('en')} ${friend.trees === 1 ? 'tree' : 'trees'}${friend.contributing === false ? ' (joined, not contributing yet)' : ''}`,
            label: labelText ? { text: labelText, x: topPoint.x, y: topPoint.y - (marks > 0 ? 22 : 12) } : null,
            sprout: marks === 0 ? topPoint : null,
        })

        // Root from the main island's shore to the friend's island.
        const start = project(Math.cos(angle) * shore * 0.98, Math.sin(angle) * shore * 0.98, 0)
        const end = project(cx - Math.cos(angle) * radius * 0.9, cy - Math.sin(angle) * radius * 0.9, 0)
        const bend = (friendRandom() - 0.5) * 60
        const control = project(
            (Math.cos(angle) * shore + cx) / 2 - Math.sin(angle) * bend,
            (Math.sin(angle) * shore + cy) / 2 + Math.cos(angle) * bend,
            0
        )
        links.push(`M${start.x.toFixed(1)},${start.y.toFixed(1)} Q${control.x.toFixed(1)},${control.y.toFixed(1)} ${end.x.toFixed(1)},${end.y.toFixed(1)}`)
    })

    // Painter's order: islands and trees further back are drawn first.
    islands.sort((a, b) => a.depth - b.depth)
    for (const island of islands) {
        island.trees.sort((a, b) => a.y - b.y)
        const center = island.trees.length
            ? island.trees.reduce((sum, mark) => ({ x: sum.x + mark.x, y: sum.y + mark.y }), { x: 0, y: 0 })
            : { x: 0, y: 0 }
        const cx = island.trees.length ? center.x / island.trees.length : 0
        const cy = island.trees.length ? center.y / island.trees.length : 0
        // Trees grow in from the island's heart outwards.
        const byDistance = [...island.trees].sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))
        byDistance.forEach((mark, order) => {
            mark.delay = Math.min(1400, order * (island.kind === 'main' ? 9 : 30) + (island.kind === 'main' ? 0 : 500))
        })
    }

    // Fit the view to everything that was drawn.
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const island of islands) {
        for (const layer of island.layers) {
            for (const pair of layer.shadowPoints.split(' ').concat(layer.points.split(' '))) {
                const [px, py] = pair.split(',').map(Number)
                minX = Math.min(minX, px)
                maxX = Math.max(maxX, px)
                minY = Math.min(minY, py)
                maxY = Math.max(maxY, py)
            }
        }
        if (island.label) {
            minY = Math.min(minY, island.label.y - 14)
            minX = Math.min(minX, island.label.x - 40)
            maxX = Math.max(maxX, island.label.x + 40)
        }
        for (const mark of island.trees) minY = Math.min(minY, mark.y - mark.size * 2.6)
    }
    const padding = 18
    // Keep the soft glow under the main island inside the frame.
    const glow = { cx: 0, cy: 10, rx: MAIN_RADIUS * 1.3, ry: MAIN_RADIUS * 1.3 * TILT }
    minX = Math.min(minX, glow.cx - glow.rx)
    maxX = Math.max(maxX, glow.cx + glow.rx)
    minY = Math.min(minY, glow.cy - glow.ry)
    maxY = Math.max(maxY, glow.cy + glow.ry)

    return {
        viewBox: {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2,
        },
        islands,
        links,
        glow,
        treesPerMark,
        hiddenFriends: Math.max(0, friends.length - shownFriends.length),
    }
}

// ---------------------------------------------------------------------------
// SVG rendering
// ---------------------------------------------------------------------------

function escapeXml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function treeSvg(mark: TreeMark, prefix: string, animated: boolean) {
    const { x, y, size: s } = mark
    const light = mark.kind === 'invite' ? FOREST_COLORS.invite : mark.kind === 'own' ? FOREST_COLORS.own : FOREST_COLORS.friend
    const dark = mark.kind === 'invite' ? FOREST_COLORS.inviteShade : mark.kind === 'own' ? FOREST_COLORS.ownShade : FOREST_COLORS.friendShade
    const top = `${x.toFixed(1)},${(y - s * 2.3).toFixed(1)}`
    const left = `${(x - s * 0.72).toFixed(1)},${(y - s * 0.25).toFixed(1)}`
    const right = `${(x + s * 0.72).toFixed(1)},${(y - s * 0.25).toFixed(1)}`
    const bottom = `${x.toFixed(1)},${(y + s * 0.05).toFixed(1)}`
    const style = animated ? ` class="${prefix}-tree" style="animation-delay:${mark.delay}ms"` : ''
    const ring = mark.kind === 'invite'
        ? `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(s * 2.1).toFixed(1)}" ry="${(s * 0.95).toFixed(1)}" fill="none" stroke="${FOREST_COLORS.invite}" stroke-width="1.1" opacity="0.55"${animated ? ` class="${prefix}-pulse" style="animation-delay:${(mark.delay * 3) % 2800}ms"` : ''}/>`
        : ''
    const glow = mark.kind === 'invite'
        ? `<circle cx="${x.toFixed(1)}" cy="${(y - s * 1.1).toFixed(1)}" r="${(s * 1.9).toFixed(1)}" fill="${FOREST_COLORS.invite}" opacity="0.14"/>`
        : ''

    return `<g${style}>${ring}${glow}<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(s * 0.8).toFixed(1)}" ry="${(s * 0.32).toFixed(1)}" fill="#050912" opacity="0.45"/><polygon points="${top} ${left} ${bottom}" fill="${light}"/><polygon points="${top} ${bottom} ${right}" fill="${dark}"/></g>`
}

export function renderForestSvg(scene: ForestScene, options: {
    animated?: boolean
    idPrefix?: string
    title?: string
    // Fixed pixel size for rasterising (share images); otherwise fluid width.
    size?: { width: number; height: number }
} = {}) {
    const animated = options.animated !== false
    const prefix = (options.idPrefix || 'fi').replace(/[^a-z0-9-]/gi, '')
    const { viewBox } = scene
    const parts: string[] = []
    const sizing = options.size
        ? `width="${Math.round(options.size.width)}" height="${Math.round(options.size.height)}"`
        : 'style="width:100%;height:auto;display:block;overflow:visible"'

    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.x.toFixed(1)} ${viewBox.y.toFixed(1)} ${viewBox.width.toFixed(1)} ${viewBox.height.toFixed(1)}" role="img" aria-label="${escapeXml(options.title || 'Forest island')}" ${sizing}>`)

    if (animated) {
        parts.push(`<style>
.${prefix}-tree{transform-box:fill-box;transform-origin:50% 100%;animation:${prefix}-grow .7s cubic-bezier(.2,.8,.2,1) both}
.${prefix}-pulse{transform-box:fill-box;transform-origin:center;animation:${prefix}-pulse 2.8s ease-out infinite}
.${prefix}-flow{animation:${prefix}-flow 1.4s linear infinite}
.${prefix}-float{animation:${prefix}-float 7s ease-in-out infinite}
@keyframes ${prefix}-grow{from{transform:scale(0);opacity:0}}
@keyframes ${prefix}-pulse{0%{transform:scale(.45);opacity:.9}80%,100%{transform:scale(1.5);opacity:0}}
@keyframes ${prefix}-flow{to{stroke-dashoffset:-18}}
@keyframes ${prefix}-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@media (prefers-reduced-motion:reduce){.${prefix}-tree,.${prefix}-pulse,.${prefix}-flow,.${prefix}-float{animation:none}}
</style>`)
    }

    parts.push(`<ellipse cx="${scene.glow.cx}" cy="${scene.glow.cy}" rx="${scene.glow.rx.toFixed(1)}" ry="${scene.glow.ry.toFixed(1)}" fill="#1b2a4d" opacity="0.35"/>`)

    for (const link of scene.links) {
        parts.push(`<path d="${link}" fill="none" stroke="${FOREST_COLORS.link}" stroke-width="1.4" stroke-dasharray="3 6" stroke-linecap="round" opacity="0.6"${animated ? ` class="${prefix}-flow"` : ''}/>`)
    }

    for (const island of scene.islands) {
        parts.push(`<g${animated && island.kind === 'main' ? ` class="${prefix}-float"` : ''}><title>${escapeXml(island.title)}</title>`)
        for (const layer of island.layers) {
            parts.push(`<polygon points="${layer.shadowPoints}" fill="#060a16" opacity="0.85"/>`)
            parts.push(`<polygon points="${layer.points}" fill="${layer.fill}" stroke="${layer.stroke}" stroke-width="${island.kind === 'main' ? 1.3 : 1}" stroke-linejoin="round"/>`)
        }
        for (const mark of island.trees) parts.push(treeSvg(mark, prefix, animated))
        if (island.sprout) {
            const { x, y } = island.sprout
            parts.push(`<g opacity="0.8"><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y - 9).toFixed(1)}" stroke="${FOREST_COLORS.friend}" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="${(x - 3.2).toFixed(1)}" cy="${(y - 8).toFixed(1)}" rx="3.4" ry="1.7" fill="${FOREST_COLORS.friend}" transform="rotate(-25 ${(x - 3.2).toFixed(1)} ${(y - 8).toFixed(1)})"/><ellipse cx="${(x + 3.2).toFixed(1)}" cy="${(y - 9.5).toFixed(1)}" rx="3.4" ry="1.7" fill="${FOREST_COLORS.friend}" transform="rotate(25 ${(x + 3.2).toFixed(1)} ${(y - 9.5).toFixed(1)})"/></g>`)
        }
        if (island.label) {
            parts.push(`<text x="${island.label.x.toFixed(1)}" y="${island.label.y.toFixed(1)}" text-anchor="middle" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="9" font-weight="700" fill="${FOREST_COLORS.label}" opacity="0.85">${escapeXml(island.label.text)}</text>`)
        }
        parts.push('</g>')
    }

    parts.push('</svg>')
    return parts.join('')
}
