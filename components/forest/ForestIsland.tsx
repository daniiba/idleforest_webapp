'use client'

import { useId, useMemo } from 'react'
import { buildForestScene, renderForestSvg, type ForestFriend } from '@/lib/forest-scene'

export type ForestIslandProps = {
    seed: string
    ownTrees: number
    inviteTrees: number
    friends: ForestFriend[]
    title?: string
    hub?: boolean
    animated?: boolean
    className?: string
}

// Renders the shared SVG string so the web page, desktop app and share
// images always draw the same island. All user text is escaped by the renderer.
export default function ForestIsland({
    seed,
    ownTrees,
    inviteTrees,
    friends,
    title,
    hub,
    animated = true,
    className,
}: ForestIslandProps) {
    const reactId = useId()
    const idPrefix = `fi${reactId.replace(/[^a-z0-9]/gi, '')}`

    const { svg } = useMemo(() => {
        const scene = buildForestScene({ seed, ownTrees, inviteTrees, friends, hub })
        return { svg: renderForestSvg(scene, { animated, idPrefix, title }) }
    }, [animated, friends, hub, idPrefix, inviteTrees, ownTrees, seed, title])

    return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}
