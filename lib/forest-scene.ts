// "Storybook" forest visualisation of a member's impact.
//
// Seen from above in daylight: the member's own grove sits in the middle,
// each person they invited has a smaller grove linked to it by a path, and
// empty plots invite them to add the next friend. Every tree mark is a tree:
// greens for trees they planted, bright yellow for trees earned through
// invites, blue-greens in friends' groves.
//
// Dependency-free and deterministic (seeded by member id), so the same code
// renders the web page, the desktop app and server-side share images, and a
// member's trees stay where they were as the forest grows.

/** Whether someone's computer is on and planting right now (only shown to the forest's owner and team). */
export type PresenceStatus = 'working' | 'sleeping'

export type ForestFriend = {
    label?: string | null
    trees: number
    contributing?: boolean
    status?: PresenceStatus | null
}

export type ForestSceneInput = {
    ownTrees: number
    inviteTrees: number
    friends: ForestFriend[]
    seed: string
    /** The owner's own computer, shown as a character in the main grove. */
    ownStatus?: PresenceStatus | null
    /**
     * Team forests: the middle is a shared clearing. Every member's trees
     * grow in their own grove; the middle only holds the trees of members
     * without a grove of their own, so no tree is drawn twice.
     */
    hub?: boolean
    /**
     * 'full' (3D view): one drawn tree per real tree, up to MAX_FULL_MARKS.
     * 'compact' (default, SVG and share images): large forests are scaled down.
     */
    detail?: 'compact' | 'full'
}

type TreeKind = 'own' | 'invite' | 'friend'
export type TreeShape = 'round' | 'drop' | 'cone' | 'column'
type IslandKind = 'main' | 'friend' | 'plot'

type TreeMark = {
    x: number
    y: number
    kind: TreeKind
    shape: TreeShape
    color: string
    size: number
    delay: number
}

type BushMark = {
    x: number
    y: number
    size: number
    color: string
}

type Island = {
    kind: IslandKind
    depth: number
    outline: string
    trees: TreeMark[]
    bushes: BushMark[]
    title: string
    label: { text: string; x: number; y: number } | null
    sprout: { x: number; y: number } | null
    center: { x: number; y: number }
}

export type ForestScene = {
    viewBox: { x: number; y: number; width: number; height: number }
    islands: Island[]
    links: Array<{ d: string; planned: boolean }>
    treesPerMark: number
    hiddenFriends: number
}

const TILT = 0.62
const MAX_MAIN_MARKS = 180
const MAX_FRIEND_MARKS = 26
const MAX_FRIEND_ISLANDS = 12
// In the 3D view every tree is drawn up to this many; beyond it, one drawn
// tree stands for a few real ones.
export const MAX_FULL_MARKS = 5000
// Empty plots shown for friends not invited yet, so there is always a
// visible place for the next one.
const TARGET_GROVES = 3

/** Legend colours (one per kind), used by the UI next to the forest. */
export const FOREST_COLORS = {
    own: '#3F8A45',
    invite: '#E0F146',
    friend: '#4E9C8E',
}

/** Full daylight palette shared by the SVG and 3D renderers. */
export const FOREST_PALETTE = {
    ground: '#DCE2CF',
    clearing: '#BFCB9C',
    friendClearing: '#C4D0A7',
    plotEdge: '#8E9C72',
    path: '#F3EBCF',
    pathEdge: '#D8C99A',
    trunk: '#6B3F2A',
    ink: '#0B101F',
    own: ['#1F5A33', '#2E6B3A', '#3F8A45', '#5FA34A', '#86B94A', '#A3C74B', '#2F7A5C', '#246B52', '#4E9C6E', '#1B4A2E'],
    friend: ['#2F7A6E', '#3E9384', '#5AAE8F', '#78C1A0', '#276458', '#4E9C8E'],
    invite: '#E0F146',
    sprout: '#5FA34A',
}

/** Crown width/height and stem height of a tree mark, in world units. */
export function treeDimensions(shape: TreeShape, size: number) {
    switch (shape) {
        case 'cone': return { width: size * 2.5, height: size * 4.2, stem: size * 0.6 }
        case 'drop': return { width: size * 2.7, height: size * 3.7, stem: size * 0.7 }
        case 'column': return { width: size * 1.9, height: size * 4.6, stem: size * 0.6 }
        default: return { width: size * 3.3, height: size * 2.9, stem: size * 0.9 }
    }
}

export function treeColor(kind: TreeKind, tone: number) {
    if (kind === 'invite') return FOREST_PALETTE.invite
    const colors = kind === 'friend' ? FOREST_PALETTE.friend : FOREST_PALETTE.own
    return colors[Math.min(colors.length - 1, Math.floor(tone * colors.length))]
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

function buildClearing(random: () => number, cx: number, cy: number, radius: number, roughness: number): Terrace {
    return {
        cx,
        cy,
        z: 0,
        radius,
        waves: makeWaves(random, roughness * 0.45),
        sharedWaves: makeWaves(random, roughness),
    }
}

// ---------------------------------------------------------------------------
// World model, shared by the SVG projection and the 3D renderer
// ---------------------------------------------------------------------------
// World units: x/y are horizontal, z is height. Groves are flat clearings
// (z = 0) of `levelHeight` thickness; the main grove grows with its trees.

const OUTLINE_SAMPLES = 72
const CLEARING_THICKNESS = 2

export type WorldTerrace = {
    cx: number
    cy: number
    z: number
    outline: Array<[number, number]>
}

export type WorldTree = {
    x: number
    y: number
    z: number
    kind: TreeKind
    shape: TreeShape
    tone: number
    size: number
}

export type WorldBush = {
    x: number
    y: number
    z: number
    size: number
    tone: number
}

export type WorldIsland = {
    kind: IslandKind
    terraces: WorldTerrace[]
    levelHeight: number
    trees: WorldTree[]
    bushes: WorldBush[]
    title: string
    label: string | null
    sprout: { x: number; y: number; z: number } | null
    center: { x: number; y: number }
    radius: number
    /** A little person at the grove's edge: awake and watering, or asleep. */
    character: { x: number; y: number; z: number; state: PresenceStatus } | null
}

export type WorldRoot = {
    start: [number, number]
    control: [number, number]
    end: [number, number]
    planned: boolean
}

export type ForestWorld = {
    islands: WorldIsland[]
    roots: WorldRoot[]
    treesPerMark: number
    hiddenFriends: number
    mainRadius: number
}

function worldOutline(terrace: Terrace): WorldTerrace {
    const outline: Array<[number, number]> = []
    for (let index = 0; index < OUTLINE_SAMPLES; index += 1) {
        const theta = (index / OUTLINE_SAMPLES) * Math.PI * 2
        const r = terraceRadius(terrace, theta)
        outline.push([terrace.cx + Math.cos(theta) * r, terrace.cy + Math.sin(theta) * r])
    }
    return { cx: terrace.cx, cy: terrace.cy, z: terrace.z, outline }
}

function pickShape(random: () => number): TreeShape {
    const roll = random()
    if (roll < 0.42) return 'round'
    if (roll < 0.67) return 'drop'
    if (roll < 0.86) return 'cone'
    return 'column'
}

// Scatter marks inside a clearing, keeping a minimum spacing so crowns
// overlap a little but stay readable.
function placeTrees(options: {
    clearing: Terrace
    count: number
    kind: TreeKind
    size: number
    seed: string
    spread: number
    avoid?: WorldTree[]
}): WorldTree[] {
    const { clearing, count, kind, size, seed, spread } = options
    const random = rng(seed)
    const trees: WorldTree[] = []
    const others = options.avoid || []
    const area = Math.PI * (clearing.radius * spread) ** 2
    let spacing = Math.sqrt(area / Math.max(1, count + others.length)) * 0.8
    let attempts = 0

    // Grid of placed trees, so each check only looks at close neighbours.
    // The spacing only ever shrinks, so neighbouring cells always cover it.
    const cell = Math.max(spacing, 1e-6)
    const grid = new Map<string, WorldTree[]>()
    const cellKey = (gx: number, gy: number) => `${gx},${gy}`
    const insert = (tree: WorldTree) => {
        const key = cellKey(Math.floor(tree.x / cell), Math.floor(tree.y / cell))
        const bucket = grid.get(key)
        if (bucket) bucket.push(tree)
        else grid.set(key, [tree])
    }
    const crowded = (x: number, y: number) => {
        const gx = Math.floor(x / cell)
        const gy = Math.floor(y / cell)
        for (let dx = -1; dx <= 1; dx += 1) {
            for (let dy = -1; dy <= 1; dy += 1) {
                const bucket = grid.get(cellKey(gx + dx, gy + dy))
                if (bucket?.some(tree => Math.hypot(tree.x - x, tree.y - y) < spacing)) return true
            }
        }
        return false
    }
    others.forEach(insert)

    while (trees.length < count && attempts < count * 60) {
        attempts += 1
        // Relax the spacing if the clearing is getting full.
        if (attempts % (count * 15) === 0) spacing *= 0.85
        const theta = random() * Math.PI * 2
        const rho = Math.sqrt(random()) * spread
        const x = clearing.cx + Math.cos(theta) * terraceRadius(clearing, theta) * rho
        const y = clearing.cy + Math.sin(theta) * terraceRadius(clearing, theta) * rho
        if (crowded(x, y)) continue
        const shape = kind === 'invite' ? 'round' : pickShape(random)
        const tree: WorldTree = { x, y, z: clearing.z, kind, shape, tone: random(), size: size * (0.85 + random() * 0.3) }
        trees.push(tree)
        insert(tree)
    }

    return trees
}

function placeBushes(clearing: Terrace, count: number, seed: string, size: number): WorldBush[] {
    const random = rng(seed)
    return Array.from({ length: count }, () => {
        const theta = random() * Math.PI * 2
        const rho = 0.35 + Math.sqrt(random()) * 0.6
        return {
            x: clearing.cx + Math.cos(theta) * terraceRadius(clearing, theta) * rho,
            y: clearing.cy + Math.sin(theta) * terraceRadius(clearing, theta) * rho,
            z: clearing.z,
            size: size * (0.7 + random() * 0.6),
            tone: random(),
        }
    })
}

const wholeTrees = (value: number | undefined) => Math.max(0, Math.floor(value || 0))

function sortedFriends(friends: ForestFriend[]) {
    return friends
        .map(friend => ({ ...friend, trees: wholeTrees(friend.trees) }))
        .sort((a, b) => b.trees - a.trees)
}

// Trees drawn in the middle grove. In a team forest that is everyone
// without a grove of their own (beyond the 12 biggest).
function mainGroveTrees(input: Pick<ForestSceneInput, 'ownTrees' | 'inviteTrees' | 'friends' | 'hub'>) {
    if (!input.hub) return { own: wholeTrees(input.ownTrees), invite: wholeTrees(input.inviteTrees) }
    const hidden = sortedFriends(input.friends).slice(MAX_FRIEND_ISLANDS)
    return { own: hidden.reduce((sum, friend) => sum + friend.trees, 0), invite: 0 }
}

/** What the legend needs to explain: how many trees one mark stands for, and friends not drawn. */
export function forestSceneSummary(input: Pick<ForestSceneInput, 'ownTrees' | 'inviteTrees' | 'friends' | 'hub' | 'detail'>) {
    const main = mainGroveTrees(input)
    const hiddenFriends = Math.max(0, input.friends.length - MAX_FRIEND_ISLANDS)
    if (input.detail !== 'full') {
        return { treesPerMark: Math.max(1, Math.ceil((main.own + main.invite) / MAX_MAIN_MARKS)), hiddenFriends }
    }
    // Everything drawn counts towards the limit, groves included.
    const shown = sortedFriends(input.friends).slice(0, MAX_FRIEND_ISLANDS).reduce((sum, friend) => sum + friend.trees, 0)
    return { treesPerMark: Math.max(1, Math.ceil((main.own + main.invite + shown) / MAX_FULL_MARKS)), hiddenFriends }
}

// Where a grove's character stands: on its front edge (towards the camera),
// a little to the side so it doesn't block the path in.
function characterSpot(clearing: Terrace, state: PresenceStatus | null | undefined) {
    if (!state) return null
    const theta = Math.PI / 2 + 0.6
    const r = terraceRadius(clearing, theta) * 0.95
    return { x: clearing.cx + Math.cos(theta) * r, y: clearing.cy + Math.sin(theta) * r, z: clearing.z, state }
}

function statusNote(friend: ForestFriend) {
    if (friend.status === 'working') return ', planting right now'
    if (friend.contributing === false) return ' (joined, not planting yet)'
    if (friend.status === 'sleeping') return ', computer resting'
    return ''
}

export function buildForestWorld(input: ForestSceneInput): ForestWorld {
    const full = input.detail === 'full'
    const { own: ownTrees, invite: inviteTrees } = mainGroveTrees(input)
    const random = rng(`${input.seed}:terrain`)

    // One mark can stand for several trees so large forests stay readable.
    const { treesPerMark } = forestSceneSummary(input)
    const ownMarks = ownTrees > 0 ? Math.max(1, Math.round(ownTrees / treesPerMark)) : 0
    const inviteMarks = inviteTrees > 0 ? Math.max(1, Math.round(inviteTrees / treesPerMark)) : 0
    const marks = ownMarks + inviteMarks

    // The grove grows with the forest, so density stays about the same.
    // In the full view it keeps growing past the compact size limit.
    const compactRadius = Math.min(165, 48 + Math.sqrt(marks) * 11)
    const mainRadius = full ? Math.max(compactRadius, Math.sqrt(marks) * 12.3) : compactRadius
    const main = buildClearing(random, 0, 0, mainRadius, 0.14)
    const invite = placeTrees({ clearing: main, count: inviteMarks, kind: 'invite', size: 7.2, seed: `${input.seed}:invite`, spread: 0.75 })
    const own = placeTrees({ clearing: main, count: ownMarks, kind: 'own', size: 6.2, seed: `${input.seed}:own`, spread: 0.9, avoid: invite })

    const islands: WorldIsland[] = [{
        kind: 'main',
        terraces: [worldOutline(main)],
        levelHeight: CLEARING_THICKNESS,
        trees: [...own, ...invite],
        bushes: placeBushes(main, Math.round(Math.min(10 + mainRadius * 0.35, input.hub ? Math.max(8, marks * 1.2) : marks * 1.2)), `${input.seed}:bushes`, 3.4),
        title: input.hub ? 'Team clearing' : 'Your forest',
        label: null,
        sprout: marks === 0 && !input.hub ? { x: main.cx, y: main.cy, z: 0 } : null,
        center: { x: 0, y: 0 },
        radius: mainRadius,
        character: input.hub ? null : characterSpot(main, input.ownStatus),
    }]

    const friends = sortedFriends(input.friends)
    const shownFriends = friends.slice(0, MAX_FRIEND_ISLANDS)
    const plots = shownFriends.length < TARGET_GROVES ? TARGET_GROVES - shownFriends.length : shownFriends.length < MAX_FRIEND_ISLANDS ? 1 : 0
    const slots = shownFriends.length + plots
    const roots: WorldRoot[] = []
    const angleOffset = random() * Math.PI * 2

    // Size every grove first, so big groves can be spaced far enough apart.
    const groves = Array.from({ length: slots }, (_, index) => {
        const friend = shownFriends[index] as (typeof shownFriends)[number] | undefined
        const friendMarks = friend && friend.trees > 0
            ? (full ? Math.max(1, Math.round(friend.trees / treesPerMark)) : Math.min(MAX_FRIEND_MARKS, Math.max(1, Math.round(friend.trees / treesPerMark))))
            : 0
        const compact = Math.min(58, 18 + Math.sqrt(friendMarks) * 7.5)
        const radius = friend ? (friendMarks > 0 ? (full ? Math.max(compact, Math.sqrt(friendMarks) * 11) : compact) : 15) : 17
        return { friend, friendMarks, radius }
    })
    // Full view: each grove gets a share of the circle in proportion to its
    // size, on a ring just wide enough that neighbours don't overlap.
    // Small groves still get room for their name label.
    const widths = groves.map(grove => Math.max(grove.radius, 40) + 26)
    const widthTotal = widths.reduce((sum, width) => sum + width, 0)
    const ring = full && slots > 1 ? (widthTotal / Math.PI) * 1.1 : 0
    let widthBefore = 0

    for (let index = 0; index < slots; index += 1) {
        const { friend, friendMarks, radius } = groves[index]
        const friendRandom = rng(`${input.seed}:friend:${index}`)
        const share = full ? (widthBefore + widths[index] / 2) / widthTotal : index / slots
        widthBefore += widths[index]
        const angle = angleOffset + share * Math.PI * 2 + (friendRandom() - 0.5) * (full ? 0.08 : 0.3)
        // Measure from the main grove's actual edge in this direction, and
        // stagger alternate groves outwards so neighbours don't collide.
        const shore = terraceRadius(main, angle)
        const stagger = !full && slots > 6 && index % 2 === 1 ? 50 : 0
        const distance = Math.max(shore + radius + 42 + stagger + friendRandom() * 18, ring)
        const cx = Math.cos(angle) * distance
        const cy = Math.sin(angle) * distance
        const clearing = buildClearing(friendRandom, cx, cy, radius, 0.12)

        if (friend) {
            islands.push({
                kind: 'friend',
                terraces: [worldOutline(clearing)],
                levelHeight: CLEARING_THICKNESS,
                trees: placeTrees({ clearing, count: friendMarks, kind: 'friend', size: 5.2, seed: `${input.seed}:friend-trees:${index}`, spread: 0.85 }),
                bushes: placeBushes(clearing, Math.round(Math.min(3 + radius * 0.2, friendMarks)), `${input.seed}:friend-bushes:${index}`, 2.8),
                title: `${friend.label || (input.hub ? 'A member' : 'Someone you invited')}: ${friend.trees.toLocaleString('en')} ${friend.trees === 1 ? 'tree' : 'trees'}${statusNote(friend)}`,
                label: friend.label ? friend.label.slice(0, 18) : null,
                sprout: friendMarks === 0 ? { x: cx, y: cy, z: 0 } : null,
                center: { x: cx, y: cy },
                radius,
                character: characterSpot(clearing, friend.status),
            })
        } else {
            islands.push({
                kind: 'plot',
                terraces: [worldOutline(clearing)],
                levelHeight: 0.6,
                trees: [],
                bushes: [],
                title: 'Invite a friend to plant here',
                label: null,
                sprout: null,
                center: { x: cx, y: cy },
                radius,
                character: null,
            })
        }

        // Path from the main grove's edge to the friend's grove.
        const bend = (friendRandom() - 0.5) * 60
        roots.push({
            start: [Math.cos(angle) * shore * 0.94, Math.sin(angle) * shore * 0.94],
            control: [
                (Math.cos(angle) * shore + cx) / 2 - Math.sin(angle) * bend,
                (Math.sin(angle) * shore + cy) / 2 + Math.cos(angle) * bend,
            ],
            end: [cx - Math.cos(angle) * radius * 0.8, cy - Math.sin(angle) * radius * 0.8],
            planned: !friend,
        })
    }

    return {
        islands,
        roots,
        treesPerMark,
        hiddenFriends: Math.max(0, friends.length - shownFriends.length),
        mainRadius,
    }
}

// ---------------------------------------------------------------------------
// 2D projection (SVG)
// ---------------------------------------------------------------------------

function pointsOf(outline: Array<[number, number]>, z: number) {
    return outline.map(([x, y]) => {
        const point = project(x, y, z)
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`
    }).join(' ')
}

export function buildForestScene(input: ForestSceneInput): ForestScene {
    const world = buildForestWorld(input)

    const islands: Island[] = world.islands.map(island => {
        const base = island.terraces[0]
        const center = project(island.center.x, island.center.y, 0)
        const tallest = island.trees.reduce((max, tree) => Math.max(max, treeDimensions(tree.shape, tree.size).height), 0)
        return {
            kind: island.kind,
            depth: center.y,
            outline: pointsOf(base.outline, base.z),
            trees: island.trees.map(tree => {
                const point = project(tree.x, tree.y, tree.z)
                return { x: point.x, y: point.y, kind: tree.kind, shape: tree.shape, color: treeColor(tree.kind, tree.tone), size: tree.size, delay: 0 }
            }),
            bushes: island.bushes.map(bush => {
                const point = project(bush.x, bush.y, bush.z)
                return { x: point.x, y: point.y, size: bush.size, color: treeColor(island.kind === 'main' ? 'own' : 'friend', bush.tone) }
            }),
            title: island.title,
            label: island.label ? { text: island.label, x: center.x, y: center.y - island.radius * TILT - Math.min(tallest, 20) - 4 } : null,
            sprout: island.sprout ? project(island.sprout.x, island.sprout.y, island.sprout.z) : null,
            center,
        }
    })

    const links = world.roots.map(root => {
        const start = project(root.start[0], root.start[1], 0)
        const control = project(root.control[0], root.control[1], 0)
        const end = project(root.end[0], root.end[1], 0)
        return { d: `M${start.x.toFixed(1)},${start.y.toFixed(1)} Q${control.x.toFixed(1)},${control.y.toFixed(1)} ${end.x.toFixed(1)},${end.y.toFixed(1)}`, planned: root.planned }
    })

    // Painter's order: groves and trees further back are drawn first.
    islands.sort((a, b) => a.depth - b.depth)
    for (const island of islands) {
        island.trees.sort((a, b) => a.y - b.y)
        const cx = island.center.x
        const cy = island.center.y
        // Trees grow in from the grove's heart outwards.
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
    const include = (x: number, y: number) => {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
    }
    for (const island of islands) {
        for (const pair of island.outline.split(' ')) {
            const [px, py] = pair.split(',').map(Number)
            include(px, py)
            include(px, py + CLEARING_THICKNESS + 2)
        }
        for (const mark of island.trees) {
            const { width, height, stem } = treeDimensions(mark.shape, mark.size)
            include(mark.x - width / 2, mark.y - stem - height)
            include(mark.x + width / 2, mark.y)
        }
        if (island.label) {
            include(island.label.x - 40, island.label.y - 14)
            include(island.label.x + 40, island.label.y)
        }
    }
    const padding = 16

    return {
        viewBox: {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2,
        },
        islands,
        links,
        treesPerMark: world.treesPerMark,
        hiddenFriends: world.hiddenFriends,
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

const f = (value: number) => value.toFixed(1)

function crownPath(shape: TreeShape, cx: number, cy: number, w: number, h: number) {
    switch (shape) {
        case 'cone':
            return `M${f(cx)},${f(cy - h / 2)} Q${f(cx + w * 0.62)},${f(cy + h * 0.2)} ${f(cx + w * 0.48)},${f(cy + h / 2)} L${f(cx - w * 0.48)},${f(cy + h / 2)} Q${f(cx - w * 0.62)},${f(cy + h * 0.2)} ${f(cx)},${f(cy - h / 2)}Z`
        case 'drop':
            return `M${f(cx)},${f(cy - h / 2)} C${f(cx + w * 0.72)},${f(cy - h * 0.12)} ${f(cx + w * 0.58)},${f(cy + h / 2)} ${f(cx)},${f(cy + h / 2)} C${f(cx - w * 0.58)},${f(cy + h / 2)} ${f(cx - w * 0.72)},${f(cy - h * 0.12)} ${f(cx)},${f(cy - h / 2)}Z`
        default: {
            const rx = w / 2
            const ry = h / 2
            return `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(cx - rx)},${f(cy)}Z`
        }
    }
}

function treeSvg(mark: TreeMark, prefix: string, animated: boolean) {
    const { x, y } = mark
    const { width: w, height: h, stem } = treeDimensions(mark.shape, mark.size)
    const cy = y - stem - h / 2
    const crown = crownPath(mark.shape, x, cy, w, h)
    const style = animated ? ` class="${prefix}-tree" style="animation-delay:${mark.delay}ms"` : ''
    const ring = mark.kind === 'invite'
        ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w * 0.9)}" ry="${f(w * 0.9 * TILT)}" fill="none" stroke="${FOREST_PALETTE.invite}" stroke-width="1.6" opacity="0.8"${animated ? ` class="${prefix}-pulse" style="animation-delay:${(mark.delay * 3) % 2800}ms"` : ''}/>`
        : ''
    const branches = `M${f(x)},${f(cy + h * 0.45)} L${f(x)},${f(cy - h * 0.25)} M${f(x)},${f(cy + h * 0.12)} L${f(x - w * 0.22)},${f(cy - h * 0.02)} M${f(x)},${f(cy + h * 0.12)} L${f(x + w * 0.22)},${f(cy - h * 0.02)}`

    return `<g${style}>${ring}<ellipse cx="${f(x + w * 0.22)}" cy="${f(y + 0.6)}" rx="${f(w * 0.52)}" ry="${f(w * 0.17)}" fill="#1c3018" opacity="0.2"/>`
        + `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(cy + h * 0.3)}" stroke="${FOREST_PALETTE.trunk}" stroke-width="${f(Math.max(1.1, w * 0.07))}" stroke-linecap="round"/>`
        + `<path d="${crown}" fill="${mark.color}"/><path d="${crown}" fill="url(#${prefix}-shade)"/>`
        + `<path d="${branches}" stroke="${FOREST_PALETTE.trunk}" stroke-width="${f(Math.max(0.7, w / 36))}" stroke-linecap="round" opacity="0.45" fill="none"/></g>`
}

function sproutSvg(x: number, y: number) {
    const leaf = FOREST_PALETTE.sprout
    return `<g><line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y - 10)}" stroke="${leaf}" stroke-width="1.8" stroke-linecap="round"/>`
        + `<ellipse cx="${f(x - 3.6)}" cy="${f(y - 9)}" rx="3.8" ry="1.9" fill="${leaf}" transform="rotate(-25 ${f(x - 3.6)} ${f(y - 9)})"/>`
        + `<ellipse cx="${f(x + 3.6)}" cy="${f(y - 10.5)}" rx="3.8" ry="1.9" fill="${leaf}" transform="rotate(25 ${f(x + 3.6)} ${f(y - 10.5)})"/></g>`
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

    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(viewBox.x)} ${f(viewBox.y)} ${f(viewBox.width)} ${f(viewBox.height)}" role="img" aria-label="${escapeXml(options.title || 'Forest')}" ${sizing}>`)
    parts.push(`<defs><linearGradient id="${prefix}-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.55" stop-color="#0b1a10" stop-opacity="0"/><stop offset="1" stop-color="#0b1a10" stop-opacity="0.22"/></linearGradient></defs>`)

    if (animated) {
        parts.push(`<style>
.${prefix}-tree{transform-box:fill-box;transform-origin:50% 100%;animation:${prefix}-grow .7s cubic-bezier(.2,.8,.2,1) both}
.${prefix}-pulse{transform-box:fill-box;transform-origin:center;animation:${prefix}-pulse 2.8s ease-out infinite}
.${prefix}-plot{animation:${prefix}-dash 1.6s linear infinite}
@keyframes ${prefix}-grow{from{transform:scale(0);opacity:0}}
@keyframes ${prefix}-pulse{0%{transform:scale(.5);opacity:.9}80%,100%{transform:scale(1.4);opacity:0}}
@keyframes ${prefix}-dash{to{stroke-dashoffset:-16}}
@media (prefers-reduced-motion:reduce){.${prefix}-tree,.${prefix}-pulse,.${prefix}-plot{animation:none}}
</style>`)
    }

    for (const link of scene.links) {
        if (link.planned) {
            parts.push(`<path d="${link.d}" fill="none" stroke="${FOREST_PALETTE.pathEdge}" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>`)
        } else {
            parts.push(`<path d="${link.d}" fill="none" stroke="${FOREST_PALETTE.pathEdge}" stroke-width="9" stroke-linecap="round"/>`)
            parts.push(`<path d="${link.d}" fill="none" stroke="${FOREST_PALETTE.path}" stroke-width="6.5" stroke-linecap="round"/>`)
        }
    }

    for (const island of scene.islands) {
        parts.push(`<g><title>${escapeXml(island.title)}</title>`)
        if (island.kind === 'plot') {
            const { x, y } = island.center
            parts.push(`<polygon points="${island.outline}" fill="#ffffff" fill-opacity="0.25" stroke="${FOREST_PALETTE.plotEdge}" stroke-width="1.4" stroke-dasharray="4 4"${animated ? ` class="${prefix}-plot"` : ''}/>`)
            parts.push(`<circle cx="${f(x)}" cy="${f(y)}" r="6.5" fill="${FOREST_PALETTE.invite}" stroke="${FOREST_PALETTE.ink}" stroke-width="1.2"/><path d="M${f(x - 3)},${f(y)} H${f(x + 3)} M${f(x)},${f(y - 3)} V${f(y + 3)}" stroke="${FOREST_PALETTE.ink}" stroke-width="1.5" stroke-linecap="round"/>`)
        } else {
            const thickness = CLEARING_THICKNESS + 1.5
            const shifted = island.outline.split(' ').map(pair => {
                const [px, py] = pair.split(',').map(Number)
                return `${f(px)},${f(py + thickness)}`
            }).join(' ')
            const fill = island.kind === 'main' ? FOREST_PALETTE.clearing : FOREST_PALETTE.friendClearing
            parts.push(`<polygon points="${shifted}" fill="#a3b07e"/>`)
            parts.push(`<polygon points="${island.outline}" fill="${fill}"/>`)
            const marks = [
                ...island.bushes.map(bush => ({ y: bush.y, svg: `<ellipse cx="${f(bush.x)}" cy="${f(bush.y - bush.size * 0.5)}" rx="${f(bush.size * 1.3)}" ry="${f(bush.size * 0.85)}" fill="${bush.color}"/>` })),
                ...island.trees.map(mark => ({ y: mark.y, svg: treeSvg(mark, prefix, animated) })),
            ].sort((a, b) => a.y - b.y)
            for (const mark of marks) parts.push(mark.svg)
            if (island.sprout) parts.push(sproutSvg(island.sprout.x, island.sprout.y))
        }
        if (island.label) {
            parts.push(`<text x="${f(island.label.x)}" y="${f(island.label.y)}" text-anchor="middle" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" font-size="9" font-weight="800" fill="${FOREST_PALETTE.ink}" opacity="0.8">${escapeXml(island.label.text)}</text>`)
        }
        parts.push('</g>')
    }

    parts.push('</svg>')
    return parts.join('')
}
