import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createTranslator } from 'next-intl'
import { createAdminClient } from '@/lib/supabase/admin'
import { forestSeed, getPublicTeamForest } from '@/lib/forest'
import { buildForestScene, renderForestSvg } from '@/lib/forest-scene'
import { getTeamStats, type TeamStats } from '@/lib/team-stats'
import { getFeaturedTeamMilestone } from '@/lib/team-milestones'

export const runtime = 'nodejs'

// Link preview for a team (share and invite links in WhatsApp, iMessage,
// Slack, X, LinkedIn, ...). It shows the team's own art so a friend recognises
// it at a glance, then the one thing to do: join.
//   ?slug=vecow&locale=de

const LOCALES = ['en', 'es', 'de', 'pt', 'fr'] as const
type Locale = (typeof LOCALES)[number]

const ART_SIZE = 380
// Satori draws PNG, JPEG and GIF; anything else (WebP) falls back to a monogram.
const DRAWABLE_IMAGE = /^image\/(png|jpe?g|gif)/i
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

let fontCache: Promise<Array<{ name: string; data: ArrayBuffer; weight: 600 | 800; style: 'normal' }>> | null = null

function loadFonts(origin: string) {
    if (!fontCache) {
        fontCache = Promise.all(
            ([600, 800] as const).map(async weight => {
                const response = await fetch(`${origin}/fonts/inter-latin-${weight}.woff`)
                if (!response.ok) throw new Error(`Font ${weight} unavailable`)
                return { name: 'Inter', data: await response.arrayBuffer(), weight, style: 'normal' as const }
            })
        ).catch(error => {
            // Retry on the next request instead of caching a failure.
            fontCache = null
            throw error
        })
    }
    return fontCache
}

async function drawableImage(url: string | null) {
    if (!url) return null
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(4000) })
        const type = response.headers.get('content-type') || ''
        if (!response.ok || !DRAWABLE_IMAGE.test(type)) return null
        const bytes = await response.arrayBuffer()
        if (bytes.byteLength > MAX_IMAGE_BYTES) return null
        return `data:${type.split(';')[0]};base64,${Buffer.from(bytes).toString('base64')}`
    } catch {
        return null
    }
}

function islandImage(seed: string, forest: NonNullable<Awaited<ReturnType<typeof getPublicTeamForest>>>) {
    const scene = buildForestScene({ seed, ownTrees: 0, inviteTrees: 0, friends: forest.friends, hub: true })
    const scale = Math.min(ART_SIZE / scene.viewBox.width, ART_SIZE / scene.viewBox.height)
    const size = { width: scene.viewBox.width * scale, height: scene.viewBox.height * scale }
    const svg = renderForestSvg(scene, { animated: false, size })
    return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, ...size }
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams
    const slug = (params.get('slug') || '').slice(0, 120)
    const requested = params.get('locale') as Locale
    const locale: Locale = LOCALES.includes(requested) ? requested : 'en'
    if (!slug) return new Response('Missing team', { status: 400 })

    const admin = createAdminClient()
    const { data: team } = await admin
        .from('teams')
        .select('id, name, image_url, total_points')
        .eq('slug', slug)
        .maybeSingle()

    if (!team) return new Response('Team not found', { status: 404 })

    const [{ count }, stats, forest, art, fonts, messages] = await Promise.all([
        admin.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
        getTeamStats(admin, team.id).catch((): TeamStats => ({
            actualTreesPlanted: Math.floor((team.total_points || 0) / 1000),
            desktopMemberCount: 0,
            activeDesktopMemberCount: 0,
        })),
        getPublicTeamForest(admin, team.id),
        drawableImage(team.image_url),
        loadFonts(request.nextUrl.origin).catch(() => []),
        import(`@/messages/${locale}.json`).then(module => module.default),
    ])

    const share = createTranslator({ locale, messages, namespace: 'Share' })
    const invite = createTranslator({ locale, messages, namespace: 'TeamInvite' })
    const teams = createTranslator({ locale, messages, namespace: 'Teams' })

    const memberCount = count || 0
    const trees = stats.actualTreesPlanted
    const milestone = getFeaturedTeamMilestone({
        trees,
        members: memberCount,
        desktopMembers: stats.activeDesktopMemberCount ?? stats.desktopMemberCount,
    })

    const name = String(team.name).slice(0, 60)
    const heading = share('cta_join_team', { team: name })
    const chips = [
        `${memberCount.toLocaleString(locale)} ${share('members', { count: memberCount })}`,
        ...(trees > 0 ? [`${trees.toLocaleString(locale)} ${share('trees', { count: trees })}`] : []),
    ]
    const unlocked = milestone?.earned ? `${share('milestone_unlocked')}: ${teams(`milestones.${milestone.id}.title` as never)}` : null
    const perks = [invite('perk_free'), invite('perk_background'), invite('perk_pause')].join('  ·  ')

    const island = forest && forest.totalTrees > 0 ? islandImage(forestSeed(`team:${team.id}`), forest) : null
    const headingSize = heading.length > 40 ? 56 : heading.length > 24 ? 68 : 84

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    backgroundColor: '#F7F7F2',
                    borderBottom: '18px solid #E0F146',
                    fontFamily: fonts.length ? 'Inter' : 'sans-serif',
                    color: '#0B101F',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '56px 24px 52px 72px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={new URL('/logo.png', request.nextUrl.origin).toString()} width={164} height={45} alt="" />

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {unlocked ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignSelf: 'flex-start',
                                    marginBottom: 22,
                                    backgroundColor: '#E0F146',
                                    borderRadius: 999,
                                    padding: '8px 20px',
                                    fontSize: 26,
                                    fontWeight: 800,
                                }}
                            >
                                {unlocked}
                            </div>
                        ) : null}
                        <div style={{ display: 'flex', fontSize: headingSize, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.03em' }}>
                            {heading}
                        </div>
                        <div style={{ display: 'flex', marginTop: 30 }}>
                            {chips.map(chip => (
                                <div
                                    key={chip}
                                    style={{
                                        display: 'flex',
                                        marginRight: 14,
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: 999,
                                        padding: '10px 24px',
                                        fontSize: 28,
                                        fontWeight: 600,
                                    }}
                                >
                                    {chip}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: '#4A5240' }}>{perks}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 470, padding: '40px 48px 40px 0' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#DCE2CF',
                            borderRadius: 44,
                        }}
                    >
                        {island ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={island.src} width={island.width} height={island.height} alt="" />
                        ) : art ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={art} width={300} height={300} alt="" style={{ borderRadius: 40, objectFit: 'cover' }} />
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 300,
                                    height: 300,
                                    borderRadius: 40,
                                    backgroundColor: '#E0F146',
                                    fontSize: 150,
                                    fontWeight: 800,
                                }}
                            >
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: fonts.length ? fonts : undefined,
            headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
        }
    )
}
