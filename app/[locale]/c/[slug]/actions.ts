'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UpdateCompanyInput = {
    name: string
    slug: string
    invite_code: string
    theme_color: string
    website: string | null
    video_url: string | null
    logo_url: string | null
    description: string | null
    is_invite_only: boolean
}

export async function updateCompany(companyId: string, input: UpdateCompanyInput) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: company, error: fetchError } = await supabase
        .from('companies')
        .select('user_id')
        .eq('id', companyId)
        .single()

    if (fetchError || !company) {
        return { success: false, error: 'Company not found' }
    }

    if (company.user_id !== user.id) {
        return { success: false, error: 'Unauthorized: You are not the owner of this company' }
    }

    // Update company
    const { error: updateError } = await supabase
        .from('companies')
        .update({
            name: input.name,
            slug: input.slug,
            invite_code: input.invite_code,
            theme_color: input.theme_color,
            website: input.website,
            video_url: input.video_url,
            logo_url: input.logo_url,
            description: input.description,
            is_invite_only: input.is_invite_only,
            updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

    if (updateError) {
        console.error('Update company error:', updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath(`/[locale]/c/${input.slug}`) // revalidate the current page
    return { success: true }
}
