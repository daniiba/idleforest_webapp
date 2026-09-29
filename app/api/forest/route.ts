import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { forestSeed, getForestData, getTeamForestData } from '@/lib/forest'
import { getReferralRewardSettings } from '@/lib/referral-reward-settings'
import { normalizeReferralCode } from '@/lib/referrals'

export const dynamic = 'force-dynamic'

// The desktop app calls this with a bearer token from its own origin, so
// allow cross-origin reads. Cookies are never sent cross-origin with "*".
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

function escapeIlike(value: string) {
    return value.replace(/[\\%_]/g, character => `\\${character}`)
}

function json(body: unknown, init: { status?: number; cache?: string } = {}) {
    return NextResponse.json(body, {
        status: init.status || 200,
        headers: { ...CORS_HEADERS, 'Cache-Control': init.cache || 'private, no-store' },
    })
}

export function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

async function authenticatedUserId(request: NextRequest, admin: ReturnType<typeof createAdminClient>) {
    const authorization = request.headers.get('authorization') || ''
    if (authorization.toLowerCase().startsWith('bearer ')) {
        const { data } = await admin.auth.getUser(authorization.slice(7).trim())
        return data.user?.id || null
    }

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.id || null
}

// GET /api/forest                     -> your own forest (cookie or bearer token), with friends' names
// GET /api/forest?displayName=Anna    -> Anna's public forest, friends shown by their public display names
// GET /api/forest?team=lisbon-coders   -> a team's forest: one grove per member around a shared clearing
// GET /api/forest?teamId=<uuid>         -> the same, by team id (desktop app)
// ...&presence=1                        -> team members only: whose computer is planting right now
//
// Presence (working / sleeping) is only ever sent to the forest's owner and
// to members of the team, never in the publicly cached responses.
export async function GET(request: NextRequest) {
    const displayName = request.nextUrl.searchParams.get('displayName')?.trim()
    const teamSlug = request.nextUrl.searchParams.get('team')?.trim()
    const teamId = request.nextUrl.searchParams.get('teamId')?.trim()

    try {
        const admin = createAdminClient()
        const reward = await getReferralRewardSettings(admin)
        const program = reward.enabled
            ? { treesPerPerson: reward.treesPerPerson, minActiveDays: reward.minActiveDays }
            : null

        if (teamSlug || teamId) {
            if ((teamSlug && teamSlug.length > 120) || (teamId && !/^[0-9a-f-]{36}$/i.test(teamId))) {
                return json({ error: 'Invalid team' }, { status: 400 })
            }

            const query = admin.from('teams').select('id, name, slug')
            const { data: team } = await (teamId ? query.eq('id', teamId) : query.eq('slug', teamSlug as string)).maybeSingle()

            if (!team) return json({ error: 'Team not found' }, { status: 404 })

            // A separate URL keeps member-only data out of the shared cache.
            if (request.nextUrl.searchParams.get('presence') === '1') {
                const userId = await authenticatedUserId(request, admin)
                const { data: membership } = userId
                    ? await admin.from('team_members').select('user_id').eq('team_id', team.id).eq('user_id', userId).maybeSingle()
                    : { data: null }
                if (!membership) return json({ error: 'Only team members can see this' }, { status: 403 })

                const forest = await getTeamForestData(admin, team.id, { includePresence: true })
                return json({ seed: forestSeed(`team:${team.id}`), displayName: team.name, invitePath: null, reward: null, ...forest })
            }

            const forest = await getTeamForestData(admin, team.id)
            return json({
                seed: forestSeed(`team:${team.id}`),
                displayName: team.name,
                invitePath: null,
                reward: null,
                ...forest,
            }, { cache: 'public, s-maxage=300, stale-while-revalidate=600' })
        }

        if (displayName) {
            if (displayName.length > 100) return json({ error: 'Invalid profile name' }, { status: 400 })

            const { data: profile } = await admin
                .from('profiles')
                .select('user_id, display_name, referral_code')
                .ilike('display_name', escapeIlike(displayName))
                .maybeSingle()

            if (!profile) return json({ error: 'Profile not found' }, { status: 404 })

            const forest = await getForestData(admin, profile.user_id, { includeNames: true })
            const code = normalizeReferralCode(profile.referral_code)

            return json({
                seed: forestSeed(profile.user_id),
                displayName: profile.display_name,
                invitePath: code ? `/r/${code}?channel=forest` : null,
                reward: program,
                ...forest,
            }, { cache: 'public, s-maxage=300, stale-while-revalidate=600' })
        }

        const userId = await authenticatedUserId(request, admin)
        if (!userId) return json({ error: 'Unauthorized' }, { status: 401 })

        const [{ data: profile }, forest] = await Promise.all([
            admin.from('profiles').select('display_name, referral_code').eq('user_id', userId).maybeSingle(),
            getForestData(admin, userId, { includeNames: true, includePresence: true }),
        ])
        const code = normalizeReferralCode(profile?.referral_code)

        return json({
            seed: forestSeed(userId),
            displayName: profile?.display_name || null,
            invitePath: code ? `/r/${code}?channel=forest` : null,
            reward: program,
            ...forest,
        })
    } catch (error) {
        console.error('Failed to load forest:', error)
        return json({ error: 'Failed to load forest' }, { status: 500 })
    }
}
