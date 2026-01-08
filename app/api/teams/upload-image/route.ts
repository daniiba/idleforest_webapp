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

// Upload team image
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }, { status: 400 })
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size is 2MB' }, { status: 400 })
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('team-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('team-images')
            .getPublicUrl(data.path)

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            path: data.path
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
