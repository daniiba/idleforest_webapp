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
