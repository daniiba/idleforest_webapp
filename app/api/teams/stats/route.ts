import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTeamStats } from '@/lib/team-stats'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const teamId = searchParams.get('teamId')

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        const stats = await getTeamStats(createAdminClient(), teamId)
        return NextResponse.json(stats)
    } catch (error) {
        console.error('Team stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
