import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { forestSeed, getForestData, type ForestData } from '@/lib/forest'
import { buildForestScene, renderForestSvg } from '@/lib/forest-scene'
import { getReferralRewardSettings } from '@/lib/referral-reward-settings'
import { resolveReferralOwner } from '@/lib/referrals'

export const runtime = 'nodejs'

// Share image of a member's forest island.
//   ?demo=1                 sample forest for the launch email / social posts
//   ?displayName=Anna       Anna's public forest ("Anna's forest")
//   ?code=ABCD2345&locale=  invite preview ("Anna invited you to grow a forest")
//   ?code=ABCD2345&view=owner  the member's own forest, for emails to them ("Your forest")

const COPY = {
    en: { invited: '{name} invited you to grow a forest', forest: "{name}'s forest", inForest: 'trees in this forest', gift: 'Join and you both get {trees} planted', join: 'Free · Runs in the background · Plants real trees', demoTitle: 'Plant a tree with a friend' , yours: 'Your forest', inYours: 'trees in your forest', ownerGift: 'Invite a friend. You both get {trees}.', ownerJoin: 'Your invite link: {link}' },
    de: { invited: '{name} hat dich eingeladen, einen Wald wachsen zu lassen', forest: 'Der Wald von {name}', inForest: 'Bäume in diesem Wald', gift: 'Mach mit und ihr bekommt beide {trees}', join: 'Kostenlos · Läuft im Hintergrund · Pflanzt echte Bäume', demoTitle: 'Pflanze einen Baum mit einem Freund' , yours: 'Dein Wald', inYours: 'Bäume in deinem Wald', ownerGift: 'Lade jemanden ein. Ihr bekommt beide {trees}.', ownerJoin: 'Dein Einladungslink: {link}' },
    es: { invited: '{name} te ha invitado a hacer crecer un bosque', forest: 'El bosque de {name}', inForest: 'árboles en este bosque', gift: 'Únete y cada uno recibe {trees}', join: 'Gratis · En segundo plano · Planta árboles reales', demoTitle: 'Planta un árbol con un amigo' , yours: 'Tu bosque', inYours: 'árboles en tu bosque', ownerGift: 'Invita a alguien. Cada uno recibe {trees}.', ownerJoin: 'Tu enlace: {link}' },
    fr: { invited: '{name} vous invite à faire pousser une forêt', forest: 'La forêt de {name}', inForest: 'arbres dans cette forêt', gift: 'Rejoignez-nous et chacun reçoit {trees}', join: 'Gratuit · En arrière-plan · Plante de vrais arbres', demoTitle: 'Plantez un arbre avec un ami' , yours: 'Votre forêt', inYours: 'arbres dans votre forêt', ownerGift: 'Invitez quelqu’un. Chacun reçoit {trees}.', ownerJoin: 'Votre lien : {link}' },
    pt: { invited: '{name} convidou você para fazer uma floresta crescer', forest: 'A floresta de {name}', inForest: 'árvores nesta floresta', gift: 'Entre e cada um ganha {trees}', join: 'Grátis · Em segundo plano · Planta árvores de verdade', demoTitle: 'Plante uma árvore com um amigo' , yours: 'A sua floresta', inYours: 'árvores na sua floresta', ownerGift: 'Convide alguém. Cada um ganha {trees}.', ownerJoin: 'Seu link: {link}' },
} as const

const TREE_WORDS = {
    en: ['a tree', 'trees'],
    de: ['einen Baum', 'Bäume'],
    es: ['un árbol', 'árboles'],
    fr: ['un arbre', 'arbres'],
    pt: ['uma árvore', 'árvores'],
} as const

const DEMO_FOREST: ForestData = {
    ownTrees: 46,
    inviteTrees: 3,
    friendTrees: 88,
    totalTrees: 137,
    friends: [
        { label: null, trees: 31, contributing: true },
        { label: null, trees: 12, contributing: true },
        { label: null, trees: 0, contributing: false },
        { label: null, trees: 38, contributing: true },
        { label: null, trees: 7, contributing: true },
    ],
}

const ISLAND_BOX = { width: 700, height: 560 }

function islandImage(seed: string, forest: ForestData) {
    const scene = buildForestScene({ seed, ownTrees: forest.ownTrees, inviteTrees: forest.inviteTrees, friends: forest.friends })
    const scale = Math.min(ISLAND_BOX.width / scene.viewBox.width, ISLAND_BOX.height / scene.viewBox.height)
    const size = { width: scene.viewBox.width * scale, height: scene.viewBox.height * scale }
    const svg = renderForestSvg(scene, { animated: false, size })
    return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, ...size }
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams
    const locale = (params.get('locale') || 'en') as keyof typeof COPY
    const copy = COPY[locale] || COPY.en
    const treeWords = TREE_WORDS[locale] || TREE_WORDS.en

    let seed = 'idleforest-demo'
    let forest: ForestData = DEMO_FOREST
    let title: string = copy.demoTitle
    let rewardTrees = 1
    let owner: { code: string } | null = null

    try {
        const admin = createAdminClient()
        const reward = await getReferralRewardSettings(admin)
        rewardTrees = reward.enabled ? reward.treesPerPerson : 0

        const code = params.get('code')
        const displayName = params.get('displayName')?.trim()

        if (code) {
            const member = await resolveReferralOwner(admin, code)
            if (member) {
                const ownerView = params.get('view') === 'owner'
                seed = forestSeed(member.userId)
                forest = await getForestData(admin, member.userId, { includeNames: ownerView })
                title = ownerView
                    ? copy.yours
                    : copy.invited.replace('{name}', (member.displayName || 'A friend').slice(0, 40))
                if (ownerView) owner = { code: code.toUpperCase().slice(0, 16) }
            }
        } else if (displayName && params.get('demo') !== '1') {
            const { data: profile } = await admin
                .from('profiles')
                .select('user_id, display_name')
                .ilike('display_name', displayName.replace(/[\\%_]/g, character => `\\${character}`))
                .maybeSingle()
            if (profile) {
                seed = forestSeed(profile.user_id)
                forest = await getForestData(admin, profile.user_id, { includeNames: false })
                title = copy.forest.replace('{name}', String(profile.display_name).slice(0, 40))
            }
        }
    } catch (error) {
        // Fall back to the demo forest rather than a broken preview.
        console.error('Forest share image data failed:', error)
    }

    const image = islandImage(seed, forest)
    const giftTrees = rewardTrees === 1 ? treeWords[0] : `${rewardTrees} ${treeWords[1]}`

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    backgroundColor: '#DCE2CF',
                    borderBottom: '18px solid #E0F146',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 480, padding: '56px 0 48px 64px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0B101F' }}>
                            IdleForest
                        </div>
                        <div style={{ display: 'flex', marginTop: 20, fontSize: title.length > 40 ? 46 : 56, fontWeight: 900, lineHeight: 1.04, color: '#0B101F', textTransform: 'uppercase' }}>
                            {title}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {forest.totalTrees > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignSelf: 'flex-start', fontSize: 72, fontWeight: 900, lineHeight: 1, color: '#0B101F', backgroundColor: '#E0F146', padding: '4px 12px' }}>{forest.totalTrees.toLocaleString('en')}</div>
                                <div style={{ display: 'flex', marginTop: 8, fontSize: 24, fontWeight: 700, color: '#0B101F' }}>{owner ? copy.inYours : copy.inForest}</div>
                            </div>
                        ) : null}
                        {rewardTrees > 0 ? (
                            <div style={{ display: 'flex', marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#0B101F', color: '#E0F146', padding: '10px 18px', fontSize: 24, fontWeight: 800 }}>
                                {(owner ? copy.ownerGift : copy.gift).replace('{trees}', giftTrees)}
                            </div>
                        ) : null}
                        <div style={{ display: 'flex', marginTop: 16, fontSize: 20, fontWeight: 600, color: '#4A5240' }}>{owner ? copy.ownerJoin.replace('{link}', `idleforest.com/r/${owner.code}`) : copy.join}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', paddingRight: 24 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.src} width={image.width} height={image.height} alt="" />
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
        }
    )
}
