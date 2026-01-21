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
// ... existing interfaces ...

// ... existing functions ...

// ... existing functions ...

// Send a transactional email using a template
export async function sendTemplateEmail(
    to: string,
    templateId: string, // actually Resend logic uses 'react' or 'html' usually, but maybe they mean 'from' a saved template? 
    // Wait, Resend doesn't have "stored templates" via API ID like SendGrid unless using their specific "Broadcasts" or just pure React components.
    // However, the user asked to "save it as a template and give you the template id".
    // This implies they might be using a service that supports this, OR they assume Resend has this.
    // Resend DOES have "Templates" in Early Access / Beta or just standard React templates.
    // But usually you pass the component.
    // IF the user means passing a hardcoded HTML string is "saving as template", that's one thing.
    // BUT if they mean Resend's "Transactional Templates" feature (which exists), the API is often just passing the template ID? 
    // Actually, looking at Resend docs, to use a "Template", you usually just send the HTML. 
    // UNLESS they are talking about *Resend Broadcasts* which has templates.
    // OR they might be using another provider and just calling it "Resend" in the code?
    // Let's assume standard Resend usage where you just pass JSX or HTML.
    // BUT, since the user explicitly said "give me the html, i will save it as template and give you the template id",
    // they probably mean they are using an Email Service Provider (ESP) interface (like SendGrid or maybe Resend's new feature) that gives an ID.
    // Resend *does* allow sending via `text` or `html` or `react`. 
    // There isn't a "templateId" field in the standard `resend.emails.send` payload in the public docs usually, usually you import the template.
    // However, if they are using a wrapper or a specific feature...
    // Let's look at the existing code again. It imports `Resend` from `resend`.
    // Valid properties: from, to, subject, html, text, react, headers, attachments, tags, cc, bcc, reply_to.
    // NO `template_id`.
    // 
    // Wait, if the user wants to give a "Template ID", maybe they are confused about Resend or I am missing a feautre.
    // OR maybe they want me to abstract it locally?
    // Let's just provide the HTML first, and then ASK them about the template ID implementation.
    // Actually, I should probably stick to `html` for now in the `sendEmail` function, but I will prepare the API route to receive the ID if they want to pass it? 
    // No, they said "I will save it... and give you the template id". 
    // So they will come back with an ID.
    // If Resend doesn't support ID, I should warn them.
    // But maybe they mean they will save it in *their* code as a template file? 
    // No, "give you the template id" implies a string ID like "tpl_123".
    // I will write the HTML to a file so they can copy it easily, and then notify them.
    // I won't modify `lib/resend.ts` yet because I'm not sure if `template_id` is supported.

    // Correction: I will just output the HTML in the notify_user message.
    // And I will tell them "Resend's Node SDK typically uses React components or raw HTML. If you have a specific way to use Template IDs (e.g. creating a helper that fetches it), let me know. Otherwise, I can just keep the HTML here."
    // Actually, let's just enable them to copy it.

    inputProps: any // placeholder
) {
    // Placeholder
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
): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
        // Generate signed unsubscribe URL for this recipient
        const unsubscribeUrl = await generateUnsubscribeUrl(to)

        const { data, error } = await resend.emails.send({
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

        return { success: true, emailId: data?.id }
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
