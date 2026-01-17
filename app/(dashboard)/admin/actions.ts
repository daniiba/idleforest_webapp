'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Session management
const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_TOKEN = process.env.ADMIN_SESSION_SECRET!

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


export type UserSegment = 'power_users' | 'active' | 'inactive' | 'new_users' | 'unopted_desktop' | 'team_owners'

export interface PowerUser {
    id: string
    user_id: string
    email: string | null
    display_name: string
    total_points: number
    last_active: string | null
    created_at: string
    segments: UserSegment[]
    team_name?: string
}

export interface SegmentStats {
    power_users: number
    active: number
    inactive: number
    new_users: number
    unopted_desktop: number
    team_owners: number
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

    // Fetch team owners with team names
    const { data: teamOwners } = await supabase
        .from('teams')
        .select('created_by, name')

    const teamOwnerMap = new Map(teamOwners?.map(t => [t.created_by, t.name]) || [])
    const teamOwnerIds = new Set(teamOwners?.map(t => t.created_by) || [])

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

        // Team Owner: created a team
        if (teamOwnerIds.has(profile.user_id)) {
            segments.push('team_owners')
        }

        return {
            id: profile.id,
            user_id: profile.user_id,
            email: authData?.email || null,
            display_name: profile.display_name,
            total_points: profile.total_points,
            last_active: lastActive,
            created_at: profile.created_at,
            segments,
            team_name: teamOwnerMap.get(profile.user_id)
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
        team_owners: users.filter(u => u.segments.includes('team_owners')).length,
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

    // Replace {{UNSUBSCRIBE_URL}} with Resend's variable for broadcasts
    const processedContent = htmlContent.replace(
        /\{\{UNSUBSCRIBE_URL\}\}/g,
        '{{{RESEND_UNSUBSCRIBE_URL}}}'
    )

    // Create broadcast
    const result = await resendCreateBroadcast(
        audience.id,
        subject,
        processedContent,
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
    resend_id: string | null
    status: string
    sent_at: string
    created_at: string
    delivered_at: string | null
    opened_at: string | null
    clicked_at: string | null
    bounced_at: string | null
    complained_at: string | null
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
    resendId?: string
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
        resend_id: data.resendId || null,
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

// ========================================
// DYNAMIC EMAIL VARIABLES SYSTEM
// ========================================

export interface EmailVariables {
    // User basics
    FIRST_NAME: string
    DISPLAY_NAME: string
    EMAIL: string
    USER_ID: string

    // User stats
    TOTAL_POINTS: string
    TREES_PLANTED: string

    // Team (if user owns a team)
    TEAM_NAME: string
    TEAM_SLUG: string
    TEAM_MEMBER_COUNT: string

    // URLs
    UNSUBSCRIBE_URL: string
    PROFILE_URL: string
    TEAM_URL: string

    // Misc
    APP_URL: string
}

// Fetch all available variables for a user from Supabase
async function getUserEmailVariables(
    userId: string,
    email: string
): Promise<EmailVariables> {
    const supabase = await createClient()
    const { generateUnsubscribeUrl } = await import('@/lib/resend')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idleforest.com'

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, total_points, username')
        .eq('user_id', userId)
        .single()

    // First, check if user owns a team
    let team: { id: string; name: string; slug: string } | null = null

    const { data: ownedTeam } = await supabase
        .from('teams')
        .select('id, name, slug')
        .eq('created_by', userId)
        .maybeSingle()

    if (ownedTeam) {
        team = ownedTeam
    } else {
        // If not an owner, check if user is a member of a team
        const { data: membership } = await supabase
            .from('team_members')
            .select('team_id, teams(id, name, slug)')
            .eq('user_id', userId)
            .maybeSingle()

        if (membership?.teams) {
            team = membership.teams as unknown as { id: string; name: string; slug: string }
        }
    }

    // Fetch team member count if user has a team
    let teamMemberCount = 0
    if (team) {
        const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
        teamMemberCount = count || 0
    }

    // Debug logging
    console.log('[Email Variables]', {
        userId,
        profileFound: !!profile,
        displayName: profile?.display_name,
        teamFound: !!team,
        teamName: team?.name,
        teamSlug: team?.slug
    })

    // Generate unsubscribe URL
    const unsubscribeUrl = await generateUnsubscribeUrl(email)

    // Calculate trees planted (1 tree per 1000 points)
    const treesPlanted = Math.floor((profile?.total_points || 0) / 1000)

    return {
        // User basics
        FIRST_NAME: profile?.display_name || 'there',
        DISPLAY_NAME: profile?.display_name || 'there',
        EMAIL: email,
        USER_ID: userId,

        // User stats
        TOTAL_POINTS: String(profile?.total_points || 0),
        TREES_PLANTED: String(treesPlanted),

        // Team
        TEAM_NAME: team?.name || '',
        TEAM_SLUG: team?.slug || '',
        TEAM_MEMBER_COUNT: String(teamMemberCount),

        // URLs
        UNSUBSCRIBE_URL: unsubscribeUrl,
        PROFILE_URL: profile?.username ? `${appUrl}/profile/${profile.username}` : appUrl,
        TEAM_URL: team?.slug ? `${appUrl}/teams/${team.slug}` : '',

        // Misc
        APP_URL: appUrl
    }
}

// Replace all template variables in content
function replaceEmailVariables(content: string, variables: EmailVariables): string {
    let result = content

    // Replace each variable - support both {{VAR}} and {{{VAR}}} syntax
    for (const [key, value] of Object.entries(variables)) {
        // Triple braces (Handlebars unescaped)
        result = result.replace(new RegExp(`\\{\\{\\{${key}\\}\\}\\}`, 'g'), value)
        // Double braces
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }

    return result
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

    // Fetch all user variables from database
    const variables = await getUserEmailVariables(userId, email)

    // Override FIRST_NAME if explicitly provided
    if (firstName) {
        variables.FIRST_NAME = firstName
    }

    // Replace all template variables
    const processedSubject = replaceEmailVariables(subject, variables)
    const processedContent = replaceEmailVariables(content, variables)

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

    // Log successful send with Resend ID for tracking
    await logEmail({
        userId,
        email,
        subject: processedSubject,
        templateId,
        emailType: 'transactional',
        resendId: result.emailId,
        status: 'sent'
    })

    return { success: true, emailId: result.emailId }
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

    // 2. Replace {{UNSUBSCRIBE_URL}} with Resend's variable for broadcasts
    const processedContent = template.content.replace(
        /\{\{UNSUBSCRIBE_URL\}\}/g,
        '{{{RESEND_UNSUBSCRIBE_URL}}}'
    )

    // 3. Create the broadcast using Resend
    const { createBroadcast, sendBroadcast } = await import('@/lib/resend')

    const createResult = await createBroadcast(
        audienceId,
        template.subject,
        processedContent,
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

// ========================================
// TEAM OWNER PERSONALIZED EMAILS
// ========================================

export interface TeamOwnerEmailResult {
    success: boolean
    sent: number
    failed: number
    skipped: number
    errors: string[]
}

// Send personalized emails to team owners with team-specific variables
export async function sendTeamOwnerEmails(
    templateId: string,
    dryRun: boolean = true
): Promise<TeamOwnerEmailResult> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Get the template
    const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single()

    if (templateError || !template) {
        return { success: false, sent: 0, failed: 0, skipped: 0, errors: ['Template not found'] }
    }

    // Get all teams with their owners
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, slug, created_by')

    if (teamsError || !teams || teams.length === 0) {
        return { success: false, sent: 0, failed: 0, skipped: 0, errors: ['No teams found'] }
    }

    // Get profiles for team owners
    const ownerIds = teams.map(t => t.created_by)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', ownerIds)

    const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || [])

    // Get emails from auth.users
    let allAuthUsers: any[] = []
    let page = 1
    const perPage = 50
    let hasMore = true

    while (hasMore) {
        const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
            page: page,
            perPage: perPage
        })

        if (authError) break

        if (authUsers?.users) {
            allAuthUsers = [...allAuthUsers, ...authUsers.users]
            if (authUsers.users.length < perPage) {
                hasMore = false
            } else {
                page++
            }
        } else {
            hasMore = false
        }
    }

    const emailMap = new Map(allAuthUsers.map(u => [u.id, u.email]))

    // Dry run: return preview
    if (dryRun) {
        const preview = teams.slice(0, 5).map(team => ({
            teamName: team.name,
            teamSlug: team.slug,
            ownerEmail: emailMap.get(team.created_by) || 'no-email',
            ownerName: profileMap.get(team.created_by) || 'Unknown'
        }))

        return {
            success: true,
            sent: 0,
            failed: 0,
            skipped: teams.length,
            errors: [`DRY RUN: Would send to ${teams.length} team owners. Preview: ${JSON.stringify(preview)}`]
        }
    }

    // Generate unsubscribe URLs and send emails
    const { generateUnsubscribeUrl } = await import('@/lib/resend')

    let sent = 0
    let failed = 0
    let skipped = 0
    const errors: string[] = []

    for (const team of teams) {
        const email = emailMap.get(team.created_by)
        const displayName = profileMap.get(team.created_by) || 'there'

        if (!email) {
            skipped++
            continue
        }

        // Check if user has unsubscribed
        const { data: unsubscribeRecord } = await supabase
            .from('email_logs')
            .select('id')
            .eq('email', email)
            .eq('status', 'unsubscribed')
            .limit(1)
            .maybeSingle()

        if (unsubscribeRecord) {
            skipped++
            continue
        }

        try {
            const unsubscribeUrl = await generateUnsubscribeUrl(email)

            // Replace all template variables
            const processedSubject = template.subject
                .replace(/\{\{\{FIRST_NAME\}\}\}/g, displayName)
                .replace(/\{\{TEAM_NAME\}\}/g, team.name)
                .replace(/\{\{TEAM_SLUG\}\}/g, team.slug)

            const processedContent = template.content
                .replace(/\{\{\{FIRST_NAME\}\}\}/g, displayName)
                .replace(/\{\{TEAM_NAME\}\}/g, team.name)
                .replace(/\{\{TEAM_SLUG\}\}/g, team.slug)
                .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)

            // Send the email
            const result = await resendSendEmail(
                email,
                processedSubject,
                processedContent,
                template.from_email || undefined
            )

            if (result.success) {
                // Log with Resend ID
                await logEmail({
                    userId: team.created_by,
                    email,
                    subject: processedSubject,
                    templateId: template.id,
                    emailType: 'transactional',
                    segment: 'team_owners',
                    resendId: result.emailId,
                    status: 'sent'
                })
                sent++
            } else {
                await logEmail({
                    userId: team.created_by,
                    email,
                    subject: processedSubject,
                    templateId: template.id,
                    emailType: 'transactional',
                    segment: 'team_owners',
                    status: 'failed'
                })
                failed++
                errors.push(`${email}: ${result.error}`)
            }

            // Rate limit: 2 requests per second
            await new Promise(resolve => setTimeout(resolve, 600))
        } catch (error) {
            failed++
            errors.push(`${email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    return {
        success: failed === 0,
        sent,
        failed,
        skipped,
        errors
    }
}

// ========================================
// EMAIL ANALYTICS
// ========================================

export interface EmailStats {
    total: number
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    complained: number
    deliveryRate: number
    openRate: number
    clickRate: number
}

// Get email statistics for a date range
export async function getEmailStats(
    startDate?: string,
    endDate?: string,
    segment?: string
): Promise<EmailStats> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) throw new Error('Unauthorized')

    const supabase = await createClient()

    let query = supabase
        .from('email_logs')
        .select('status, delivered_at, opened_at, clicked_at, bounced_at, complained_at')

    if (startDate) {
        query = query.gte('created_at', startDate)
    }
    if (endDate) {
        query = query.lte('created_at', endDate)
    }
    if (segment) {
        query = query.eq('segment', segment)
    }

    const { data: logs, error } = await query

    if (error || !logs) {
        return {
            total: 0,
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            complained: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0
        }
    }

    const total = logs.length
    const sent = logs.filter(l => l.status === 'sent' || l.status === 'delivered').length
    const delivered = logs.filter(l => l.delivered_at).length
    const opened = logs.filter(l => l.opened_at).length
    const clicked = logs.filter(l => l.clicked_at).length
    const bounced = logs.filter(l => l.bounced_at).length
    const complained = logs.filter(l => l.complained_at).length

    return {
        total,
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        complained,
        deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0
    }
}
