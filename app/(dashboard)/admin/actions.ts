'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Session management
const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_TOKEN = process.env.ADMIN_SESSION_SECRET || 'fallback_admin_session_secret'

// Verify admin password and set session cookie
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
        console.error('ADMIN_PASSWORD environment variable is not set')
        return false
    }

    if (inputPassword === adminPassword) {
        // Set HTTP-only cookie for session
        const cookieStore = await cookies()
        cookieStore.set(ADMIN_SESSION_COOKIE, SESSION_TOKEN, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        })
        return true
    }

    return false
}

// Check if admin session is valid
export async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies()
    const session = cookieStore.get(ADMIN_SESSION_COOKIE)
    return session?.value === SESSION_TOKEN
}

// Logout function
export async function adminLogout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(ADMIN_SESSION_COOKIE)
}

// Get monthly revenue snapshots from mellowtel_stats
export async function getMonthlyRevenueHistory() {
    // Verify session first
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const supabase = await createClient()

    // Fetch all mellowtel_stats records ordered by date
    const { data: allStats, error } = await supabase
        .from('mellowtel_stats')
        .select('earnings, created_at')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching mellowtel_stats:', error)
        return []
    }

    if (!allStats || allStats.length === 0) {
        return []
    }

    // Group by month and get the last snapshot of each month
    const monthlySnapshots: Record<string, number> = {}

    for (const stat of allStats) {
        const date = new Date(stat.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        // Keep the latest earnings for each month
        monthlySnapshots[monthKey] = stat.earnings
    }

    // Convert to array and calculate monthly revenue (diff from previous month)
    const months = Object.keys(monthlySnapshots).sort()
    const monthlyRevenue: { month: string; earnings: number; revenue: number }[] = []

    for (let i = 0; i < months.length; i++) {
        const monthKey = months[i]
        const currentEarnings = monthlySnapshots[monthKey]
        const previousEarnings = i > 0 ? monthlySnapshots[months[i - 1]] : 0
        const revenue = Math.max(0, currentEarnings - previousEarnings)

        // Format month nicely (2025-01 -> Jan 2025)
        const [year, monthNum] = monthKey.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} ${year}`

        monthlyRevenue.push({
            month: formattedMonth,
            earnings: currentEarnings,
            revenue: Math.round(revenue * 100) / 100
        })
    }

    return monthlyRevenue
}

export async function getAdminStats() {
    // Verify session first
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const supabase = await createClient()

    // Date calculations
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString()

    // 1. Profiles (Registered Users)
    const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // 2. New Profiles (Last 30 Days)
    const { count: newProfilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo)

    // 3. Nodes Stats
    const { count: nodesCount } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true })

    const { count: anonymousNodesCount } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null)

    const { count: newAnonymousNodesCount } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null)
        .gte('created_at', thirtyDaysAgo)

    // 4. Calculate Total Users (Profiles + Anonymous Nodes)
    // "Nodes that don't belong to a profile are also a user"
    const totalUsersCount = (profilesCount || 0) + (anonymousNodesCount || 0)
    const newTotalUsersCount = (newProfilesCount || 0) + (newAnonymousNodesCount || 0)

    // 5. Active Users (MAU)
    // From Google Chrome Store: 500 weekly active extension users
    // From PostHog: 45 weekly desktop users
    const activeUsersCount = 545 // 500 (Chrome) + 45 (Desktop)

    // 6. Churn Rate (from Chrome Web Store data)
    // 993 total installs, 370 uninstalls over 12 months
    // Monthly Churn Rate = (370 / 993) / 12 ≈ 3.1%
    const chromeStoreInstalls = 993
    const chromeStoreUninstalls = 370
    const monthsRunning = 12
    const churnRate = (chromeStoreUninstalls / chromeStoreInstalls) / monthsRunning // ~0.031 (3.1%)


    // 7. Revenue Stats (mellowtel_stats)
    const { data: currentStats, error: currentError } = await supabase
        .from('mellowtel_stats')
        .select('earnings, requests_total, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (currentError) {
        console.error('Error fetching current stats:', currentError)
    }

    const { data: pastStats, error: pastError } = await supabase
        .from('mellowtel_stats')
        .select('earnings, requests_total, created_at')
        .lte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (pastError) {
        console.error('Error fetching past stats:', pastError)
    }

    const currentEarnings = currentStats?.earnings || 0
    const pastEarnings = pastStats?.earnings || 0
    const monthlyRevenue = Math.max(0, currentEarnings - pastEarnings)


    return {
        profilesCount: profilesCount || 0,
        newProfilesCount: newProfilesCount || 0,
        nodesCount: nodesCount || 0,
        anonymousNodesCount: anonymousNodesCount || 0,
        monthlyRevenue,
        totalRevenue: currentEarnings,
        // Computed fields
        totalUsersCount,
        newTotalUsersCount,
        activeUsersCount,
        churnRate
    }
}

// ========================================
// POWER USERS & RESEND INTEGRATION
// ========================================

import { createAdminClient } from '@/lib/supabase/admin'
import {
    getOrCreateAudience,
    syncContactsToAudience,
    createBroadcast as resendCreateBroadcast,
    sendBroadcast as resendSendBroadcast,
    listAudiences,
    listContacts,
    type ResendContact
} from '@/lib/resend'

export type { ResendContact }


export type UserSegment = 'power_users' | 'active' | 'inactive' | 'new_users' | 'unopted_desktop'

export interface PowerUser {
    id: string
    user_id: string
    email: string | null
    display_name: string
    total_points: number
    last_active: string | null
    created_at: string
    segments: UserSegment[]
}

export interface SegmentStats {
    power_users: number
    active: number
    inactive: number
    new_users: number
    unopted_desktop: number
    total: number
}

// Get all users with their segments for the Power Users tab
// Get all users with their segments for the Power Users tab
export async function getPowerUsers(): Promise<PowerUser[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Fetch profiles with referral stats
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id,
            user_id,
            display_name,
            total_points,
            created_at,
            last_seen
        `)
        .order('total_points', { ascending: false })

    if (error) {
        console.error('Error fetching profiles:', error)
        return []
    }

    if (!profiles || profiles.length === 0) {
        return []
    }

    // Get referral stats for last activity
    const userIds = profiles.map(p => p.user_id)
    const { data: referralStats } = await supabase
        .from('referral_stats')
        .select('user_id, updated_at')
        .in('user_id', userIds)

    const referralMap = new Map(referralStats?.map(r => [r.user_id, r.updated_at]) || [])

    // Get emails from auth.users using admin client with pagination
    let allAuthUsers: any[] = []
    let page = 1
    const perPage = 50
    let hasMore = true

    while (hasMore) {
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
            page: page,
            perPage: perPage
        })

        if (authError) {
            console.error('Error fetching auth users:', authError)
            break
        }

        if (authUsers?.users) {
            allAuthUsers = [...allAuthUsers, ...authUsers.users]
            // If we got fewer users than requested, we've reached the end
            if (authUsers.users.length < perPage) {
                hasMore = false
            } else {
                page++
            }
        } else {
            hasMore = false
        }
    }

    const emailMap = new Map(allAuthUsers.map(u => [u.id, { email: u.email, last_sign_in_at: u.last_sign_in_at }]))

    // Fetch nodes to identify unopted desktop users
    const { data: nodes } = await supabase
        .from('nodes')
        .select('user_id, platform, opt_in')

    // Create a set of users who have at least one desktop node with opt_in = false
    const unoptedDesktopUserIds = new Set<string>()
    if (nodes) {
        nodes.forEach(node => {
            // Check for desktop platform (win32 or darwin) AND opt_in is false
            if ((node.platform === 'win32' || node.platform === 'darwin') && node.opt_in === false) {
                unoptedDesktopUserIds.add(node.user_id)
            }
        })
    }

    // Calculate segments
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Calculate power user threshold (top 10% by points)
    const sortedByPoints = [...profiles].sort((a, b) => b.total_points - a.total_points)
    const top10PercentIndex = Math.ceil(sortedByPoints.length * 0.1)
    const powerUserThreshold = sortedByPoints[top10PercentIndex - 1]?.total_points || 1000

    const powerUsers: PowerUser[] = profiles.map(profile => {
        const authData = emailMap.get(profile.user_id)
        const referralLastActive = referralMap.get(profile.user_id)

        // Use last_seen as primary, fallback to last_sign_in_at, then referral updated_at, then created_at
        // @ts-ignore - last_seen is not yet in the type definition if it was just added to schema
        const lastActive = profile.last_seen || authData?.last_sign_in_at || referralLastActive || profile.created_at
        const segments: UserSegment[] = []

        // Power user: top 10% by points OR > 1000 points
        if (profile.total_points >= powerUserThreshold || profile.total_points > 1000) {
            segments.push('power_users')
        }

        // Active: last activity within 7 days
        if (lastActive && lastActive >= sevenDaysAgo) {
            segments.push('active')
        }

        // Inactive: no activity in 30+ days
        if (lastActive && lastActive < thirtyDaysAgo) {
            segments.push('inactive')
        }

        // New user: joined within 30 days
        if (profile.created_at >= thirtyDaysAgo) {
            segments.push('new_users')
        }

        // Unopted Desktop: has desktop node but not opted in
        if (unoptedDesktopUserIds.has(profile.user_id)) {
            segments.push('unopted_desktop')
        }

        return {
            id: profile.id,
            user_id: profile.user_id,
            email: authData?.email || null,
            display_name: profile.display_name,
            total_points: profile.total_points,
            last_active: lastActive,
            created_at: profile.created_at,
            segments
        }
    })

    return powerUsers
}

// Get segment counts
export async function getSegmentCounts(): Promise<SegmentStats> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const users = await getPowerUsers()

    return {
        power_users: users.filter(u => u.segments.includes('power_users')).length,
        active: users.filter(u => u.segments.includes('active')).length,
        inactive: users.filter(u => u.segments.includes('inactive')).length,
        new_users: users.filter(u => u.segments.includes('new_users')).length,
        unopted_desktop: users.filter(u => u.segments.includes('unopted_desktop')).length,
        total: users.length
    }
}

// Sync a segment to Resend
export async function syncSegmentToResend(
    segmentName: UserSegment,
    dryRun: boolean = true
): Promise<{
    success: boolean
    usersToSync: number
    syncedCount?: number
    errors?: string[]
    previewUsers?: { email: string; name: string }[]
}> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const users = await getPowerUsers()
    const usersInSegment = users.filter(u =>
        u.segments.includes(segmentName) && u.email
    )

    // Dry run: return preview without syncing
    if (dryRun) {
        return {
            success: true,
            usersToSync: usersInSegment.length,
            previewUsers: usersInSegment.slice(0, 10).map(u => ({
                email: u.email!,
                name: u.display_name
            }))
        }
    }

    // Create or get audience in Resend
    const audience = await getOrCreateAudience(`idleforest_${segmentName}`)
    if (!audience) {
        return {
            success: false,
            usersToSync: usersInSegment.length,
            errors: ['Failed to create/get audience in Resend']
        }
    }

    // Prepare contacts
    const contacts: ResendContact[] = usersInSegment.map(u => ({
        email: u.email!,
        firstName: u.display_name,
        unsubscribed: false
    }))

    // Sync to Resend
    const result = await syncContactsToAudience(contacts, audience.id)

    return {
        success: result.success,
        usersToSync: usersInSegment.length,
        syncedCount: result.synced,
        errors: result.errors.length > 0 ? result.errors : undefined
    }
}

// Create a campaign (broadcast) for a segment
export async function triggerCampaign(
    segmentName: UserSegment,
    subject: string,
    htmlContent: string,
    sendImmediately: boolean = false
): Promise<{ success: boolean; broadcastId?: string; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    // Get or create audience
    const audience = await getOrCreateAudience(`idleforest_${segmentName}`)
    if (!audience) {
        return { success: false, error: 'Failed to get audience from Resend' }
    }

    // Create broadcast
    const result = await resendCreateBroadcast(
        audience.id,
        subject,
        htmlContent,
        'support@idleforest.com'
    )

    if (!result.success || !result.broadcastId) {
        return { success: false, error: result.error || 'Failed to create broadcast' }
    }

    // Optionally send immediately
    if (sendImmediately) {
        const sendResult = await resendSendBroadcast(result.broadcastId)
        if (!sendResult.success) {
            return {
                success: false,
                broadcastId: result.broadcastId,
                error: `Broadcast created but failed to send: ${sendResult.error}`
            }
        }
    }

    return { success: true, broadcastId: result.broadcastId }
}

// Get available Resend audiences
export async function getResendAudiences() {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    return await listAudiences()
}

// Get contacts for an audience
export async function getAudienceContacts(audienceId: string): Promise<ResendContact[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const { success, data, error } = await listContacts(audienceId)

    if (!success || !data) {
        console.error('Error fetching contacts:', error)
        return []
    }

    return data
}

// ========================================
// EMAIL TEMPLATES & SENDING
// ========================================

import { sendEmail as resendSendEmail } from '@/lib/resend'

export interface EmailTemplate {
    id: string
    name: string
    subject: string
    content: string
    from_email: string | null
    created_at: string
}

export interface EmailLog {
    id: string
    user_id: string | null
    email: string
    subject: string
    template_id: string | null
    email_type: 'transactional' | 'broadcast'
    segment: string | null
    broadcast_id: string | null
    status: string
    sent_at: string
    created_at: string
}

// Log an email send to the database
async function logEmail(data: {
    userId?: string
    email: string
    subject: string
    templateId?: string
    emailType: 'transactional' | 'broadcast'
    segment?: string
    broadcastId?: string
    status?: string
}): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from('email_logs').insert({
        user_id: data.userId || null,
        email: data.email,
        subject: data.subject,
        template_id: data.templateId || null,
        email_type: data.emailType,
        segment: data.segment || null,
        broadcast_id: data.broadcastId || null,
        status: data.status || 'sent'
    })

    if (error) {
        console.error('Error logging email:', error)
        // Don't throw - logging failure shouldn't break email sending
    }
}

// Get email history for a specific user
export async function getUserEmailHistory(userId: string): Promise<EmailLog[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching email history:', error)
        return []
    }

    return data || []
}

// Get email history by email address (for users without user_id)
export async function getEmailHistoryByAddress(email: string): Promise<EmailLog[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('email', email)
        .order('sent_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching email history:', error)
        return []
    }

    return data || []
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) return []

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching templates:', error)
        return []
    }

    return data || []
}

export async function createEmailTemplate(name: string, subject: string, content: string, fromEmail?: string) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase
        .from('email_templates')
        .insert({ name, subject, content, from_email: fromEmail || null })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function updateEmailTemplate(id: string, name: string, subject: string, content: string, fromEmail?: string) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase
        .from('email_templates')
        .update({ name, subject, content, from_email: fromEmail || null, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteEmailTemplate(id: string) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function sendUserEmail(
    userId: string,
    email: string,
    subject: string,
    content: string,
    firstName?: string,
    fromEmail?: string,
    templateId?: string
) {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    const supabase = await createClient()

    // Check if user has unsubscribed from transactional emails
    const { data: unsubscribeRecord } = await supabase
        .from('email_logs')
        .select('id')
        .eq('email', email)
        .eq('status', 'unsubscribed')
        .limit(1)
        .maybeSingle()

    if (unsubscribeRecord) {
        // Log skipped send
        await logEmail({
            userId,
            email,
            subject,
            templateId,
            emailType: 'transactional',
            status: 'skipped_unsubscribed'
        })
        throw new Error('User has unsubscribed from emails')
    }

    // Generate signed unsubscribe URL for this recipient
    const { generateUnsubscribeUrl } = await import('@/lib/resend')
    const unsubscribeUrl = await generateUnsubscribeUrl(email)

    // Replace template variables
    const name = firstName || 'there'
    let processedSubject = subject.replace(/\{\{\{FIRST_NAME\}\}\}/g, name)
    let processedContent = content
        .replace(/\{\{\{FIRST_NAME\}\}\}/g, name)
        .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)

    // Send via Resend with optional custom from address
    const result = await resendSendEmail(email, processedSubject, processedContent, fromEmail)

    if (!result.success) {
        // Log failed attempt
        await logEmail({
            userId,
            email,
            subject: processedSubject,
            templateId,
            emailType: 'transactional',
            status: 'failed'
        })
        throw new Error(result.error)
    }

    // Log successful send
    await logEmail({
        userId,
        email,
        subject: processedSubject,
        templateId,
        emailType: 'transactional',
        status: 'sent'
    })

    return { success: true }
}

// Send a broadcast to a segment (syncs users, creates broadcast, sends, and logs)
export async function sendBroadcastToSegment(
    segmentName: UserSegment,
    templateId: string,
    sendImmediately: boolean = true
): Promise<{ success: boolean; broadcastId?: string; sentCount?: number; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    // 1. Get the template
    const supabase = await createClient()
    const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single()

    if (templateError || !template) {
        return { success: false, error: 'Template not found' }
    }

    // 2. First sync the segment to Resend (this ensures audience exists and is up-to-date)
    const syncResult = await syncSegmentToResend(segmentName, false)
    if (!syncResult.success) {
        return { success: false, error: `Failed to sync segment: ${syncResult.errors?.join(', ')}` }
    }

    // 3. Get or create the audience
    const audience = await getOrCreateAudience(`idleforest_${segmentName}`)
    if (!audience) {
        return { success: false, error: 'Failed to get audience' }
    }

    // 4. Create and send the broadcast
    const campaignResult = await triggerCampaign(
        segmentName,
        template.subject,
        template.content,
        sendImmediately
    )

    if (!campaignResult.success) {
        return { success: false, error: campaignResult.error }
    }

    // 5. Log the broadcast for all users in the segment
    const users = await getPowerUsers()
    const usersInSegment = users.filter(u => u.segments.includes(segmentName) && u.email)

    for (const user of usersInSegment) {
        await logEmail({
            userId: user.user_id,
            email: user.email!,
            subject: template.subject,
            templateId: template.id,
            emailType: 'broadcast',
            segment: segmentName,
            broadcastId: campaignResult.broadcastId,
            status: 'sent'
        })
    }

    return {
        success: true,
        broadcastId: campaignResult.broadcastId,
        sentCount: usersInSegment.length
    }
}

// Send a broadcast directly to a Resend audience (for limited audience plans)
export async function sendBroadcastToAudience(
    audienceId: string,
    templateId: string
): Promise<{ success: boolean; broadcastId?: string; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    // 1. Get the template
    const supabase = await createClient()
    const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single()

    if (templateError || !template) {
        return { success: false, error: 'Template not found' }
    }

    // 2. Create the broadcast using Resend
    const { createBroadcast, sendBroadcast } = await import('@/lib/resend')

    const createResult = await createBroadcast(
        audienceId,
        template.subject,
        template.content,
        template.from_email || 'support@idleforest.com',
        template.name // Pass template name for Resend dashboard
    )

    if (!createResult.success || !createResult.broadcastId) {
        return { success: false, error: createResult.error || 'Failed to create broadcast' }
    }

    // 3. Send the broadcast
    const sendResult = await sendBroadcast(createResult.broadcastId)

    if (!sendResult.success) {
        return {
            success: false,
            broadcastId: createResult.broadcastId,
            error: `Broadcast created but failed to send: ${sendResult.error}`
        }
    }

    // 4. Log the broadcast for all contacts in the audience
    try {
        const { listContacts } = await import('@/lib/resend')
        const contactsResult = await listContacts(audienceId)

        if (contactsResult.success && contactsResult.data) {
            const activeContacts = contactsResult.data.filter(c => !c.unsubscribed)

            for (const contact of activeContacts) {
                await logEmail({
                    email: contact.email,
                    subject: template.subject,
                    templateId: template.id,
                    emailType: 'broadcast',
                    broadcastId: createResult.broadcastId,
                    status: 'sent'
                })
            }
        }
    } catch (logError) {
        console.error('Error logging broadcast emails:', logError)
        // Don't fail the operation if logging fails
    }

    return {
        success: true,
        broadcastId: createResult.broadcastId
    }
}
