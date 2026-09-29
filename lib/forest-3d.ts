// Interactive 3D version of the storybook forest (three.js).
//
// Uses the same world model as the SVG renderer (buildForestWorld), so both
// show the same groves, trees, friends and empty plots. Framework-agnostic:
// call mountForest3D(container, input) and keep the returned handle to
// control or dispose it. Loaded lazily by the UI, so three.js only ships to
// pages that show a forest.
//
// Interaction model (kept friendly to page scrolling):
//   * mouse: drag rotates at any time; the wheel only zooms after the scene
//     has been clicked (until the pointer leaves it)
//   * touch: one tap "activates" the scene; until then touches scroll the page
//   * clicking a friend's grove flies the camera to it; reset() flies back
//   * clicking an empty plot calls options.onPlotClick (invite / join)
//
// Every tree is drawn (up to MAX_FULL_MARKS). When presence is known, each
// grove has a little person: awake and watering while that computer is
// planting, asleep otherwise.

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
    FOREST_PALETTE,
    buildForestWorld,
    treeColor,
    treeDimensions,
    type ForestSceneInput,
    type TreeShape,
    type WorldIsland,
} from './forest-scene'

const WATER = '#7CC4F0'
const CAN = '#5B8DB8'

export type Forest3DOptions = {
    reducedMotion?: boolean
    onActiveChange?: (active: boolean) => void
    onFocusChange?: (focusedIsland: string | null) => void
    /** Called when an empty plot is clicked; plots are only interactive when set. */
    onPlotClick?: () => void
    /** Text on empty plots, e.g. "Invite a friend" or "Join Anna". */
    plotLabel?: string
    /** Name of the centre grove in tooltips, e.g. "Team forest". */
    mainTitle?: string
}

export type Forest3DHandle = {
    zoomBy: (factor: number) => void
    reset: () => void
    setActive: (active: boolean) => void
    dispose: () => void
}

// Camera tilt above the ground: looking down at the forest, low enough to
// see trunks and crown shapes.
const ELEVATION = 0.66
const TREE_SHAPES: TreeShape[] = ['round', 'drop', 'cone', 'column']

export function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas')
        return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
    } catch {
        return false
    }
}

// Deterministic per-instance jitter without another RNG stream.
function jitter(index: number, salt: number) {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
    return value - Math.floor(value)
}

// World (x, y horizontal, z up) -> three.js (y up).
function toVector(x: number, y: number, z: number) {
    return new THREE.Vector3(x, z, y)
}

// Hand-drawn leaf strokes, multiplied with each crown's colour.
function foliageTexture() {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')!
    context.fillStyle = '#ededed'
    context.fillRect(0, 0, size, size)
    context.lineCap = 'round'
    let seed = 7
    const random = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
    }
    for (let i = 0; i < 1400; i++) {
        const x = random() * size
        const y = random() * size
        const angle = -Math.PI / 2 + (random() - 0.5) * 1.1
        const length = 3 + random() * 5
        context.strokeStyle = random() < 0.55 ? 'rgba(255,255,255,0.9)' : 'rgba(120,120,120,0.55)'
        context.lineWidth = 1.4 + random() * 1.2
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
        context.stroke()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    texture.anisotropy = 4
    return texture
}

function letterTexture(letter: string) {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')!
    context.font = '900 52px ui-sans-serif, system-ui, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineWidth = 8
    context.strokeStyle = '#ffffff'
    context.strokeText(letter, size / 2, size / 2 + 2)
    context.fillStyle = FOREST_PALETTE.ink
    context.fillText(letter, size / 2, size / 2 + 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

// Small round badge floating over a grove's person, readable at any zoom:
// a water drop while the computer is planting, "z" while it rests.
function badgeTexture(state: 'working' | 'sleeping') {
    const size = 96
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')!
    context.fillStyle = state === 'working' ? '#5FA34A' : '#C9D2E3'
    context.strokeStyle = FOREST_PALETTE.ink
    context.lineWidth = 6
    context.beginPath()
    context.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    if (state === 'working') {
        context.fillStyle = '#ffffff'
        context.beginPath()
        context.moveTo(size / 2, size * 0.2)
        context.bezierCurveTo(size * 0.72, size * 0.46, size * 0.72, size * 0.74, size / 2, size * 0.76)
        context.bezierCurveTo(size * 0.28, size * 0.74, size * 0.28, size * 0.46, size / 2, size * 0.2)
        context.fill()
    } else {
        context.fillStyle = FOREST_PALETTE.ink
        context.font = '900 46px ui-sans-serif, system-ui, sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('z', size / 2 + 2, size / 2 + 1)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

function plusTexture() {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')!
    context.fillStyle = FOREST_PALETTE.invite
    context.strokeStyle = FOREST_PALETTE.ink
    context.lineWidth = 8
    context.beginPath()
    context.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2)
    context.fill()
    context.stroke()
    context.lineWidth = 10
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(size * 0.3, size / 2)
    context.lineTo(size * 0.7, size / 2)
    context.moveTo(size / 2, size * 0.3)
    context.lineTo(size / 2, size * 0.7)
    context.stroke()
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

// Unit crowns (1 wide, 1 tall, centred on the origin), scaled per tree.
function crownGeometry(shape: TreeShape) {
    switch (shape) {
        case 'cone':
            return new THREE.ConeGeometry(0.5, 1, 12)
        case 'column': {
            const geometry = new THREE.CapsuleGeometry(0.5, 1.2, 6, 14)
            geometry.scale(1, 1 / 2.2, 1)
            return geometry
        }
        case 'drop': {
            const profile: THREE.Vector2[] = []
            for (let i = 0; i <= 16; i++) {
                const u = i / 16
                const radius = 0.54 * Math.sqrt(Math.sin(Math.PI * u)) * (1 - 0.55 * u * u)
                profile.push(new THREE.Vector2(Math.max(0.001, radius), u - 0.5))
            }
            return new THREE.LatheGeometry(profile, 16)
        }
        default:
            return new THREE.SphereGeometry(0.5, 18, 12)
    }
}

type GrowingInstance = {
    mesh: THREE.InstancedMesh
    index: number
    position: THREE.Vector3
    quaternion: THREE.Quaternion
    scale: THREE.Vector3
    delay: number
}

export function mountForest3D(container: HTMLElement, input: ForestSceneInput, options: Forest3DOptions = {}): Forest3DHandle {
    const world = buildForestWorld({ detail: 'full', ...input })
    const reducedMotion = Boolean(options.reducedMotion)
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
    const plotsInteractive = Boolean(options.onPlotClick)

    // --- Renderer, scene, camera ------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    // No tone mapping: keep the palette as flat and bright as the 2D view.
    renderer.toneMapping = THREE.NoToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.touchAction = coarsePointer ? 'pan-y' : 'none'
    renderer.domElement.style.outline = 'none'
    container.appendChild(renderer.domElement)

    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'
    container.appendChild(overlay)

    const tooltip = document.createElement('div')
    tooltip.style.cssText = `position:absolute;left:0;top:0;padding:4px 8px;background:#fff;border:2px solid ${FOREST_PALETTE.ink};color:${FOREST_PALETTE.ink};font:700 12px/1.3 ui-sans-serif,system-ui,sans-serif;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s`
    overlay.appendChild(tooltip)

    const scene = new THREE.Scene()
    let extent = 0
    for (const island of world.islands) {
        extent = Math.max(extent, Math.hypot(island.center.x, island.center.y) + island.radius * 1.25)
    }
    extent = Math.max(extent, world.mainRadius * 1.35)

    const camera = new THREE.PerspectiveCamera(32, 1, 1, extent * 14)
    // Home view: orbit around the main grove's axis. fitHome() picks the
    // height and distance so every grove stays in frame as it rotates.
    const homeTarget = new THREE.Vector3(0, 0, 0)
    let homeDistance = extent * 3

    // Points that bound what has to stay in view: each grove's outline at
    // ground level and at tree-top height.
    const framePoints: THREE.Vector3[] = []
    for (const island of world.islands) {
        const base = island.terraces[0]
        const tallest = island.trees.reduce((max, tree) => {
            const { height, stem } = treeDimensions(tree.shape, tree.size)
            return Math.max(max, height + stem)
        }, 0)
        const step = Math.max(1, Math.floor(base.outline.length / 24))
        for (let i = 0; i < base.outline.length; i += step) {
            const [x, y] = base.outline[i]
            framePoints.push(toVector(x, y, -island.levelHeight), toVector(x, y, tallest + 1))
        }
    }

    // Daylight: soft sky fill plus a warm sun casting gentle shadows.
    scene.add(new THREE.HemisphereLight('#ffffff', '#b3c28e', 1.75))
    const sun = new THREE.DirectionalLight('#fff3d6', 1.5)
    sun.position.set(-extent * 0.7, extent * 1.8, extent * 0.9)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -extent * 1.2
    sun.shadow.camera.right = extent * 1.2
    sun.shadow.camera.top = extent * 1.2
    sun.shadow.camera.bottom = -extent * 1.2
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = extent * 5
    sun.shadow.bias = -0.0006
    sun.shadow.normalBias = 0.5
    scene.add(sun)

    const disposables: Array<{ dispose: () => void }> = []
    const track = <T extends { dispose: () => void }>(item: T) => {
        disposables.push(item)
        return item
    }

    // --- Ground -------------------------------------------------------------
    // Invisible except for the shadows it catches, so the scene sits on the
    // page's own background colour.
    const groundLevel = -2
    const ground = new THREE.Mesh(
        track(new THREE.PlaneGeometry(extent * 8, extent * 8)),
        track(new THREE.ShadowMaterial({ color: '#233018', opacity: 0.2 }))
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = groundLevel - 0.02
    ground.receiveShadow = true
    scene.add(ground)

    // --- Shared materials and geometry -----------------------------------------
    const foliageMap = track(foliageTexture())
    const foliageMaterial = track(new THREE.MeshStandardMaterial({ color: '#ffffff', map: foliageMap, roughness: 0.9 }))
    const inviteMaterial = track(new THREE.MeshStandardMaterial({
        color: '#ffffff',
        map: foliageMap,
        roughness: 0.7,
        emissive: FOREST_PALETTE.invite,
        emissiveIntensity: 0.22,
    }))
    const trunkMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.trunk, roughness: 1 }))
    const crowns = new Map(TREE_SHAPES.map(shape => [shape, track(crownGeometry(shape))]))
    const trunkGeometry = track(new THREE.CylinderGeometry(0.5, 0.65, 1, 7))
    trunkGeometry.translate(0, 0.5, 0)
    const bushGeometry = track(new THREE.SphereGeometry(0.5, 12, 8))
    const ringGeometry = track(new THREE.RingGeometry(1, 1.16, 48))
    ringGeometry.rotateX(-Math.PI / 2)
    const plusMap = track(plusTexture())
    // People: walkers on the paths and each grove's keeper.
    const walkerBody = track(new THREE.CapsuleGeometry(0.9, 2.2, 4, 8))
    const walkerHead = track(new THREE.SphereGeometry(1, 10, 8))
    const walkerBodyMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.ink, roughness: 0.8 }))
    const walkerHeadMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.invite, roughness: 0.6 }))
    const zMap = track(letterTexture('Z'))
    const badgeMaterials = {
        working: track(new THREE.SpriteMaterial({ map: track(badgeTexture('working')), sizeAttenuation: false, depthTest: false, depthWrite: false })),
        sleeping: track(new THREE.SpriteMaterial({ map: track(badgeTexture('sleeping')), sizeAttenuation: false, depthTest: false, depthWrite: false })),
    }
    const pillowGeometry = track(new THREE.BoxGeometry(1.9, 0.7, 1.5))
    const blanketGeometry = track(new THREE.BoxGeometry(3.4, 0.9, 2.2))
    const canGeometry = track(new THREE.CylinderGeometry(0.75, 0.85, 1.4, 12))
    const spoutGeometry = track(new THREE.CylinderGeometry(0.14, 0.2, 1.8, 6))
    const dropGeometry = track(new THREE.SphereGeometry(0.24, 6, 5))
    const pillowMaterial = track(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }))
    const blanketMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.friend[5], roughness: 0.9 }))
    const canMaterial = track(new THREE.MeshStandardMaterial({ color: CAN, roughness: 0.5, metalness: 0.2 }))
    const dropMaterial = track(new THREE.MeshStandardMaterial({ color: WATER, roughness: 0.2, emissive: WATER, emissiveIntensity: 0.3 }))

    // Clearings, plots and the plots' floating "+" markers.
    const pickables: THREE.Object3D[] = []
    const growing: GrowingInstance[] = []
    const pulses: Array<{ mesh: THREE.Mesh; phase: number }> = []
    const bobs: Array<{ sprite: THREE.Sprite; base: number; phase: number }> = []
    const labels: Array<{ element: HTMLDivElement; anchor: THREE.Vector3 }> = []
    const workers: Array<{ body: THREE.Group; can: THREE.Group; drops: THREE.Mesh[]; phase: number }> = []
    const sleepers: Array<{ blanket: THREE.Mesh; letters: THREE.Sprite[]; phase: number }> = []
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()
    const upAxis = new THREE.Vector3(0, 1, 0)

    const addLabel = (text: string, anchor: THREE.Vector3, highlight: boolean, onClick?: () => void) => {
        const element = document.createElement('div')
        element.textContent = text
        element.style.cssText = `position:absolute;left:0;top:0;transform:translate(-50%,-100%);padding:2px 7px;background:${highlight ? FOREST_PALETTE.invite : 'rgba(255,255,255,.88)'};border:1.5px solid ${FOREST_PALETTE.ink};color:${FOREST_PALETTE.ink};font:800 11px/1.3 ui-sans-serif,system-ui,sans-serif;white-space:nowrap;will-change:transform`
        if (onClick) {
            // The plot's label works as a button too.
            element.setAttribute('role', 'button')
            element.tabIndex = 0
            element.style.pointerEvents = 'auto'
            element.style.cursor = 'pointer'
            element.addEventListener('click', event => {
                event.stopPropagation()
                onClick()
            })
            element.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onClick()
                }
            })
        }
        overlay.appendChild(element)
        labels.push({ element, anchor })
    }

    const clearingShape = (island: WorldIsland) =>
        new THREE.Shape(island.terraces[0].outline.map(([x, y]) => new THREE.Vector2(x, -y)))

    // The little person who looks after a grove: awake and watering while
    // that computer is planting, asleep (with drifting Zs) otherwise.
    const addCharacter = (character: NonNullable<WorldIsland['character']>, islandIndex: number, top: number, parent: THREE.Group) => {
        const person = new THREE.Group()
        person.position.copy(toVector(character.x, character.y, 0)).setY(top)
        person.scale.setScalar(2.3)
        const phase = jitter(islandIndex, 41) * Math.PI * 2
        const pickable = (mesh: THREE.Mesh) => {
            mesh.castShadow = true
            mesh.userData = { islandIndex }
            pickables.push(mesh)
            return mesh
        }

        if (character.state === 'working') {
            const body = new THREE.Group()
            const torso = pickable(new THREE.Mesh(walkerBody, walkerBodyMaterial))
            torso.position.y = 2
            const head = pickable(new THREE.Mesh(walkerHead, walkerHeadMaterial))
            head.position.y = 4.6
            body.add(torso, head)

            // Watering can held out to the side, tipping to pour.
            const can = new THREE.Group()
            can.position.set(1.3, 2.9, 0.5)
            const tank = pickable(new THREE.Mesh(canGeometry, canMaterial))
            tank.position.set(0.9, -0.4, 0)
            const spout = new THREE.Mesh(spoutGeometry, canMaterial)
            spout.position.set(2.1, -0.1, 0)
            spout.rotation.z = -1.05
            can.add(tank, spout)
            body.add(can)

            const drops = [0, 1, 2].map(() => {
                const drop = new THREE.Mesh(dropGeometry, dropMaterial)
                drop.visible = !reducedMotion
                person.add(drop)
                return drop
            })
            person.add(body)
            person.rotation.y = -0.45
            workers.push({ body, can, drops, phase })
        } else {
            // Lying down on a pillow under a blanket.
            const pillow = pickable(new THREE.Mesh(pillowGeometry, pillowMaterial))
            pillow.position.set(-2.2, 0.35, 0)
            const head = pickable(new THREE.Mesh(walkerHead, walkerHeadMaterial))
            head.position.set(-2.1, 1.55, 0)
            const blanket = pickable(new THREE.Mesh(blanketGeometry, blanketMaterial))
            blanket.position.set(0.6, 0.5, 0)
            person.add(pillow, head, blanket)
            person.rotation.y = 0.3

            const letters = [0, 1, 2].map(index => {
                const sprite = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: zMap, transparent: true, depthWrite: false })))
                sprite.position.set(-1.6 + index * 0.9, 3 + index * 1.6, 0)
                sprite.scale.setScalar(1.4 + index * 0.5)
                person.add(sprite)
                return sprite
            })
            sleepers.push({ blanket, letters, phase })
        }

        const badge = new THREE.Sprite(badgeMaterials[character.state])
        badge.position.copy(toVector(character.x, character.y, 0)).setY(top + 15)
        badge.scale.setScalar(0.042)
        badge.renderOrder = 10
        parent.add(person, badge)
    }

    let plotLabelShown = false
    const addGrove = (island: WorldIsland, islandIndex: number) => {
        const group = new THREE.Group()

        if (island.kind === 'plot') {
            // An empty, dashed plot waiting for the next friend.
            const geometry = track(new THREE.ShapeGeometry(clearingShape(island)))
            geometry.rotateX(-Math.PI / 2)
            const plot = new THREE.Mesh(geometry, track(new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.28, depthWrite: false })))
            plot.position.y = groundLevel + 0.05
            plot.userData = { islandIndex }
            pickables.push(plot)
            group.add(plot)

            const edge = new THREE.LineLoop(
                track(new THREE.BufferGeometry().setFromPoints(island.terraces[0].outline.map(([x, y]) => toVector(x, y, groundLevel + 0.1)))),
                track(new THREE.LineDashedMaterial({ color: FOREST_PALETTE.plotEdge, dashSize: 3, gapSize: 3 }))
            )
            edge.computeLineDistances()
            group.add(edge)

            const plus = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: plusMap, depthWrite: false })))
            const base = groundLevel + 7
            plus.position.copy(toVector(island.center.x, island.center.y, base))
            plus.scale.setScalar(11)
            plus.userData = { islandIndex }
            if (plotsInteractive) pickables.push(plus)
            group.add(plus)
            bobs.push({ sprite: plus, base, phase: jitter(islandIndex, 9) * Math.PI * 2 })

            if (plotsInteractive && options.plotLabel && !plotLabelShown) {
                plotLabelShown = true
                addLabel(options.plotLabel, toVector(island.center.x, island.center.y, base + 7), true, options.onPlotClick)
            }
            scene.add(group)
            return
        }

        // A raised meadow clearing for the grove.
        const geometry = track(new THREE.ExtrudeGeometry(clearingShape(island), {
            depth: island.levelHeight,
            bevelEnabled: true,
            bevelThickness: 0.6,
            bevelSize: 0.8,
            bevelSegments: 2,
            curveSegments: 1,
        }))
        geometry.rotateX(-Math.PI / 2)
        geometry.translate(0, groundLevel, 0)
        const clearing = new THREE.Mesh(geometry, track(new THREE.MeshStandardMaterial({
            color: island.kind === 'main' ? FOREST_PALETTE.clearing : FOREST_PALETTE.friendClearing,
            roughness: 1,
        })))
        clearing.receiveShadow = true
        clearing.userData = { islandIndex }
        pickables.push(clearing)
        group.add(clearing)

        const top = groundLevel + island.levelHeight + 0.6
        const centre = island.center

        // Trees, one instanced mesh per crown shape (and one for invite trees).
        const buckets = new Map<string, typeof island.trees>()
        for (const tree of island.trees) {
            const key = tree.kind === 'invite' ? 'invite' : tree.shape
            const bucket = buckets.get(key)
            if (bucket) bucket.push(tree)
            else buckets.set(key, [tree])
        }
        const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, Math.max(1, island.trees.length))
        trunks.count = island.trees.length
        trunks.castShadow = true
        let trunkIndex = 0

        buckets.forEach((trees, key) => {
            const shape: TreeShape = key === 'invite' ? 'round' : (key as TreeShape)
            const mesh = new THREE.InstancedMesh(crowns.get(shape)!, key === 'invite' ? inviteMaterial : foliageMaterial, trees.length)
            mesh.castShadow = true
            mesh.receiveShadow = true
            trees.forEach((tree, index) => {
                const { width, height, stem } = treeDimensions(tree.shape, tree.size)
                const spin = new THREE.Quaternion().setFromAxisAngle(upAxis, jitter(index, islandIndex + 3) * Math.PI * 2)
                const position = toVector(tree.x, tree.y, top + stem + height / 2)
                const scale = new THREE.Vector3(width, height, width)
                // Trees grow in from the grove's heart outwards.
                const delay = Math.min(1.6, Math.hypot(tree.x - centre.x, tree.y - centre.y) / (island.radius * 1.4) + (island.kind === 'main' ? 0 : 0.5))
                matrix.compose(position, spin, scale)
                mesh.setMatrixAt(index, matrix)
                mesh.setColorAt(index, color.set(treeColor(tree.kind, tree.tone)))
                growing.push({ mesh, index, position, quaternion: spin, scale, delay })

                const trunkHeight = stem + height * 0.35
                const trunkPosition = toVector(tree.x, tree.y, top - 0.2)
                const trunkScale = new THREE.Vector3(Math.max(0.9, width * 0.12), trunkHeight, Math.max(0.9, width * 0.12))
                matrix.compose(trunkPosition, spin, trunkScale)
                trunks.setMatrixAt(trunkIndex, matrix)
                growing.push({ mesh: trunks, index: trunkIndex, position: trunkPosition, quaternion: spin, scale: trunkScale, delay })
                trunkIndex += 1

                if (tree.kind === 'invite' && pulses.length < 40) {
                    const ring = new THREE.Mesh(ringGeometry, track(new THREE.MeshBasicMaterial({
                        color: FOREST_PALETTE.invite,
                        transparent: true,
                        opacity: 0.8,
                        depthWrite: false,
                    })))
                    ring.position.copy(toVector(tree.x, tree.y, top + 0.15))
                    ring.scale.setScalar(width * 0.85)
                    group.add(ring)
                    pulses.push({ mesh: ring, phase: jitter(index, 3) })
                }
            })
            mesh.instanceMatrix.needsUpdate = true
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
            group.add(mesh)
        })
        if (island.trees.length > 0) {
            trunks.instanceMatrix.needsUpdate = true
            group.add(trunks)
        }

        // Low bushes filling the grove between trees.
        if (island.bushes.length > 0) {
            const bushes = new THREE.InstancedMesh(bushGeometry, foliageMaterial, island.bushes.length)
            bushes.castShadow = true
            bushes.receiveShadow = true
            island.bushes.forEach((bush, index) => {
                const position = toVector(bush.x, bush.y, top + bush.size * 0.45)
                const scale = new THREE.Vector3(bush.size * 2.6, bush.size * 1.7, bush.size * 2.6)
                const spin = new THREE.Quaternion().setFromAxisAngle(upAxis, jitter(index, 17) * Math.PI)
                matrix.compose(position, spin, scale)
                bushes.setMatrixAt(index, matrix)
                bushes.setColorAt(index, color.set(treeColor(island.kind === 'main' ? 'own' : 'friend', bush.tone)))
                growing.push({ mesh: bushes, index, position, quaternion: spin, scale, delay: 0.2 + jitter(index, 21) * 0.8 })
            })
            bushes.instanceMatrix.needsUpdate = true
            if (bushes.instanceColor) bushes.instanceColor.needsUpdate = true
            group.add(bushes)
        }

        // A sapling marks a grove that is waiting for its first tree.
        if (island.sprout) {
            const stemMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.sprout, roughness: 0.6 }))
            const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.35, 0.45, 7, 6)), stemMaterial)
            const base = toVector(island.sprout.x, island.sprout.y, top)
            stem.position.copy(base).add(new THREE.Vector3(0, 3.5, 0))
            stem.castShadow = true
            group.add(stem)
            const leafGeometry = track(new THREE.SphereGeometry(1, 12, 8))
            for (const side of [-1, 1]) {
                const leaf = new THREE.Mesh(leafGeometry, stemMaterial)
                leaf.scale.set(2.6, 0.7, 1.3)
                leaf.position.copy(base).add(new THREE.Vector3(side * 2.4, 6.8 + (side > 0 ? 0.8 : 0), 0))
                leaf.rotation.z = side * -0.45
                leaf.castShadow = true
                group.add(leaf)
            }
        }

        if (island.character) addCharacter(island.character, islandIndex, top, group)

        if (island.label) {
            const tallest = island.trees.reduce((max, tree) => {
                const { height, stem } = treeDimensions(tree.shape, tree.size)
                return Math.max(max, height + stem)
            }, 8)
            addLabel(island.label, toVector(centre.x, centre.y, top + tallest + 4), false)
        }

        scene.add(group)
    }

    world.islands.forEach(addGrove)

    // --- Paths between groves -----------------------------------------------
    const ribbon = (points: THREE.Vector3[], width: number, y: number) => {
        const positions: number[] = []
        const indices: number[] = []
        points.forEach((point, index) => {
            const previous = points[Math.max(0, index - 1)]
            const next = points[Math.min(points.length - 1, index + 1)]
            const dx = next.x - previous.x
            const dz = next.z - previous.z
            const length = Math.hypot(dx, dz) || 1
            const nx = (-dz / length) * (width / 2)
            const nz = (dx / length) * (width / 2)
            positions.push(point.x + nx, y, point.z + nz, point.x - nx, y, point.z - nz)
            if (index > 0) {
                const a = (index - 1) * 2
                indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
            }
        })
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()
        return track(geometry)
    }
    const pathMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.path, roughness: 1, side: THREE.DoubleSide }))
    const pathEdgeMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_PALETTE.pathEdge, roughness: 1, side: THREE.DoubleSide }))
    const walkers: Array<{ group: THREE.Group; curve: THREE.QuadraticBezierCurve3; offset: number; speed: number }> = []

    const presenceShown = world.islands.some(island => island.character)
    world.roots.forEach((root, rootIndex) => {
        const curve = new THREE.QuadraticBezierCurve3(
            toVector(root.start[0], root.start[1], 0),
            toVector(root.control[0], root.control[1], 0),
            toVector(root.end[0], root.end[1], 0)
        )
        const points = curve.getPoints(40)
        if (root.planned) {
            // Stepping stones towards an empty plot.
            const stone = track(new THREE.CircleGeometry(1, 10))
            stone.rotateX(-Math.PI / 2)
            for (let i = 2; i < points.length - 1; i += 3) {
                const mesh = new THREE.Mesh(stone, pathEdgeMaterial)
                mesh.position.set(points[i].x, groundLevel + 0.04, points[i].z)
                mesh.scale.setScalar(1.3)
                scene.add(mesh)
            }
            return
        }
        const edge = new THREE.Mesh(ribbon(points, 11, groundLevel + 0.03), pathEdgeMaterial)
        const path = new THREE.Mesh(ribbon(points, 8, groundLevel + 0.06), pathMaterial)
        edge.receiveShadow = true
        path.receiveShadow = true
        scene.add(edge, path)

        // A tiny visitor walking between the groves. Left out when groves
        // have their own people, so walking is never mistaken for a status.
        if (presenceShown) return
        const walker = new THREE.Group()
        const body = new THREE.Mesh(walkerBody, walkerBodyMaterial)
        body.position.y = 2
        const head = new THREE.Mesh(walkerHead, walkerHeadMaterial)
        head.position.y = 4.6
        body.castShadow = true
        head.castShadow = true
        walker.add(body, head)
        walker.scale.setScalar(1.5)
        walker.position.y = groundLevel
        scene.add(walker)
        walkers.push({ group: walker, curve, offset: jitter(rootIndex, 13), speed: 0.035 + jitter(rootIndex, 29) * 0.02 })
    })

    // --- Controls ---------------------------------------------------------
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.enableZoom = false
    controls.rotateSpeed = 0.6
    controls.zoomSpeed = 0.8
    controls.minPolarAngle = 0.12
    controls.maxPolarAngle = Math.PI * 0.42
    // No auto-rotation: the camera stays framed on the forest; walkers and
    // pulsing invite rings keep it alive.
    controls.autoRotate = false
    if (coarsePointer) controls.enabled = false
    // OrbitControls sets touch-action:none; keep page scrolling on touch until activated.
    renderer.domElement.style.touchAction = coarsePointer ? 'pan-y' : 'none'

    let active = false
    const setActive = (next: boolean) => {
        if (active === next) return
        active = next
        controls.enableZoom = next
        if (coarsePointer) {
            controls.enabled = next
            renderer.domElement.style.touchAction = next ? 'none' : 'pan-y'
        }
        options.onActiveChange?.(next)
    }


    // --- Camera fitting and fly-to ----------------------------------------
    const size = new THREE.Vector2()
    const probe = new THREE.PerspectiveCamera(camera.fov, 1, 1, extent * 40)
    const projected = new THREE.Vector3()
    // The home view faces one way; allow a little turning without clipping.
    const FIT_AZIMUTHS = [-0.25, 0, 0.25]
    // Screen share the scene may fill, leaving room for the zoom buttons
    // and the hint line.
    const FILL_X = 0.88
    const FILL_Y = 0.84

    // Projected bounds (NDC) of the frame points around the home direction.
    const projectedBounds = (targetY: number, distance: number) => {
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
        for (const azimuth of FIT_AZIMUTHS) {
            probe.position.set(
                Math.sin(azimuth) * Math.cos(ELEVATION) * distance,
                targetY + Math.sin(ELEVATION) * distance,
                Math.cos(azimuth) * Math.cos(ELEVATION) * distance
            )
            probe.lookAt(0, targetY, 0)
            probe.updateMatrixWorld()
            for (const point of framePoints) {
                projected.copy(point).project(probe)
                bounds.minX = Math.min(bounds.minX, projected.x)
                bounds.maxX = Math.max(bounds.maxX, projected.x)
                bounds.minY = Math.min(bounds.minY, projected.y)
                bounds.maxY = Math.max(bounds.maxY, projected.y)
            }
        }
        return bounds
    }

    const fitHome = () => {
        probe.aspect = Math.max(0.5, size.x / Math.max(1, size.y))
        probe.updateProjectionMatrix()
        const halfTan = Math.tan(THREE.MathUtils.degToRad(probe.fov) / 2)

        let targetY = 0
        let distance = extent * 3
        for (let i = 0; i < 8; i++) {
            const bounds = projectedBounds(targetY, distance)
            // Centre vertically, then scale the distance to fill the frame.
            targetY += ((bounds.minY + bounds.maxY) / 2) * distance * halfTan / Math.cos(ELEVATION)
            const scale = Math.max((bounds.maxX - bounds.minX) / (2 * FILL_X), (bounds.maxY - bounds.minY) / (2 * FILL_Y))
            distance *= Math.min(2, Math.max(0.5, scale))
        }

        homeTarget.set(0, targetY, 0)
        homeDistance = Math.max(distance, world.mainRadius * 1.2)
        controls.minDistance = world.mainRadius * 0.5
        controls.maxDistance = homeDistance * 1.6
    }

    const homePosition = () => new THREE.Vector3(
        0,
        homeTarget.y + Math.sin(ELEVATION) * homeDistance,
        Math.cos(ELEVATION) * homeDistance
    )

    let flight: { from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number; duration: number } | null = null
    let focused: string | null = null
    const flyTo = (position: THREE.Vector3, target: THREE.Vector3) => {
        if (reducedMotion) {
            camera.position.copy(position)
            controls.target.copy(target)
            return
        }
        flight = {
            from: camera.position.clone(),
            to: position,
            fromTarget: controls.target.clone(),
            toTarget: target,
            start: performance.now(),
            duration: 1100,
        }
    }

    const focusIsland = (islandIndex: number) => {
        const island = world.islands[islandIndex]
        if (!island) return
        if (island.kind === 'plot') {
            if (plotsInteractive) options.onPlotClick?.()
            return
        }
        if (island.kind === 'main') {
            reset()
            return
        }
        const target = toVector(island.center.x, island.center.y, groundLevel + 4)
        const outward = new THREE.Vector3(island.center.x, 0, island.center.y).normalize()
        const distance = Math.max(island.radius * 5, 110)
        const position = target.clone()
            .add(outward.multiplyScalar(distance * Math.cos(ELEVATION - 0.2)))
            .add(new THREE.Vector3(0, distance * Math.sin(ELEVATION - 0.2), 0))
        focused = island.title
        options.onFocusChange?.(focused)
        flyTo(position, target)
    }

    const reset = () => {
        focused = null
        options.onFocusChange?.(null)
        flyTo(homePosition(), homeTarget.clone())
    }

    const zoomBy = (factor: number) => {
        const offset = camera.position.clone().sub(controls.target)
        const length = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)
        flyTo(controls.target.clone().add(offset.setLength(length)), controls.target.clone())
    }

    // --- Pointer: hover tooltip, click to visit, activation ----------------
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let downAt: { x: number; y: number } | null = null

    const pick = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect()
        pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
        raycaster.setFromCamera(pointer, camera)
        const hit = raycaster.intersectObjects(pickables, false)[0]
        return hit ? (hit.object.userData.islandIndex as number) : null
    }

    const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        const islandIndex = pick(event)
        const rect = container.getBoundingClientRect()
        if (islandIndex === null) {
            tooltip.style.opacity = '0'
            renderer.domElement.style.cursor = 'grab'
            return
        }
        const island = world.islands[islandIndex]
        const own = world.islands[0]?.character
        const mainTitle = `${options.mainTitle || 'Your forest'}${own ? (own.state === 'working' ? ', planting right now' : ', computer resting') : ''}`
        tooltip.textContent = island.kind === 'main'
            ? (focused ? `${mainTitle} · click to go back` : mainTitle)
            : island.kind === 'plot'
                ? (plotsInteractive ? `${options.plotLabel || 'Invite a friend'} · click` : 'Room for the next friend')
                : focused === island.title ? island.title : `${island.title} · click to visit`
        tooltip.style.transform = `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`
        tooltip.style.opacity = '1'
        renderer.domElement.style.cursor = island.kind === 'friend' || (island.kind === 'plot' && plotsInteractive) ? 'pointer' : 'grab'
    }

    const onPointerDown = (event: PointerEvent) => {
        downAt = { x: event.clientX, y: event.clientY }
        setActive(true)
    }

    const onPointerUp = (event: PointerEvent) => {
        if (!downAt) return
        const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y)
        downAt = null
        if (moved > 6) return
        const islandIndex = pick(event)
        if (islandIndex !== null) focusIsland(islandIndex)
    }

    const onPointerLeave = (event: PointerEvent) => {
        tooltip.style.opacity = '0'
        if (event.pointerType === 'mouse') setActive(false)
    }

    const onDocumentPointerDown = (event: PointerEvent) => {
        if (!container.contains(event.target as Node)) setActive(false)
    }

    const onDoubleClick = () => reset()

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointerleave', onPointerLeave)
    renderer.domElement.addEventListener('dblclick', onDoubleClick)
    document.addEventListener('pointerdown', onDocumentPointerDown)

    // --- Sizing, visibility and the render loop ----------------------------
    const resize = () => {
        const width = container.clientWidth
        const height = container.clientHeight
        if (!width || !height) return
        size.set(width, height)
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        const wasHome = !focused && !flight
        fitHome()
        if (wasHome) {
            camera.position.copy(homePosition())
            controls.target.copy(homeTarget)
        }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()
    camera.position.copy(homePosition())
    controls.target.copy(homeTarget)
    controls.update()

    let visible = true
    const intersectionObserver = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting)
        if (visible) schedule()
    })
    intersectionObserver.observe(container)
    const onVisibility = () => {
        if (!document.hidden) schedule()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const clock = new THREE.Clock()
    const scratchScale = new THREE.Vector3()
    const labelPosition = new THREE.Vector3()
    const walkerNext = new THREE.Vector3()
    let growthDone = reducedMotion
    let frame = 0
    let disposed = false

    if (!reducedMotion) {
        // Start every tree at zero height; they grow in on the first frames.
        for (const item of growing) {
            matrix.compose(item.position, item.quaternion, scratchScale.set(0.0001, 0.0001, 0.0001))
            item.mesh.setMatrixAt(item.index, matrix)
        }
        new Set(growing.map(item => item.mesh)).forEach(mesh => { mesh.instanceMatrix.needsUpdate = true })
    }

    const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    const placeWalker = (walker: (typeof walkers)[number], elapsed: number) => {
        // Walk out and back along the path.
        const cycle = (elapsed * walker.speed + walker.offset) % 2
        const t = 0.08 + 0.84 * (cycle < 1 ? cycle : 2 - cycle)
        const point = walker.curve.getPoint(t)
        walker.curve.getPoint(Math.min(1, Math.max(0, t + (cycle < 1 ? 0.01 : -0.01))), walkerNext)
        walker.group.position.set(point.x, groundLevel + Math.abs(Math.sin(elapsed * 9 + walker.offset * 10)) * 0.5, point.z)
        walker.group.rotation.y = Math.atan2(walkerNext.x - point.x, walkerNext.z - point.z)
    }
    walkers.forEach(walker => placeWalker(walker, 0))

    const animateWorker = (worker: (typeof workers)[number], elapsed: number) => {
        const t = elapsed + worker.phase
        worker.body.position.y = Math.abs(Math.sin(t * 2.4)) * 0.25
        // Tip the can forward, pour for a moment, tip back.
        const pour = Math.max(0, Math.sin(t * 1.3))
        worker.can.rotation.z = -0.15 - pour * 0.55
        worker.drops.forEach((drop, index) => {
            const k = (t * 1.4 + index / 3) % 1
            drop.visible = pour > 0.35
            drop.position.set(3.5 + k * 0.4, 2.2 - k * 2.1 + worker.body.position.y, 0.5)
        })
    }

    const animateSleeper = (sleeper: (typeof sleepers)[number], elapsed: number) => {
        const t = elapsed + sleeper.phase
        sleeper.blanket.scale.y = 1 + Math.sin(t * 1.5) * 0.12
        sleeper.letters.forEach((letter, index) => {
            const k = (t / 3.2 + index / 3) % 1
            letter.position.set(-1.8 + k * 2.2, 2.6 + k * 5, 0)
            letter.scale.setScalar(1.1 + k * 1.6)
            ;(letter.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI)
        })
    }
    workers.forEach(worker => animateWorker(worker, 1.2))
    sleepers.forEach(sleeper => animateSleeper(sleeper, 0))

    const render = () => {
        frame = 0
        if (disposed || !visible || document.hidden) return
        const elapsed = clock.getElapsedTime()

        if (!growthDone) {
            let pending = false
            const touched = new Set<THREE.InstancedMesh>()
            for (const item of growing) {
                const t = THREE.MathUtils.clamp((elapsed - item.delay) / 0.7, 0, 1)
                if (t < 1) pending = true
                const k = Math.max(0.0001, easeOutBack(t))
                matrix.compose(item.position, item.quaternion, scratchScale.copy(item.scale).multiplyScalar(k))
                item.mesh.setMatrixAt(item.index, matrix)
                touched.add(item.mesh)
            }
            touched.forEach(mesh => { mesh.instanceMatrix.needsUpdate = true })
            growthDone = !pending
        }

        if (!reducedMotion) {
            for (const pulse of pulses) {
                const t = (elapsed / 2.8 + pulse.phase) % 1
                const base = pulse.mesh.userData.baseScale ?? (pulse.mesh.userData.baseScale = pulse.mesh.scale.x)
                pulse.mesh.scale.setScalar(base * (0.6 + t * 0.9))
                ;(pulse.mesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - t)
            }
            for (const bob of bobs) {
                bob.sprite.position.y = bob.base + Math.sin(elapsed * 2 + bob.phase) * 1.2
            }
            for (const walker of walkers) placeWalker(walker, elapsed)
            for (const worker of workers) animateWorker(worker, elapsed)
            for (const sleeper of sleepers) animateSleeper(sleeper, elapsed)
        }

        if (flight) {
            const t = Math.min(1, (performance.now() - flight.start) / flight.duration)
            const k = easeInOut(t)
            camera.position.lerpVectors(flight.from, flight.to, k)
            controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k)
            if (t >= 1) flight = null
        }

        controls.update()
        renderer.render(scene, camera)

        for (const label of labels) {
            labelPosition.copy(label.anchor).project(camera)
            const hidden = labelPosition.z > 1
            label.element.style.display = hidden ? 'none' : 'block'
            if (!hidden) {
                label.element.style.transform = `translate(${((labelPosition.x + 1) / 2) * size.x}px, ${((1 - labelPosition.y) / 2) * size.y}px) translate(-50%, -100%)`
            }
        }

        schedule()
    }

    function schedule() {
        if (!frame && !disposed) frame = requestAnimationFrame(render)
    }
    schedule()

    const dispose = () => {
        if (disposed) return
        disposed = true
        cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        document.removeEventListener('visibilitychange', onVisibility)
        document.removeEventListener('pointerdown', onDocumentPointerDown)
        renderer.domElement.removeEventListener('pointermove', onPointerMove)
        renderer.domElement.removeEventListener('pointerdown', onPointerDown)
        renderer.domElement.removeEventListener('pointerup', onPointerUp)
        renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
        renderer.domElement.removeEventListener('dblclick', onDoubleClick)
        controls.dispose()
        scene.traverse(object => {
            if (object instanceof THREE.InstancedMesh) object.dispose()
        })
        for (const item of disposables) item.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
        renderer.domElement.remove()
        overlay.remove()
    }

    return { zoomBy, reset, setActive, dispose }
}
