'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { PartnerLead, PartnerLeadStatus, PartnerResearchTrack } from '@/lib/partner-leads'
import { verifyAdminSession } from '../actions'

async function requireAdmin() {
    if (!(await verifyAdminSession())) {
        throw new Error('Unauthorized: Admin session required')
    }
}

export async function getPartnerLeads(researchTrack: PartnerResearchTrack = 'idleforest'): Promise<{
    leads: PartnerLead[]
    setupRequired?: boolean
}> {
    await requireAdmin()

    const { data, error } = await createAdminClient()
        .from('partner_leads')
        .select('*')
        .eq('research_track', researchTrack)
        .order('updated_at', { ascending: false })

    if (error) {
        if (error.code === '42P01') {
            return { leads: [], setupRequired: true }
        }
        console.error('Error fetching partner leads:', error)
        throw new Error(error.message)
    }

    return { leads: (data || []) as PartnerLead[] }
}

export async function updatePartnerLead(
    id: string,
    input: {
        status?: PartnerLeadStatus
        reminder_at?: string | null
        last_contacted_at?: string | null
        notes?: string
    }
): Promise<PartnerLead> {
    await requireAdmin()

    const update: Record<string, string | null> = {}
    if (input.status !== undefined) update.status = input.status
    if (input.reminder_at !== undefined) update.reminder_at = input.reminder_at
    if (input.last_contacted_at !== undefined) update.last_contacted_at = input.last_contacted_at
    if (input.notes !== undefined) update.notes = input.notes

    const { data, error } = await createAdminClient()
        .from('partner_leads')
        .update(update)
        .eq('id', id)
        .select('*')
        .single()

    if (error) {
        console.error('Error updating partner lead:', error)
        throw new Error(error.message)
    }

    return data as PartnerLead
}

export async function deletePartnerLead(id: string): Promise<void> {
    await requireAdmin()

    const { error } = await createAdminClient()
        .from('partner_leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting partner lead:', error)
        throw new Error(error.message)
    }
}
