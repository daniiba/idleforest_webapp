'use server'

import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://idleforest.com'

// Generate a signed unsubscribe URL for transactional emails
export async function generateUnsubscribeUrl(email: string): Promise<string> {
    const token = crypto
        .createHmac('sha256', UNSUBSCRIBE_SECRET!)
        .update(email.toLowerCase())
        .digest('hex')
        .slice(0, 32)

    return `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export interface ResendContact {
    email: string
    firstName?: string | null
    lastName?: string | null
    unsubscribed?: boolean
    created_at?: string
}

export interface ResendAudience {
    id: string
    name: string
}

// Get or create an audience by name
export async function getOrCreateAudience(name: string): Promise<ResendAudience | null> {
    try {
        // First, try to list existing audiences
        const { data: audiences, error: listError } = await resend.audiences.list()

        if (listError) {
            console.error('Error listing audiences:', listError)
            return null
        }

        // Check if audience already exists
        const existing = audiences?.data?.find((a) => a.name === name)
        if (existing) {
            return { id: existing.id, name: existing.name }
        }

        // Create new audience
        const { data, error } = await resend.audiences.create({
            name: name
        })

        if (error) {
            console.error('Error creating audience:', error)
            return null
        }

        return data ? { id: data.id, name: data.name } : null
    } catch (error) {
        console.error('Error in getOrCreateAudience:', error)
        return null
    }
}

// Sync contacts to an audience
export async function syncContactsToAudience(
    contacts: ResendContact[],
    audienceId: string
): Promise<{ success: boolean; synced: number; errors: string[] }> {
    const errors: string[] = []
    let synced = 0

    for (const contact of contacts) {
        try {
            const { error } = await resend.contacts.create({
                audienceId: audienceId,
                email: contact.email,
                firstName: contact.firstName || undefined,
                lastName: contact.lastName || undefined,
                unsubscribed: contact.unsubscribed ?? false
            })

            if (error) {
                // If contact already exists, that's fine - count as synced
                if (error.message?.includes('already exists')) {
                    synced++
                } else {
                    errors.push(`${contact.email}: ${error.message}`)
                }
            } else {
                synced++
            }
        } catch (err) {
            errors.push(`${contact.email}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }

        // Rate limit: 2 requests per second = 500ms delay. Using 600ms to be safe.
        await new Promise(resolve => setTimeout(resolve, 600))
    }

    return { success: errors.length === 0, synced, errors }
}

// Create a broadcast (draft) for an audience
export async function createBroadcast(
    audienceId: string,
    subject: string,
    htmlContent: string,
    fromEmail: string = 'support@idleforest.com',
    name?: string
): Promise<{ success: boolean; broadcastId?: string; error?: string }> {
    try {
        // Note: Resend broadcasts automatically include List-Unsubscribe headers
        // The {{{RESEND_UNSUBSCRIBE_URL}}} variable is replaced with a unique unsubscribe URL per recipient
        const { data, error } = await resend.broadcasts.create({
            audienceId,
            from: fromEmail,
            subject,
            html: htmlContent,
            name: name || subject // Use template name, fallback to subject
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, broadcastId: data?.id }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}

// Send a broadcast
export async function sendBroadcast(broadcastId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await resend.broadcasts.send(broadcastId)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}

// List all audiences
export async function listAudiences(): Promise<ResendAudience[]> {
    try {
        const { data, error } = await resend.audiences.list()

        if (error || !data) {
            console.error('Error listing audiences:', error)
            return []
        }

        return data.data?.map((a) => ({ id: a.id, name: a.name })) || []
    } catch (error) {
        console.error('Error in listAudiences:', error)
        return []
    }
}

// Send a single transactional email
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    from: string = 'Daniel from IdleForest <daniel@idleforest.com>'
): Promise<{ success: boolean; error?: string }> {
    try {
        // Generate signed unsubscribe URL for this recipient
        const unsubscribeUrl = await generateUnsubscribeUrl(to)

        const { error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}

// List contacts from an audience
export async function listContacts(audienceId: string): Promise<{ success: boolean; data?: ResendContact[]; error?: string }> {
    try {
        const { data, error } = await resend.contacts.list({
            audienceId
        })

        if (error) {
            return { success: false, error: error.message }
        }

        const contacts = data?.data?.map(c => ({
            email: c.email,
            firstName: c.first_name,
            lastName: c.last_name,
            unsubscribed: c.unsubscribed,
            created_at: c.created_at
        })) || []

        return { success: true, data: contacts }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
}
