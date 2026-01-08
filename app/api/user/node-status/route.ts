import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Helper to create Supabase client for route handlers
async function createSupabaseClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore - called from Server Component
                    }
                },
            },
        }
    )
}

// GET /api/user/node-status
// Returns whether the current user has any linked nodes and their platforms
export async function GET() {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Query nodes linked to this user
        const { data: nodes, error: nodesError } = await supabase
            .from('nodes')
            .select('id, platform')
            .eq('user_id', user.id)

        if (nodesError) {
            console.error('Error fetching nodes:', nodesError)
            return NextResponse.json({ error: 'Failed to fetch node status' }, { status: 500 })
        }

        const hasNode = nodes && nodes.length > 0
        const nodeCount = nodes?.length || 0

        // Determine installed platforms
        // platform: 'win32' = Windows, 'darwin' = Mac, null = extension
        const platforms: string[] = []
        if (nodes) {
            const hasDesktopWindows = nodes.some(n => n.platform === 'win32')
            const hasDesktopMac = nodes.some(n => n.platform === 'darwin')
            const hasExtension = nodes.some(n => n.platform === null)

            if (hasDesktopWindows) platforms.push('windows')
            if (hasDesktopMac) platforms.push('mac')
            if (hasExtension) platforms.push('extension')
        }

        return NextResponse.json({
            hasNode,
            nodeCount,
            platforms
        })

    } catch (error) {
        console.error('Node status error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
