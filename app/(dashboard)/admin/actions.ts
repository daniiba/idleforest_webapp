'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import chromeStoreData from './chrome-store-data.json'

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
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Profiles (Registered Users)
    const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // 2. New Profiles (Last 30 Days)
    const { count: newProfilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo)

    type ProfileActivity = {
        user_id: string
        created_at: string
        last_seen?: string | null
    }

    const { data: profileActivityData, error: profileActivityError } = await supabase
        .from('profiles')
        .select('user_id, created_at, last_seen')

    if (profileActivityError) {
        console.error('Error fetching profile activity:', profileActivityError)
    }

    const profileActivityRows = (profileActivityData || []) as ProfileActivity[]
    const profileUserIds = profileActivityRows
        .map(profile => profile.user_id)
        .filter((userId): userId is string => Boolean(userId))

    const { data: referralStats } = profileUserIds.length > 0
        ? await supabase
            .from('referral_stats')
            .select('user_id, updated_at')
            .in('user_id', profileUserIds)
        : { data: [] }

    const referralActivityMap = new Map(referralStats?.map(row => [row.user_id, row.updated_at]) || [])
    const authActivityMap = new Map<string, string | null>()

    try {
        const adminClient = createAdminClient()
        let page = 1
        const perPage = 100
        let hasMore = true

        while (hasMore) {
            const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
                page,
                perPage
            })

            if (authError) {
                console.error('Error fetching auth users for 30d activity:', authError)
                break
            }

            const users = authUsers?.users || []
            users.forEach(user => {
                authActivityMap.set(user.id, user.last_sign_in_at || null)
            })
            hasMore = users.length === perPage
            page++
        }
    } catch (error) {
        console.error('Error creating admin client for 30d activity:', error)
    }

    const activeLast30DaysUsersCount = profileActivityRows.filter(profile => {
        const lastActive = profile.last_seen
            || authActivityMap.get(profile.user_id)
            || referralActivityMap.get(profile.user_id)
            || profile.created_at

        return Boolean(lastActive && lastActive >= thirtyDaysAgo)
    }).length

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

    // 5. Active Users (WAU) - use monthly average for ARPU consistency
    // Using wauAvg (monthly average) instead of currentWau (latest snapshot) for accurate ARPU
    const latestMonthData = chromeStoreData.monthlyData[chromeStoreData.monthlyData.length - 1]
    const chromeWauAvg = latestMonthData?.wauAvg || 0
    const chromeWauCurrent = chromeStoreData.totals.currentWau  // Keep for display purposes
    const desktopWau = chromeStoreData.desktopData.length > 0
        ? chromeStoreData.desktopData[chromeStoreData.desktopData.length - 1].wauAvg
        : 0
    const activeUsersCount = chromeWauAvg + desktopWau  // Use avg for ARPU calculations

    // 6. Churn Rate (Extension) - average monthly churn rate
    // Formula: (Total Uninstalls / Total Installs) / Number of Months
    // This gives the average monthly rate at which users uninstall
    const totalInstalls = chromeStoreData.totals.totalInstalls
    const totalUninstalls = chromeStoreData.totals.totalUninstalls
    const numberOfMonths = chromeStoreData.monthlyData.length
    const lifetimeUninstallRate = totalInstalls > 0 ? totalUninstalls / totalInstalls : 0
    const churnRate = numberOfMonths > 0 ? lifetimeUninstallRate / numberOfMonths : 0

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


    // 8. Platform breakdown - calculate revenue distribution based on total_requests per platform
    // Desktop platforms: win32, darwin
    // Extension: everything else (chrome extension IDs)
    const { data: allNodes } = await supabase
        .from('nodes')
        .select('platform, total_requests, opt_in')

    let extensionRequests = 0
    let desktopRequests = 0
    let extensionNodeCount = 0
    let desktopNodeCount = 0
    let desktopOptedOutCount = 0
    let desktopInactiveCount = 0  // nodes with 0 requests

    if (allNodes) {
        for (const node of allNodes) {
            const requests = node.total_requests || 0
            const isDesktop = node.platform === 'win32' || node.platform === 'darwin'
            if (isDesktop) {
                desktopRequests += requests
                desktopNodeCount++
                if (node.opt_in === false) {
                    desktopOptedOutCount++
                }
                if (requests === 0) {
                    desktopInactiveCount++
                }
            } else {
                extensionRequests += requests
                extensionNodeCount++
            }
        }
    }

    // Desktop "churn proxy" - percentage that opted out or are inactive
    const desktopOptOutRate = desktopNodeCount > 0 ? desktopOptedOutCount / desktopNodeCount : 0

    const totalRequests = extensionRequests + desktopRequests
    const extensionRevenueShare = totalRequests > 0 ? extensionRequests / totalRequests : 1
    const desktopRevenueShare = totalRequests > 0 ? desktopRequests / totalRequests : 0

    // Estimated revenue per platform
    const extensionRevenue = monthlyRevenue * extensionRevenueShare
    const desktopRevenue = monthlyRevenue * desktopRevenueShare

    // ARPU per platform (using WAU avg for each)
    const extensionArpu = chromeWauAvg > 0 ? extensionRevenue / chromeWauAvg : 0
    const desktopArpu = desktopWau > 0 ? desktopRevenue / desktopWau : 0

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
        activeLast30DaysUsersCount,
        churnRate,
        // Platform breakdown
        chromeWau: chromeWauAvg,  // Use avg for ARPU calculations
        chromeWauCurrent,          // Latest snapshot for display
        desktopWau,
        extensionNodeCount,
        desktopNodeCount,
        extensionRevenueShare,
        desktopRevenueShare,
        extensionRevenue,
        desktopRevenue,
        extensionArpu,
        desktopArpu,
        desktopOptOutRate  // Desktop "churn proxy" - % of desktop nodes that opted out
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


export type UserSegment = 'power_users' | 'active' | 'inactive' | 'new_users' | 'unopted_desktop' | 'team_owners' | 'extension_no_desktop' | 'profile_no_desktop'

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
    extension_no_desktop: number
    profile_no_desktop: number
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

    // Create sets for desktop-related targeting.
    const unoptedDesktopUserIds = new Set<string>()
    const desktopUserIds = new Set<string>()
    // Logic for extension_no_desktop: "if all nodes that belong to a user have platform Null then its a user without desktop"
    const userNodesMap = new Map<string, { hasDesktop: boolean; hasAnyNode: boolean; allPlatformsNull: boolean }>()

    if (nodes) {
        nodes.forEach(node => {
            if (!node.user_id) return

            // Existing logic for unopted desktop
            if ((node.platform === 'win32' || node.platform === 'darwin') && node.opt_in === false) {
                unoptedDesktopUserIds.add(node.user_id)
            }

            // Logic for extension_no_desktop
            const stats = userNodesMap.get(node.user_id) || { hasDesktop: false, hasAnyNode: true, allPlatformsNull: true }
            const isDesktop = node.platform === 'win32' || node.platform === 'darwin'
            if (isDesktop) {
                stats.hasDesktop = true
                desktopUserIds.add(node.user_id)
            }
            if (node.platform !== null) stats.allPlatformsNull = false
            userNodesMap.set(node.user_id, stats)
        })
    }

    const extensionOnlyUserIds = new Set<string>()
    userNodesMap.forEach((stats, userId) => {
        if (stats.allPlatformsNull && stats.hasAnyNode) {
            extensionOnlyUserIds.add(userId)
        }
    })

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

        // Extension Only: all nodes have platform null
        if (extensionOnlyUserIds.has(profile.user_id)) {
            segments.push('extension_no_desktop')
        }

        // Profile No Desktop: every registered profile that has not connected a Windows/Mac desktop node.
        if (!desktopUserIds.has(profile.user_id)) {
            segments.push('profile_no_desktop')
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
        extension_no_desktop: users.filter(u => u.segments.includes('extension_no_desktop')).length,
        profile_no_desktop: users.filter(u => u.segments.includes('profile_no_desktop')).length,
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

// Sync ALL users with emails to a specific audience (or create idleforest_all_users if none specified)
export async function syncAllUsersToResend(
    audienceId?: string,
    dryRun: boolean = true
): Promise<{
    success: boolean
    usersToSync: number
    syncedCount?: number
    errors?: string[]
    previewUsers?: { email: string; name: string }[]
    audienceName?: string
}> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    // Get all users (not filtered by segment)
    const users = await getPowerUsers()
    const usersWithEmail = users.filter(u => u.email)

    // Dry run: return preview without syncing
    if (dryRun) {
        return {
            success: true,
            usersToSync: usersWithEmail.length,
            previewUsers: usersWithEmail.slice(0, 10).map(u => ({
                email: u.email!,
                name: u.display_name
            })),
            audienceName: audienceId ? undefined : 'idleforest_all_users'
        }
    }

    // Get or create audience
    let targetAudienceId = audienceId
    if (!targetAudienceId) {
        const audience = await getOrCreateAudience('idleforest_all_users')
        if (!audience) {
            return {
                success: false,
                usersToSync: usersWithEmail.length,
                errors: ['Failed to create/get audience in Resend']
            }
        }
        targetAudienceId = audience.id
    }

    // Prepare contacts
    const contacts: ResendContact[] = usersWithEmail.map(u => ({
        email: u.email!,
        firstName: u.display_name,
        unsubscribed: false
    }))

    // Sync to Resend
    const result = await syncContactsToAudience(contacts, targetAudienceId)

    return {
        success: result.success,
        usersToSync: usersWithEmail.length,
        syncedCount: result.synced,
        errors: result.errors.length > 0 ? result.errors : undefined,
        audienceName: audienceId ? undefined : 'idleforest_all_users'
    }
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

// ========================================
// URL METADATA FETCHING FOR REPORTS
// ========================================

export interface UrlMetadata {
    url: string
    title: string
    description: string
    image: string | null
    siteName: string | null
    type: 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'tiktok' | 'blog' | 'other'
    fetchedAt: string
}

// Fetch Open Graph metadata from a URL
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata | null> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) return null

    try {
        // Determine the platform type
        const type = getUrlPlatformType(url)

        // Fetch the page HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error(`Failed to fetch URL: ${response.status}`)
            return {
                url,
                title: url,
                description: '',
                image: null,
                siteName: null,
                type,
                fetchedAt: new Date().toISOString()
            }
        }

        const html = await response.text()

        // Parse Open Graph tags
        const title = extractMetaTag(html, 'og:title') || extractMetaTag(html, 'twitter:title') || extractTitle(html) || url
        const description = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'twitter:description') || extractMetaTag(html, 'description') || ''
        const image = extractMetaTag(html, 'og:image') || extractMetaTag(html, 'twitter:image') || null
        const siteName = extractMetaTag(html, 'og:site_name') || null

        return {
            url,
            title: title.trim(),
            description: description.trim().slice(0, 300),
            image: image ? normalizeImageUrl(image, url) : null,
            siteName,
            type,
            fetchedAt: new Date().toISOString()
        }
    } catch (error) {
        console.error('Error fetching URL metadata:', error)
        return {
            url,
            title: url,
            description: '',
            image: null,
            siteName: null,
            type: getUrlPlatformType(url),
            fetchedAt: new Date().toISOString()
        }
    }
}

// Helper to determine platform type from URL
function getUrlPlatformType(url: string): UrlMetadata['type'] {
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) return 'instagram'
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube'
    if (lowerUrl.includes('linkedin.com')) return 'linkedin'
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter'
    if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) return 'tiktok'
    // Blog detection: common blog platforms or /blog/ in URL
    if (lowerUrl.includes('medium.com') || lowerUrl.includes('substack.com') ||
        lowerUrl.includes('dev.to') || lowerUrl.includes('/blog/') ||
        lowerUrl.includes('hashnode.') || lowerUrl.includes('ghost.io')) return 'blog'
    return 'other'
}

// Extract meta tag content from HTML
function extractMetaTag(html: string, propertyOrName: string): string | null {
    // Try property attribute first (Open Graph)
    const propertyMatch = html.match(new RegExp(`<meta[^>]*property=["']${propertyOrName}["'][^>]*content=["']([^"']*)["']`, 'i'))
    if (propertyMatch) return propertyMatch[1]

    // Try content before property
    const reversePropertyMatch = html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${propertyOrName}["']`, 'i'))
    if (reversePropertyMatch) return reversePropertyMatch[1]

    // Try name attribute (standard meta)
    const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${propertyOrName}["'][^>]*content=["']([^"']*)["']`, 'i'))
    if (nameMatch) return nameMatch[1]

    // Try content before name
    const reverseNameMatch = html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${propertyOrName}["']`, 'i'))
    if (reverseNameMatch) return reverseNameMatch[1]

    return null
}

// Extract title tag
function extractTitle(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return match ? match[1] : null
}

// Normalize relative image URLs to absolute
function normalizeImageUrl(imageUrl: string, baseUrl: string): string {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl
    }
    try {
        const base = new URL(baseUrl)
        return new URL(imageUrl, base.origin).href
    } catch {
        return imageUrl
    }
}

// ========================================
// MARKETING ENTRIES CRUD
// ========================================

// SERP keyword tracking (multi-keyword per entry)
export interface SerpKeyword {
    id: string
    marketing_entry_id: string
    keyword: string
    position: number | null
    snippet: string | null
    last_checked: string | null
    created_at: string
}

export interface MarketingEntry {
    id: string
    url: string
    title: string
    description: string | null
    image_url: string | null
    platform: 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'tiktok' | 'blog' | 'other'
    cost: number | null
    impressions: number | null
    clicks: number | null
    engagement: number | null
    // Engagement breakdown
    likes: number | null
    comments: number | null
    shares: number | null
    views: number | null
    // SERP tracking (legacy single-keyword columns, kept for backward compat)
    serp_keyword: string | null
    serp_position: number | null
    serp_snippet: string | null
    serp_last_checked: string | null
    // Multi-keyword SERP data (populated from serp_keywords table)
    serp_keywords_data?: SerpKeyword[]
    notes: string | null
    month: number
    year: number
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface CreateMarketingEntryInput {
    url: string
    cost?: number | null
    impressions?: number | null
    clicks?: number | null
    engagement?: number | null
    likes?: number | null
    comments?: number | null
    shares?: number | null
    views?: number | null
    serp_keyword?: string | null
    notes?: string | null
    month: number
    year: number
    created_by?: string
}

export interface UpdateMarketingEntryInput {
    url?: string
    title?: string | null
    description?: string | null
    image_url?: string | null
    platform?: MarketingEntry['platform']
    cost?: number | null
    impressions?: number | null
    clicks?: number | null
    engagement?: number | null
    likes?: number | null
    comments?: number | null
    shares?: number | null
    views?: number | null
    serp_keyword?: string | null
    notes?: string | null
    month?: number
    year?: number
}

// Get marketing entries with optional month/year filter (includes SERP keywords)
export async function getMarketingEntries(
    month?: number,
    year?: number
): Promise<MarketingEntry[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    let query = adminClient
        .from('marketing_entries')
        .select('*')
        .order('created_at', { ascending: false })

    if (month !== undefined) {
        query = query.eq('month', month)
    }
    if (year !== undefined) {
        query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching marketing entries:', error)
        return []
    }

    if (!data || data.length === 0) return []

    // Fetch SERP keywords for all entries
    const entryIds = data.map(e => e.id)
    const { data: serpKeywords, error: serpError } = await adminClient
        .from('serp_keywords')
        .select('*')
        .in('marketing_entry_id', entryIds)
        .order('created_at', { ascending: true })

    if (serpError) {
        console.error('Error fetching serp_keywords:', serpError)
    }

    // Group keywords by entry ID
    const keywordsByEntry = new Map<string, SerpKeyword[]>()
    if (serpKeywords) {
        for (const kw of serpKeywords) {
            const list = keywordsByEntry.get(kw.marketing_entry_id) || []
            list.push(kw)
            keywordsByEntry.set(kw.marketing_entry_id, list)
        }
    }

    // Attach keywords to entries
    return data.map(entry => ({
        ...entry,
        serp_keywords_data: keywordsByEntry.get(entry.id) || []
    }))
}

// Create a new marketing entry (auto-fetches metadata from URL)
export async function createMarketingEntry(
    input: CreateMarketingEntryInput
): Promise<{ success: boolean; entry?: MarketingEntry; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    // Auto-fetch metadata from URL
    const metadata = await fetchUrlMetadata(input.url)

    const insertData = {
        url: input.url,
        title: metadata?.title || input.url,
        description: metadata?.description || null,
        image_url: metadata?.image || null,
        platform: metadata?.type || 'other',
        cost: input.cost || null,
        impressions: input.impressions || null,
        clicks: input.clicks || null,
        engagement: input.engagement || null,
        notes: input.notes || null,
        serp_keyword: input.serp_keyword || null,
        month: input.month,
        year: input.year,
        created_by: input.created_by || null
    }

    const { data, error } = await adminClient
        .from('marketing_entries')
        .insert(insertData)
        .select()
        .single()

    if (error) {
        console.error('Error creating marketing entry:', error)
        return { success: false, error: error.message }
    }

    return { success: true, entry: data }
}

// Update an existing marketing entry
export async function updateMarketingEntry(
    id: string,
    input: UpdateMarketingEntryInput
): Promise<{ success: boolean; entry?: MarketingEntry; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    // If URL is being updated, re-fetch metadata
    let updateData: Record<string, unknown> = { ...input }

    if (input.url) {
        const metadata = await fetchUrlMetadata(input.url)
        if (metadata) {
            updateData = {
                ...updateData,
                title: metadata.title,
                description: metadata.description,
                image_url: metadata.image,
                platform: metadata.type
            }
        }
    }

    const { data, error } = await adminClient
        .from('marketing_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating marketing entry:', error)
        return { success: false, error: error.message }
    }

    return { success: true, entry: data }
}

// Delete a marketing entry
export async function deleteMarketingEntry(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
        .from('marketing_entries')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting marketing entry:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Get marketing entries for a date range (for reports)
export async function getMarketingEntriesForReport(
    month: number,
    year: number
): Promise<{
    entries: MarketingEntry[]
    totalCost: number
    totalImpressions: number
    totalClicks: number
    totalEngagement: number
}> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const entries = await getMarketingEntries(month, year)

    const totalCost = entries.reduce((sum, e) => sum + (e.cost || 0), 0)
    const totalImpressions = entries.reduce((sum, e) => sum + (e.impressions || 0), 0)
    const totalClicks = entries.reduce((sum, e) => sum + (e.clicks || 0), 0)
    const totalEngagement = entries.reduce((sum, e) => sum + (e.engagement || 0), 0)

    return {
        entries,
        totalCost,
        totalImpressions,
        totalClicks,
        totalEngagement
    }
}

// ========================================
// OLOSTEP ANALYTICS (Instagram, TikTok, LinkedIn)
// ========================================

interface OlostepStats {
    views: number | null
    likes: number | null
    comments: number | null
    shares: number | null
    title: string | null
}

// Get platform-specific LLM extraction schema
function getOlostepSchemaForPlatform(platform: 'instagram' | 'tiktok' | 'linkedin' | 'other') {
    switch (platform) {
        case 'tiktok':
            return {
                stats: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The post caption text, usually shown below the image/video.'
                        },
                        likes: {
                            type: 'number',
                            description: 'The number next to the heart icon. Extract ONLY the digits associated with likes. If you see 1047 but comments are 7, the likes are likely 104.'
                        },
                        comments: {
                            type: 'number',
                            description: 'The number next to the speech bubble icon.'
                        },
                        bookmarks: {
                            type: 'number',
                            description: 'The number next to the star/bookmark icon.'
                        },
                        shares: {
                            type: 'number',
                            description: 'The number next to the arrow/share icon.'
                        }
                    }
                }

            }

        case 'instagram':
            return {
                stats: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The post caption text, usually shown below the image/video.'
                        },
                        likes: {
                            type: 'number',
                            description: 'The number of likes, often shown as "X likes" below the post.'
                        },
                        comments: {
                            type: 'number',
                            description: 'The number of comments, often shown as "View all X comments".'
                        },
                        views: {
                            type: 'number',
                            description: 'For videos/reels, the view count (shown with play icon or as "X views").'
                        }
                    }
                }
            }

        case 'linkedin':
            return {
                stats: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The main text content of the LinkedIn post.'
                        },
                        reactions: {
                            type: 'number',
                            description: 'The total number of reactions (likes, celebrates, etc.) shown below the post.'
                        },
                        comments: {
                            type: 'number',
                            description: 'The number of comments on the post.'
                        },
                        reposts: {
                            type: 'number',
                            description: 'The number of reposts/shares of the post.'
                        },
                        impressions: {
                            type: 'number',
                            description: 'If visible, the number of impressions/views (sometimes shown to post author).'
                        }
                    }
                }
            }

        default:
            // Generic schema for other platforms
            return {
                stats: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The main title or caption of the content.'
                        },
                        likes: {
                            type: 'number',
                            description: 'The number of likes or reactions.'
                        },
                        comments: {
                            type: 'number',
                            description: 'The number of comments.'
                        },
                        shares: {
                            type: 'number',
                            description: 'The number of shares or reposts.'
                        },
                        views: {
                            type: 'number',
                            description: 'The number of views if available.'
                        }
                    }
                }
            }
    }
}

// Fetch analytics from any social media URL using Olostep's LLM extraction
export async function fetchOlostepStats(url: string): Promise<OlostepStats | null> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const apiKey = process.env.OLOSTEP_API_KEY
    if (!apiKey) {
        console.error('OLOSTEP_API_KEY not configured')
        return null
    }

    // Detect platform from URL
    const lowerUrl = url.toLowerCase()
    const isTikTok = lowerUrl.includes('tiktok.com')
    const isInstagram = lowerUrl.includes('instagram.com')
    const isLinkedIn = lowerUrl.includes('linkedin.com')

    // Determine platform type
    let platform: 'tiktok' | 'instagram' | 'linkedin' | 'other' = 'other'
    if (isTikTok) platform = 'tiktok'
    else if (isInstagram) platform = 'instagram'
    else if (isLinkedIn) platform = 'linkedin'

    // Get platform-specific schema
    const schema = getOlostepSchemaForPlatform(platform)

    try {
        const response = await fetch('https://api.olostep.com/v1/scrapes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url_to_scrape: url,
                formats: ['json'],
                // Force US-based node for consistent results
                country: 'US',
                // TikTok needs longer wait to load video content
                wait_before_scraping: isTikTok ? 10000 : isInstagram ? 5000 : 3000,
                // Use mobile screen for TikTok/Instagram (shows content better)
                screen_size: (isTikTok || isInstagram) ? { screen_type: 'mobile' } : undefined,
                // For TikTok, scroll to ensure content loads
                actions: isTikTok ? [
                    { type: 'wait', milliseconds: 2000 },
                    { type: 'scroll', direction: 'down', amount: 500 }
                ] : undefined,
                llm_extract: { schema }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Olostep API error:', response.status, errorText)
            return null
        }

        const data = await response.json()

        // Log the raw response for debugging
        console.log('Olostep response for', url, ':', JSON.stringify(data.result?.json_content || data.result?.markdown_content?.substring(0, 500)))

        // Parse the JSON content from Olostep response
        if (data.result?.json_content) {
            try {
                const parsed = JSON.parse(data.result.json_content)
                // Olostep might return values at root level OR nested in stats.
                // If stats contains a "type" property, it's the schema, so look at root level instead.
                const hasSchemaInStats = parsed.stats?.type === 'object'
                const stats = hasSchemaInStats ? parsed : (parsed.stats || parsed)

                // Normalize field names based on platform
                // LinkedIn uses: reactions, reposts, impressions
                // TikTok uses: likes, shares, views, bookmarks
                // Instagram uses: likes, comments, views
                const likes = typeof stats.likes === 'number' ? stats.likes :
                    typeof stats.reactions === 'number' ? stats.reactions : null
                const shares = typeof stats.shares === 'number' ? stats.shares :
                    typeof stats.reposts === 'number' ? stats.reposts : null
                const views = typeof stats.views === 'number' ? stats.views :
                    typeof stats.impressions === 'number' ? stats.impressions : null

                return {
                    views,
                    likes,
                    comments: typeof stats.comments === 'number' ? stats.comments : null,
                    shares,
                    title: typeof stats.title === 'string' ? stats.title : null
                }
            } catch (parseError) {
                console.error('Error parsing Olostep JSON:', parseError)
                return null
            }
        }

        return null
    } catch (error) {
        console.error('Error fetching Olostep stats:', error)
        return null
    }
}

// ========================================
// SERP RANKING (Google Search via Olostep)
// ========================================

interface SerpRankingResult {
    position: number | null
    snippet: string | null
    title: string | null
}

// Fetch Google SERP ranking for a URL using Olostep's Google Search parser
export async function fetchSerpRanking(
    keyword: string,
    targetUrl: string
): Promise<SerpRankingResult> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const apiKey = process.env.OLOSTEP_API_KEY
    if (!apiKey) {
        console.error('OLOSTEP_API_KEY not configured')
        return { position: null, snippet: null, title: null }
    }

    try {
        // Use Olostep's @olostep/google-search parser for structured SERP data
        // num=100 ensures we get at least top 50 results
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&gl=us&hl=en&num=100`

        const response = await fetch('https://api.olostep.com/v1/scrapes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url_to_scrape: searchUrl,
                formats: ['json'],
                parser: { id: '@olostep/google-search' },
                wait_before_scraping: 0
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Olostep SERP API error:', response.status, errorText)
            return { position: null, snippet: null, title: null }
        }

        const data = await response.json()

        console.log('Olostep SERP response for keyword:', keyword, 'results count:', data.result?.json_content ? 'found' : 'empty')

        if (data.result?.json_content) {
            const parsed = typeof data.result.json_content === 'string'
                ? JSON.parse(data.result.json_content)
                : data.result.json_content

            const organicResults = parsed.organic || []
            console.log(`SERP: Got ${organicResults.length} organic results for "${keyword}"`)

            // Normalize target URL for matching (remove protocol, www, trailing slash)
            const normalizeUrl = (url: string) =>
                url.toLowerCase()
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .replace(/\/$/, '')

            const normalizedTarget = normalizeUrl(targetUrl)

            // Find the target URL in organic results
            for (const result of organicResults) {
                const normalizedLink = normalizeUrl(result.link || '')
                if (normalizedLink === normalizedTarget || normalizedLink.includes(normalizedTarget) || normalizedTarget.includes(normalizedLink)) {
                    return {
                        position: result.position || null,
                        snippet: result.snippet || null,
                        title: result.title || null
                    }
                }
            }

            // URL not found in results
            console.log(`Target URL not found in SERP results for "${keyword}". Checked ${organicResults.length} results.`)
            return { position: null, snippet: null, title: null }
        }

        return { position: null, snippet: null, title: null }
    } catch (error) {
        console.error('Error fetching SERP ranking:', error)
        return { position: null, snippet: null, title: null }
    }
}

// ========================================
// SERP KEYWORDS CRUD (Multi-keyword per entry)
// ========================================

// Get all SERP keywords for a marketing entry
export async function getSerpKeywords(entryId: string): Promise<SerpKeyword[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('serp_keywords')
        .select('*')
        .eq('marketing_entry_id', entryId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching serp keywords:', error)
        return []
    }
    return data || []
}

// Add a new SERP keyword to a marketing entry and immediately check its ranking
export async function addSerpKeyword(
    entryId: string,
    keyword: string
): Promise<{ success: boolean; keyword?: SerpKeyword; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    // Insert the keyword row
    const { data, error } = await adminClient
        .from('serp_keywords')
        .insert({
            marketing_entry_id: entryId,
            keyword: keyword.trim()
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'This keyword is already being tracked for this entry.' }
        }
        console.error('Error adding serp keyword:', error)
        return { success: false, error: error.message }
    }

    return { success: true, keyword: data }
}

// Remove a SERP keyword
export async function removeSerpKeyword(
    keywordId: string
): Promise<{ success: boolean; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('serp_keywords')
        .delete()
        .eq('id', keywordId)

    if (error) {
        console.error('Error removing serp keyword:', error)
        return { success: false, error: error.message }
    }
    return { success: true }
}

// Refresh SERP rankings for all keywords of a marketing entry
export async function refreshSerpKeywords(
    entryId: string
): Promise<{ success: boolean; results: SerpKeyword[]; errors?: string[] }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    // Get the entry URL
    const { data: entry, error: entryError } = await adminClient
        .from('marketing_entries')
        .select('url')
        .eq('id', entryId)
        .single()

    if (entryError || !entry) {
        return { success: false, results: [], errors: ['Entry not found'] }
    }

    // Get all keywords for this entry
    const keywords = await getSerpKeywords(entryId)
    if (keywords.length === 0) {
        return { success: true, results: [] }
    }

    const updatedResults: SerpKeyword[] = []
    const errors: string[] = []

    // Check each keyword sequentially to avoid rate-limiting
    for (const kw of keywords) {
        try {
            const serpResult = await fetchSerpRanking(kw.keyword, entry.url)

            const { data: updated, error: updateError } = await adminClient
                .from('serp_keywords')
                .update({
                    position: serpResult.position,
                    snippet: serpResult.snippet,
                    last_checked: new Date().toISOString()
                })
                .eq('id', kw.id)
                .select()
                .single()

            if (updateError) {
                errors.push(`Failed to update "${kw.keyword}": ${updateError.message}`)
            } else if (updated) {
                updatedResults.push(updated)
            }

            if (!serpResult.position) {
                errors.push(`URL not found in Google results for "${kw.keyword}".`)
            }
        } catch (err) {
            errors.push(`Error checking "${kw.keyword}": ${err}`)
        }
    }

    return {
        success: true,
        results: updatedResults,
        errors: errors.length > 0 ? errors : undefined
    }
}

// ========================================
// YOUTUBE ANALYTICS
// ========================================

interface YouTubeVideoStats {
    viewCount: number
    likeCount: number
    commentCount: number
    title?: string
    thumbnail?: string
    publishedAt?: string
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

// Fetch YouTube video statistics using Data API
export async function fetchYouTubeStats(url: string): Promise<YouTubeVideoStats | null> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
        console.error('YOUTUBE_API_KEY not configured')
        return null
    }

    const videoId = extractYouTubeVideoId(url)
    if (!videoId) {
        console.error('Could not extract YouTube video ID from URL:', url)
        return null
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${apiKey}`,
            { next: { revalidate: 300 } } // Cache for 5 minutes
        )

        if (!response.ok) {
            console.error('YouTube API error:', response.status, await response.text())
            return null
        }

        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            console.error('Video not found:', videoId)
            return null
        }

        const video = data.items[0]
        const stats = video.statistics
        const snippet = video.snippet

        return {
            viewCount: parseInt(stats.viewCount || '0', 10),
            likeCount: parseInt(stats.likeCount || '0', 10),
            commentCount: parseInt(stats.commentCount || '0', 10),
            title: snippet?.title,
            thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url,
            publishedAt: snippet?.publishedAt
        }
    } catch (error) {
        console.error('Error fetching YouTube stats:', error)
        return null
    }
}

// Refresh analytics for a marketing entry (auto-fetch for supported platforms)
export async function refreshMarketingEntryAnalytics(
    id: string
): Promise<{ success: boolean; entry?: MarketingEntry; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    // First get the entry
    const { data: entry, error: fetchError } = await adminClient
        .from('marketing_entries')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !entry) {
        return { success: false, error: 'Entry not found' }
    }

    // Determine which service to use based on platform
    const platform = entry.platform as MarketingEntry['platform']

    // YouTube: Use free YouTube Data API
    if (platform === 'youtube') {
        const stats = await fetchYouTubeStats(entry.url)
        if (!stats) {
            return { success: false, error: 'Could not fetch YouTube analytics. Check if YOUTUBE_API_KEY is configured.' }
        }

        const { data: updated, error: updateError } = await adminClient
            .from('marketing_entries')
            .update({
                impressions: stats.viewCount,
                views: stats.viewCount,
                likes: stats.likeCount,
                comments: stats.commentCount,
                engagement: stats.likeCount + stats.commentCount,
                title: stats.title || entry.title,
                image_url: stats.thumbnail || entry.image_url
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return { success: false, error: updateError.message }
        }
        return { success: true, entry: updated }
    }

    // Instagram, TikTok, LinkedIn: Use Olostep
    if (platform === 'instagram' || platform === 'tiktok' || platform === 'linkedin') {
        const stats = await fetchOlostepStats(entry.url)
        if (!stats) {
            return { success: false, error: 'Could not fetch analytics. Check if OLOSTEP_API_KEY is configured.' }
        }

        const engagement = (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0)

        const { data: updated, error: updateError } = await adminClient
            .from('marketing_entries')
            .update({
                impressions: stats.views || entry.impressions,
                views: stats.views || entry.views,
                likes: stats.likes || entry.likes,
                comments: stats.comments || entry.comments,
                shares: stats.shares || entry.shares,
                engagement: engagement || entry.engagement,
                title: stats.title || entry.title
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return { success: false, error: updateError.message }
        }
        return { success: true, entry: updated }
    }

    // Blog/Other: SERP ranking via multi-keyword system
    if (platform === 'blog' || platform === 'other') {
        const serpResult = await refreshSerpKeywords(id)

        // Re-fetch the updated entry with keywords
        const { data: updated, error: refetchError } = await adminClient
            .from('marketing_entries')
            .select('*')
            .eq('id', id)
            .single()

        if (refetchError) {
            return { success: false, error: refetchError.message }
        }

        const errorMsg = serpResult.errors?.join('; ')
        return {
            success: true,
            entry: updated,
            error: errorMsg || undefined
        }
    }

    // Twitter, Other: Manual input only
    return {
        success: false,
        error: `Auto-fetch not available for ${platform}. Please enter analytics manually.`
    }
}

// ========================================
// COMPANIES / PORTALS / WIDGETS
// ========================================

export interface CompanyAdmin {
    id: string
    name: string
    website: string | null
    slug: string | null
    description: string | null
    video_url: string | null
    logo_url: string | null
    is_invite_only: boolean
    invite_code: string | null
    theme_color: string | null
    created_at: string
}

export async function getCompaniesAdmin(): Promise<CompanyAdmin[]> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching companies:', error)
        return []
    }
    return data || []
}

export async function createCompanyAdmin(input: {
    name: string
    website?: string
    slug?: string
    description?: string
    video_url?: string
    logo_url?: string
    is_invite_only?: boolean
    invite_code?: string
    theme_color?: string
}): Promise<{ success: boolean; company?: CompanyAdmin; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    // Find the 'daniiba' user to own this company
    const { data: adminUsers } = await adminClient
        .from('profiles')
        .select('user_id')
        .ilike('display_name', 'daniiba')
        .limit(1)

    const creatorId = adminUsers && adminUsers.length > 0 ? adminUsers[0].user_id : null

    if (!creatorId) {
        return { success: false, error: 'Could not find the daniiba user to own this company.' }
    }

    const { data, error } = await adminClient
        .from('companies')
        .insert({
            user_id: creatorId,
            name: input.name,
            website: input.website || null,
            slug: input.slug || null,
            description: input.description || null,
            video_url: input.video_url || null,
            logo_url: input.logo_url || null,
            is_invite_only: input.is_invite_only !== undefined ? input.is_invite_only : true,
            invite_code: input.invite_code || null,
            theme_color: input.theme_color || '#10B981'
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'A company with this slug or invite code already exists.' }
        }
        console.error('Error creating company:', error)
        return { success: false, error: error.message }
    }

    return { success: true, company: data }
}

export async function updateCompanyAdmin(
    id: string,
    input: Partial<CompanyAdmin>
): Promise<{ success: boolean; company?: CompanyAdmin; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
        .from('companies')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'A company with this slug or invite code already exists.' }
        }
        console.error('Error updating company:', error)
        return { success: false, error: error.message }
    }

    return { success: true, company: data }
}

export async function deleteCompanyAdmin(id: string): Promise<{ success: boolean; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('companies')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting company:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// ========================================
// NODE TRANSFER REQUESTS
// ========================================

export type NodeTransferStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface NodeTransferRequestAdmin {
    id: string
    node_identifier: string
    from_user_id: string | null
    to_user_id: string
    reason: string | null
    status: NodeTransferStatus
    created_at: string
    resolved_at: string | null
    resolved_by: string | null
    from_display_name: string | null
    from_email: string | null
    to_display_name: string | null
    to_email: string | null
    node_current_user_id: string | null
    node_platform: string | null
    node_total_requests: number | null
    node_opt_in: boolean | null
}

type RawNodeTransferRequest = {
    id: string
    node_identifier: string
    from_user_id: string | null
    to_user_id: string
    reason: string | null
    status: NodeTransferStatus
    created_at: string
    resolved_at: string | null
    resolved_by: string | null
}

type NodeTransferProfile = {
    user_id: string
    display_name: string | null
}

type NodeTransferNode = {
    node_identifier: string
    user_id: string | null
    platform: string | null
    total_requests: number | null
    opt_in: boolean | null
}

export async function getNodeTransferRequestsAdmin(): Promise<{ requests: NodeTransferRequestAdmin[]; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('node_transfer_requests')
        .select('id, node_identifier, from_user_id, to_user_id, reason, status, created_at, resolved_at, resolved_by')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('Error fetching node transfer requests:', error)
        return { requests: [], error: error.message }
    }

    const requests = (data || []) as RawNodeTransferRequest[]
    const userIds = Array.from(new Set(requests.flatMap(request => [request.from_user_id, request.to_user_id]).filter((id): id is string => Boolean(id))))
    const nodeIdentifiers = Array.from(new Set(requests.map(request => request.node_identifier).filter(Boolean)))

    const profileMap = new Map<string, string | null>()
    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await adminClient
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', userIds)

        if (profilesError) {
            console.error('Error fetching transfer request profiles:', profilesError)
        } else {
            ;((profiles || []) as NodeTransferProfile[]).forEach(profile => {
                profileMap.set(profile.user_id, profile.display_name)
            })
        }
    }

    const emailMap = new Map<string, string | null>()
    await Promise.all(userIds.map(async (userId) => {
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId)
        if (authError) {
            console.error('Error fetching transfer request auth user:', userId, authError)
            emailMap.set(userId, null)
            return
        }
        emailMap.set(userId, authUser.user?.email || null)
    }))

    const nodeMap = new Map<string, NodeTransferNode>()
    if (nodeIdentifiers.length > 0) {
        const { data: nodes, error: nodesError } = await adminClient
            .from('nodes')
            .select('node_identifier, user_id, platform, total_requests, opt_in')
            .in('node_identifier', nodeIdentifiers)

        if (nodesError) {
            console.error('Error fetching transfer request nodes:', nodesError)
        } else {
            ;((nodes || []) as NodeTransferNode[]).forEach(node => {
                nodeMap.set(node.node_identifier, node)
            })
        }
    }

    return {
        requests: requests.map(request => {
            const node = nodeMap.get(request.node_identifier)
            return {
                ...request,
                from_display_name: request.from_user_id ? profileMap.get(request.from_user_id) || null : null,
                from_email: request.from_user_id ? emailMap.get(request.from_user_id) || null : null,
                to_display_name: profileMap.get(request.to_user_id) || null,
                to_email: emailMap.get(request.to_user_id) || null,
                node_current_user_id: node?.user_id || null,
                node_platform: node?.platform || null,
                node_total_requests: node?.total_requests ?? null,
                node_opt_in: node?.opt_in ?? null
            }
        })
    }
}

export async function approveNodeTransferAdmin(requestId: string): Promise<{ success: boolean; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.rpc('approve_node_transfer', { p_request_id: requestId })

    if (error) {
        console.error('Error approving node transfer request:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function rejectNodeTransferAdmin(requestId: string): Promise<{ success: boolean; error?: string }> {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin session required')
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.rpc('reject_node_transfer', { p_request_id: requestId })

    if (error) {
        console.error('Error rejecting node transfer request:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
