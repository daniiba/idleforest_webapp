// Interactive 3D version of the forest island (three.js).
//
// Uses the same world model as the SVG renderer (buildForestWorld), so both
// show the same island, trees and friends. Framework-agnostic: call
// mountForest3D(container, input) and keep the returned handle to control or
// dispose it. Loaded lazily by the UI, so three.js only ships to pages that
// show a forest.
//
// Interaction model (kept friendly to page scrolling):
//   * mouse: drag rotates at any time; the wheel only zooms after the scene
//     has been clicked (until the pointer leaves it)
//   * touch: one tap "activates" the scene; until then touches scroll the page
//   * clicking a friend's island flies the camera to it; reset() flies back

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FOREST_COLORS, buildForestWorld, type ForestSceneInput, type WorldIsland } from './forest-scene'

export type Forest3DOptions = {
    reducedMotion?: boolean
    onActiveChange?: (active: boolean) => void
    onFocusChange?: (focusedIsland: string | null) => void
}

export type Forest3DHandle = {
    zoomBy: (factor: number) => void
    reset: () => void
    setActive: (active: boolean) => void
    dispose: () => void
}

const WATER_COLOR = '#2a4180'
const PAGE_COLOR = '#0B101F'
const TRUNK_COLOR = '#5b4636'
const ELEVATION = Math.asin(0.56) // matches the SVG projection's tilt

export function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas')
        return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
    } catch {
        return false
    }
}

function lerpHex(from: string, to: string, t: number) {
    return new THREE.Color(from).lerp(new THREE.Color(to), t)
}

// Deterministic per-instance jitter without another RNG stream.
function jitter(index: number, salt: number) {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
    return value - Math.floor(value)
}

function glowTexture() {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')!
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

// World (x, y horizontal, z up) -> three.js (y up).
function toVector(x: number, y: number, z: number) {
    return new THREE.Vector3(x, z, y)
}

type GrowingInstance = {
    mesh: THREE.InstancedMesh
    index: number
    position: THREE.Vector3
    quaternion: THREE.Quaternion
    scale: number
    delay: number
}

export function mountForest3D(container: HTMLElement, input: ForestSceneInput, options: Forest3DOptions = {}): Forest3DHandle {
    const world = buildForestWorld(input)
    const reducedMotion = Boolean(options.reducedMotion)
    const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false

    // --- Renderer, scene, camera ------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    // No tone mapping: keep the brand colours as flat and bright as the 2D view.
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
    tooltip.style.cssText = 'position:absolute;left:0;top:0;padding:4px 8px;background:rgba(11,16,31,.92);border:1px solid rgba(224,241,70,.6);color:#fff;font:700 12px/1.3 ui-sans-serif,system-ui,sans-serif;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s'
    overlay.appendChild(tooltip)

    const scene = new THREE.Scene()
    let extent = 0
    for (const island of world.islands) {
        extent = Math.max(extent, Math.hypot(island.center.x, island.center.y) + island.radius * 1.25)
    }
    extent = Math.max(extent, world.mainRadius * 1.35)
    scene.fog = new THREE.Fog(PAGE_COLOR, extent * 2.4, extent * 5)

    const camera = new THREE.PerspectiveCamera(32, 1, 1, extent * 12)
    // Home view: orbit around the main island's axis. fitHome() picks the
    // height and distance so every island stays in frame as it rotates.
    const homeTarget = new THREE.Vector3(0, 0, 0)
    let homeDistance = extent * 3

    // Points that bound what has to stay in view: each island's base outline
    // at its foot and at tree-top height.
    const framePoints: THREE.Vector3[] = []
    for (const island of world.islands) {
        const base = island.terraces[0]
        const top = island.terraces[island.terraces.length - 1]
        const tallest = island.trees.reduce((max, tree) => Math.max(max, tree.size), 0)
        const topZ = top.z + tallest * 2.9 + 1
        const step = Math.max(1, Math.floor(base.outline.length / 24))
        for (let i = 0; i < base.outline.length; i += step) {
            const [x, y] = base.outline[i]
            framePoints.push(toVector(x, y, base.z - island.levelHeight), toVector(x, y, topZ))
        }
    }

    const hemisphere = new THREE.HemisphereLight('#d6e0ff', '#1a2440', 1.6)
    scene.add(hemisphere)
    const sun = new THREE.DirectionalLight('#fff6e0', 1.9)
    sun.position.set(-extent * 0.9, extent * 1.6, extent * 1.1)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -extent
    sun.shadow.camera.right = extent
    sun.shadow.camera.top = extent
    sun.shadow.camera.bottom = -extent
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = extent * 5
    sun.shadow.bias = -0.0008
    sun.shadow.normalBias = 0.6
    scene.add(sun)
    const rim = new THREE.DirectionalLight('#e0f146', 0.35)
    rim.position.set(extent, extent * 0.4, -extent)
    scene.add(rim)

    const disposables: Array<{ dispose: () => void }> = []
    const track = <T extends { dispose: () => void }>(item: T) => {
        disposables.push(item)
        return item
    }

    // --- Water and glow ---------------------------------------------------
    // The "water" is invisible except for the shadows it catches and a soft
    // glow under the islands, so the scene blends into the page background.
    const waterLevel = -world.islands[0].levelHeight - 0.5
    const water = new THREE.Mesh(
        track(new THREE.PlaneGeometry(extent * 6, extent * 6)),
        track(new THREE.ShadowMaterial({ color: '#000000', opacity: 0.45 }))
    )
    water.rotation.x = -Math.PI / 2
    water.position.y = waterLevel
    water.receiveShadow = true
    scene.add(water)

    const glowMap = track(glowTexture())
    const pool = new THREE.Mesh(
        track(new THREE.PlaneGeometry(extent * 2.6, extent * 2.6)),
        track(new THREE.MeshBasicMaterial({ map: glowMap, color: WATER_COLOR, transparent: true, opacity: 0.9, depthWrite: false }))
    )
    pool.rotation.x = -Math.PI / 2
    pool.position.y = waterLevel - 0.05
    pool.renderOrder = -1
    scene.add(pool)

    // --- Islands ----------------------------------------------------------
    const pickables: THREE.Mesh[] = []
    const growing: GrowingInstance[] = []
    const pulses: Array<{ mesh: THREE.Mesh; phase: number }> = []
    const glows: Array<{ sprite: THREE.Sprite; phase: number }> = []
    const labels: Array<{ element: HTMLDivElement; anchor: THREE.Vector3 }> = []
    const matrix = new THREE.Matrix4()

    const coneGeometries = new Map<number, THREE.ConeGeometry>()
    const trunkGeometries = new Map<number, THREE.CylinderGeometry>()
    const cone = (size: number) => {
        if (!coneGeometries.has(size)) {
            const geometry = new THREE.ConeGeometry(size * 0.72, size * 2.3, 7)
            geometry.translate(0, size * 1.15 + size * 0.35, 0)
            coneGeometries.set(size, track(geometry))
        }
        return coneGeometries.get(size)!
    }
    const trunk = (size: number) => {
        if (!trunkGeometries.has(size)) {
            const geometry = new THREE.CylinderGeometry(size * 0.12, size * 0.16, size * 0.45, 6)
            geometry.translate(0, size * 0.22, 0)
            trunkGeometries.set(size, track(geometry))
        }
        return trunkGeometries.get(size)!
    }
    const trunkMaterial = track(new THREE.MeshStandardMaterial({ color: TRUNK_COLOR, roughness: 1 }))
    const treeMaterials = {
        own: track(new THREE.MeshStandardMaterial({ color: FOREST_COLORS.own, roughness: 0.7, flatShading: true })),
        friend: track(new THREE.MeshStandardMaterial({ color: FOREST_COLORS.friend, roughness: 0.7, flatShading: true })),
        invite: track(new THREE.MeshStandardMaterial({
            color: FOREST_COLORS.invite,
            emissive: FOREST_COLORS.invite,
            emissiveIntensity: 0.45,
            roughness: 0.5,
            flatShading: true,
        })),
    }
    const ringGeometry = track(new THREE.RingGeometry(1, 1.14, 40))
    ringGeometry.rotateX(-Math.PI / 2)

    const addIsland = (island: WorldIsland, islandIndex: number) => {
        const group = new THREE.Group()
        group.userData = { islandIndex, title: island.title, kind: island.kind }
        const levels = island.terraces.length

        island.terraces.forEach((terrace, level) => {
            const shape = new THREE.Shape(terrace.outline.map(([x, y]) => new THREE.Vector2(x, -y)))
            const geometry = track(new THREE.ExtrudeGeometry(shape, {
                depth: island.levelHeight,
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.5,
                bevelSegments: 1,
                curveSegments: 1,
            }))
            geometry.rotateX(-Math.PI / 2)
            geometry.translate(0, terrace.z - island.levelHeight, 0)

            const t = levels === 1 ? 1 : level / (levels - 1)
            const material = track(new THREE.MeshStandardMaterial({
                color: lerpHex(island.palette.bottom, island.palette.top, t),
                roughness: 0.92,
                metalness: 0.02,
            }))
            const mesh = new THREE.Mesh(geometry, material)
            mesh.castShadow = true
            mesh.receiveShadow = true
            mesh.userData = { islandIndex }
            group.add(mesh)
            pickables.push(mesh)

            // Glowing contour line along the terrace edge, as in the 2D view.
            const contourPoints = terrace.outline.map(([x, y]) => toVector(x, y, terrace.z + 0.55))
            const contour = new THREE.LineLoop(
                track(new THREE.BufferGeometry().setFromPoints(contourPoints)),
                track(new THREE.LineBasicMaterial({
                    color: FOREST_COLORS.contour,
                    transparent: true,
                    opacity: Math.min(1, island.contourOpacity * (0.75 + 0.35 * t)),
                    toneMapped: false,
                }))
            )
            group.add(contour)
        })

        // Trees, one instanced mesh per kind.
        const byKind = new Map<string, typeof island.trees>()
        for (const tree of island.trees) byKind.set(tree.kind, [...(byKind.get(tree.kind) || []), tree])

        byKind.forEach((trees, kind) => {
            const size = trees[0].size
            const material = treeMaterials[kind as keyof typeof treeMaterials]
            const crowns = new THREE.InstancedMesh(cone(size), material, trees.length)
            const trunks = new THREE.InstancedMesh(trunk(size), trunkMaterial, trees.length)
            crowns.castShadow = true
            crowns.receiveShadow = true
            trunks.castShadow = true
            const center = trees.reduce((sum, tree) => ({ x: sum.x + tree.x, y: sum.y + tree.y }), { x: 0, y: 0 })
            center.x /= trees.length
            center.y /= trees.length

            trees.forEach((tree, index) => {
                const position = toVector(tree.x, tree.y, tree.z)
                const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), jitter(index, islandIndex) * Math.PI * 2)
                const scale = 0.82 + jitter(index, islandIndex + 7) * 0.36
                // Trees grow in from the island's heart outwards.
                const delay = Math.min(1.6, Math.hypot(tree.x - center.x, tree.y - center.y) / (island.radius * 1.4) + (island.kind === 'main' ? 0 : 0.5))
                for (const mesh of [crowns, trunks]) {
                    growing.push({ mesh, index, position, quaternion, scale, delay })
                    matrix.compose(position, quaternion, new THREE.Vector3(scale, scale, scale))
                    mesh.setMatrixAt(index, matrix)
                }

                if (kind === 'invite') {
                    const ring = new THREE.Mesh(ringGeometry, track(new THREE.MeshBasicMaterial({
                        color: FOREST_COLORS.invite,
                        transparent: true,
                        opacity: 0.6,
                        depthWrite: false,
                        blending: THREE.AdditiveBlending,
                    })))
                    ring.position.copy(position).add(new THREE.Vector3(0, 0.4, 0))
                    ring.scale.setScalar(size * 2)
                    group.add(ring)
                    pulses.push({ mesh: ring, phase: jitter(index, 3) })

                    const glow = new THREE.Sprite(track(new THREE.SpriteMaterial({
                        map: glowMap,
                        color: FOREST_COLORS.invite,
                        transparent: true,
                        opacity: 0.45,
                        depthWrite: false,
                        blending: THREE.AdditiveBlending,
                    })))
                    glow.position.copy(position).add(new THREE.Vector3(0, size * 1.4, 0))
                    glow.scale.setScalar(size * 4.5)
                    group.add(glow)
                    glows.push({ sprite: glow, phase: jitter(index, 5) })
                }
            })
            crowns.instanceMatrix.needsUpdate = true
            trunks.instanceMatrix.needsUpdate = true
            group.add(crowns, trunks)
        })

        // A sapling marks an island that is waiting for its first tree.
        if (island.sprout) {
            const stemMaterial = track(new THREE.MeshStandardMaterial({ color: FOREST_COLORS.friend, roughness: 0.6 }))
            const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.35, 0.45, 7, 6)), stemMaterial)
            const base = toVector(island.sprout.x, island.sprout.y, island.sprout.z)
            stem.position.copy(base).add(new THREE.Vector3(0, 3.5, 0))
            const leafGeometry = track(new THREE.SphereGeometry(1, 12, 8))
            for (const side of [-1, 1]) {
                const leaf = new THREE.Mesh(leafGeometry, stemMaterial)
                leaf.scale.set(2.6, 0.7, 1.3)
                leaf.position.copy(base).add(new THREE.Vector3(side * 2.4, 6.8 + (side > 0 ? 0.8 : 0), 0))
                leaf.rotation.z = side * -0.45
                group.add(leaf)
            }
            stem.castShadow = true
            group.add(stem)
        }

        if (island.label) {
            const element = document.createElement('div')
            element.textContent = island.label
            element.style.cssText = 'position:absolute;left:0;top:0;transform:translate(-50%,-100%);padding:2px 7px;background:rgba(11,16,31,.72);border:1px solid rgba(224,241,70,.35);color:#F4F7DC;font:700 11px/1.3 ui-sans-serif,system-ui,sans-serif;white-space:nowrap;will-change:transform'
            overlay.appendChild(element)
            const top = island.terraces[island.terraces.length - 1]
            labels.push({ element, anchor: toVector(top.cx, top.cy, top.z + (island.trees.length ? 20 : 12)) })
        }

        scene.add(group)
    }

    world.islands.forEach(addIsland)

    // --- Roots between islands, with light flowing along them -------------
    const saps: Array<{ sprite: THREE.Sprite; curve: THREE.QuadraticBezierCurve3; offset: number }> = []
    const rootHeight = waterLevel + 1.2
    const rootMaterial = track(new THREE.LineDashedMaterial({ color: FOREST_COLORS.link, dashSize: 3, gapSize: 5, transparent: true, opacity: 0.7 }))
    world.roots.forEach((root, rootIndex) => {
        const curve = new THREE.QuadraticBezierCurve3(
            toVector(root.start[0], root.start[1], rootHeight),
            toVector(root.control[0], root.control[1], rootHeight),
            toVector(root.end[0], root.end[1], rootHeight)
        )
        const line = new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))), rootMaterial)
        line.computeLineDistances()
        scene.add(line)

        for (let k = 0; k < 2; k += 1) {
            const sprite = new THREE.Sprite(track(new THREE.SpriteMaterial({
                map: glowMap,
                color: FOREST_COLORS.invite,
                transparent: true,
                opacity: 0.9,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            })))
            sprite.scale.setScalar(6)
            scene.add(sprite)
            saps.push({ sprite, curve, offset: k / 2 + jitter(rootIndex, 11) * 0.3 })
        }
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
    controls.maxPolarAngle = Math.PI * 0.46
    controls.autoRotate = !reducedMotion
    controls.autoRotateSpeed = 0.35
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

    let resumeTimer: number | undefined
    const pauseAutoRotate = () => {
        controls.autoRotate = false
        window.clearTimeout(resumeTimer)
        if (!reducedMotion) {
            resumeTimer = window.setTimeout(() => {
                if (!focused) controls.autoRotate = true
            }, 9000)
        }
    }
    controls.addEventListener('start', pauseAutoRotate)

    // --- Camera fitting and fly-to ----------------------------------------
    const size = new THREE.Vector2()
    const probe = new THREE.PerspectiveCamera(camera.fov, 1, 1, extent * 40)
    const projected = new THREE.Vector3()
    const FIT_AZIMUTHS = Array.from({ length: 8 }, (_, index) => (index / 8) * Math.PI * 2)
    // Screen share the scene may fill, leaving room for the zoom buttons
    // and the hint line.
    const FILL_X = 0.86
    const FILL_Y = 0.8

    // Projected bounds (NDC) of the frame points, over a full turn of the
    // auto-rotation.
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
        homeDistance = Math.max(distance, world.mainRadius * 0.9)
        controls.minDistance = world.mainRadius * 0.45
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
        if (island.kind === 'main') {
            reset()
            return
        }
        const top = island.terraces[island.terraces.length - 1]
        const target = toVector(island.center.x, island.center.y, top.z * 0.6)
        const outward = new THREE.Vector3(island.center.x, 0, island.center.y).normalize()
        const distance = Math.max(island.radius * 5.5, 90)
        const position = target.clone()
            .add(outward.multiplyScalar(distance * Math.cos(ELEVATION + 0.15)))
            .add(new THREE.Vector3(0, distance * Math.sin(ELEVATION + 0.15), 0))
        focused = island.title
        controls.autoRotate = false
        options.onFocusChange?.(focused)
        flyTo(position, target)
    }

    const reset = () => {
        focused = null
        options.onFocusChange?.(null)
        flyTo(homePosition(), homeTarget.clone())
        if (!reducedMotion) controls.autoRotate = true
    }

    const zoomBy = (factor: number) => {
        const offset = camera.position.clone().sub(controls.target)
        const length = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)
        pauseAutoRotate()
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
        tooltip.textContent = island.kind === 'main'
            ? (focused ? 'Your forest · click to go back' : 'Your forest')
            : focused === island.title ? island.title : `${island.title} · click to visit`
        tooltip.style.transform = `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`
        tooltip.style.opacity = '1'
        renderer.domElement.style.cursor = island.kind === 'friend' ? 'pointer' : 'grab'
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
                const s = Math.max(0.0001, item.scale * easeOutBack(t))
                matrix.compose(item.position, item.quaternion, scratchScale.set(s, s, s))
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
                pulse.mesh.scale.setScalar(base * (0.45 + t * 1.1))
                ;(pulse.mesh.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - t)
            }
            for (const glow of glows) {
                ;(glow.sprite.material as THREE.SpriteMaterial).opacity = 0.3 + 0.2 * Math.sin((elapsed + glow.phase * 6) * 2.2)
            }
            for (const sap of saps) {
                sap.sprite.position.copy(sap.curve.getPoint((elapsed * 0.22 + sap.offset) % 1))
            }
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
        window.clearTimeout(resumeTimer)
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
