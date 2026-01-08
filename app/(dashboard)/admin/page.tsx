'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Area, AreaChart, Bar, CartesianGrid, Line, XAxis, YAxis, ComposedChart, Legend } from 'recharts'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { getAdminStats, getMonthlyRevenueHistory, verifyAdminPassword, verifyAdminSession } from './actions'
import chromeStoreData from './chrome-store-data.json'
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, Target, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'


// Hardcoded Financial Data
const FINANCIAL_DATA = {
    totalCosts: 980.00, // Fixed costs only
    marketingSpent: 100.00, // Actual marketing spent so far (for CAC)
    costBreakdown: [
        { category: 'Tech Fix Fee', amount: 300.00 },
        { category: 'Salary Cost', amount: 680.00 },
    ],
}

// Chart Configs
const wauChartConfig = {
    wauAvg: { label: "Weekly Active Users", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const growthChartConfig = {
    installs: { label: "Installs", color: "hsl(142, 76%, 45%)" },
    uninstalls: { label: "Uninstalls", color: "hsl(0, 72%, 51%)" },
    netGrowth: { label: "Net Growth", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const revenueChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-4))" },
    arpu: { label: "ARPU (€)", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const projectionChartConfig = {
    organicWau: { label: "Organic WAU", color: "hsl(142, 76%, 45%)" },
    paidWau: { label: "+ Paid Users", color: "hsl(217, 91%, 60%)" },
    breakEvenWau: { label: "Break-Even WAU", color: "hsl(0, 72%, 51%)" },
    revenue: { label: "Projected Revenue", color: "hsl(var(--chart-4))" },
    costs: { label: "Monthly Costs", color: "hsl(0, 72%, 51%)" },
} satisfies ChartConfig

const paidGrowthChartConfig = {
    aggressive: { label: "Aggressive", color: "hsl(0, 72%, 51%)" },
    moderate: { label: "Moderate", color: "hsl(45, 93%, 47%)" },
    conservative: { label: "Conservative", color: "hsl(142, 76%, 45%)" },
} satisfies ChartConfig

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [stats, setStats] = useState<{
        profilesCount: number,
        newProfilesCount: number,
        nodesCount: number,
        anonymousNodesCount: number,
        monthlyRevenue: number,
        totalRevenue: number,
        totalUsersCount: number,
        newTotalUsersCount: number,
        activeUsersCount: number,
        churnRate: number
    } | null>(null)
    const [revenueHistory, setRevenueHistory] = useState<{ month: string; earnings: number; revenue: number }[]>([])
    const [showDetails, setShowDetails] = useState(false)

    const [isVerifying, setIsVerifying] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    // Check for existing session on mount (server-side cookie check)
    useEffect(() => {
        verifyAdminSession().then((isValid) => {
            setIsAuthenticated(isValid)
            setIsCheckingSession(false)
        }).catch(() => {
            setIsCheckingSession(false)
        })
    }, [])

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsVerifying(true)
        setPasswordError('')

        try {
            const isValid = await verifyAdminPassword(password)
            if (isValid) {
                setIsAuthenticated(true)
            } else {
                setPasswordError('Incorrect password')
                setPassword('')
            }
        } catch (error) {
            setPasswordError('Error verifying password')
        } finally {
            setIsVerifying(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) return
        getAdminStats().then((data) => {
            setStats(data)
        }).catch(err => console.error('Error fetching stats:', err))

        getMonthlyRevenueHistory().then((data) => {
            setRevenueHistory(data)
        }).catch(err => console.error('Error fetching revenue history:', err))
    }, [isAuthenticated])

    // Loading state while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen bg-brand-gray flex items-center justify-center p-6 font-rethink-sans">
                <div className="text-black font-bold">Checking session...</div>
            </div>
        )
    }

    // Password Gate
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-brand-gray flex items-center justify-center p-6 font-rethink-sans">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-brand-yellow border-2 border-black p-3">
                            <Lock className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold font-candu uppercase tracking-tight text-black">Admin Access</h1>
                            <p className="text-sm text-neutral-600">Enter password to continue</p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full px-4 py-3 border-2 border-black bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                                autoFocus
                            />
                        </div>
                        {passwordError && (
                            <p className="text-red-600 text-sm font-semibold">{passwordError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-3 font-bold uppercase tracking-wider text-black hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            {isVerifying ? 'Verifying...' : 'Unlock Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (!stats) return <div className="p-8">Loading stats...</div>

    // Metrics Calculations
    const arpu = stats.activeUsersCount > 0 ? (stats.monthlyRevenue / stats.activeUsersCount) : 0
    const churnRate = stats.churnRate
    const ltv = churnRate > 0 ? (arpu / churnRate) : (arpu * 12)
    const profit = stats.monthlyRevenue - FINANCIAL_DATA.totalCosts

    // CAC calculation based on actual marketing spend
    const cac = stats.totalUsersCount > 0 ? (FINANCIAL_DATA.marketingSpent / stats.totalUsersCount) : 0
    const ltvCacRatio = cac > 0 ? (ltv / cac) : Infinity

    // Target CAC based on 3x LTV/CAC rule
    const targetMaxCac = ltv / 3

    // Monthly revenue per WAU - merge actual revenue with WAU data
    const monthlyMetricsData = chromeStoreData.monthlyData.map((m) => {
        const revenueData = revenueHistory.find(r => r.month === m.month)
        const actualRevenue = revenueData?.revenue || 0
        const actualArpu = m.wauAvg > 0 ? (actualRevenue / m.wauAvg) : 0
        return {
            ...m,
            revenue: Math.round(actualRevenue * 100) / 100,
            arpu: Math.round(actualArpu * 100) / 100
        }
    })

    // Year-end projections for profitability
    const currentMonthlyRevenue = stats.monthlyRevenue
    const currentWau = chromeStoreData.totals.currentWau
    const targetProfitability = FINANCIAL_DATA.totalCosts
    const revenueGap = targetProfitability - currentMonthlyRevenue
    const requiredWauForProfitability = arpu > 0 ? Math.ceil(targetProfitability / arpu) : 0
    const wauGrowthNeeded = requiredWauForProfitability - currentWau

    // === 2026 PROJECTIONS ===

    // Calculate actual organic growth rate from last 6 months (Jul-Dec 2025)
    const recentMonths = chromeStoreData.monthlyData.slice(-6)
    const avgMonthlyNetGrowth = recentMonths.reduce((sum, m) => sum + m.netGrowth, 0) / recentMonths.length
    const organicGrowthRate = currentWau > 0 ? avgMonthlyNetGrowth / currentWau : 0.05

    // Calculate actual ARPU trend from actual data
    const revenueWithData = monthlyMetricsData.filter(m => m.revenue > 0 && m.arpu > 0)

    // Calculate ARPU growth rate from historical month-over-month changes
    let arpuGrowthRate = 0.02 // Default fallback
    if (revenueWithData.length >= 2) {
        // Calculate MoM growth rates for each consecutive month pair
        const momGrowthRates: number[] = []
        for (let i = 1; i < revenueWithData.length; i++) {
            const prevArpu = revenueWithData[i - 1].arpu
            const currArpu = revenueWithData[i].arpu
            if (prevArpu > 0) {
                const growthRate = (currArpu - prevArpu) / prevArpu
                momGrowthRates.push(growthRate)
            }
        }

        if (momGrowthRates.length > 0) {
            // Use average of recent MoM growth rates (weighted toward recent)
            // Give more weight to recent months
            let weightedSum = 0
            let weightTotal = 0
            for (let i = 0; i < momGrowthRates.length; i++) {
                const weight = i + 1 // More recent months get higher weight
                weightedSum += momGrowthRates[i] * weight
                weightTotal += weight
            }
            arpuGrowthRate = weightedSum / weightTotal
        }
    }

    // Use the most recent ARPU as starting point for projections
    const currentArpu = revenueWithData.length > 0
        ? revenueWithData[revenueWithData.length - 1].arpu
        : arpu

    // Generate 12-month 2026 projections (organic only)
    const projection2026 = []
    let projectedWau = currentWau
    let projectedArpu = currentArpu > 0 ? currentArpu : arpu

    // ARPU ceiling - realistic maximum based on bandwidth monetization limits
    // Typical mellowtel ARPU caps around €1.50-2.50/user/month at maturity
    const ARPU_CEILING = 2.00

    const months2026 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 0; i < 12; i++) {
        // Organic growth with observed rate
        const organicGrowth = Math.round(projectedWau * organicGrowthRate)
        projectedWau += organicGrowth

        // ARPU growth with diminishing returns as it approaches ceiling
        // Growth rate tapers to near 0 as ARPU approaches ceiling
        const distanceToCeiling = Math.max(0, ARPU_CEILING - projectedArpu)
        const ceilingFactor = distanceToCeiling / ARPU_CEILING // 1 when far from ceiling, 0 at ceiling
        const adjustedGrowthRate = arpuGrowthRate * ceilingFactor
        projectedArpu = Math.min(ARPU_CEILING, projectedArpu * (1 + adjustedGrowthRate))

        const projectedRevenue = projectedWau * projectedArpu
        const breakEvenWau = projectedArpu > 0 ? FINANCIAL_DATA.totalCosts / projectedArpu : 0

        projection2026.push({
            month: months2026[i],
            organicWau: Math.round(projectedWau),
            revenue: Math.round(projectedRevenue * 100) / 100,
            costs: FINANCIAL_DATA.totalCosts,
            breakEvenWau: Math.round(breakEvenWau),
            arpu: Math.round(projectedArpu * 100) / 100,
            profit: Math.round((projectedRevenue - FINANCIAL_DATA.totalCosts) * 100) / 100,
            gapToBreakEven: Math.round(breakEvenWau) - Math.round(projectedWau)
        })
    }

    // === PAID GROWTH SCENARIOS ===
    // Calculate how much paid acquisition is needed to hit break-even by different months

    const paidGrowthScenarios = []
    const targetMonths = [3, 6, 9, 12] // Q1, Q2, Q3, Q4

    for (const targetMonth of targetMonths) {
        const targetProjection = projection2026[targetMonth - 1]
        if (!targetProjection) continue

        const organicWauAtTarget = targetProjection.organicWau
        const breakEvenWauAtTarget = targetProjection.breakEvenWau
        const paidUsersNeeded = Math.max(0, breakEvenWauAtTarget - organicWauAtTarget)

        // Calculate budget needed at different CACs
        const cac05 = paidUsersNeeded * 0.50  // €0.50 CAC (aggressive)
        const cac1 = paidUsersNeeded * 1.00   // €1.00 CAC (moderate)
        const cac2 = paidUsersNeeded * 2.00   // €2.00 CAC (conservative)

        // Monthly budget spread
        const monthlyBudget05 = cac05 / targetMonth
        const monthlyBudget1 = cac1 / targetMonth
        const monthlyBudget2 = cac2 / targetMonth

        paidGrowthScenarios.push({
            targetMonth: months2026[targetMonth - 1],
            targetQuarter: `Q${Math.ceil(targetMonth / 3)}`,
            organicWau: organicWauAtTarget,
            breakEvenWau: breakEvenWauAtTarget,
            paidUsersNeeded,
            budgetCac05: Math.round(cac05),
            budgetCac1: Math.round(cac1),
            budgetCac2: Math.round(cac2),
            monthlyBudget05: Math.round(monthlyBudget05),
            monthlyBudget1: Math.round(monthlyBudget1),
            monthlyBudget2: Math.round(monthlyBudget2),
        })
    }

    // Generate month-by-month paid growth chart data
    const paidGrowthChartData = projection2026.map((p, idx) => {
        const paidNeeded = Math.max(0, p.breakEvenWau - p.organicWau)
        return {
            month: p.month,
            organicWau: p.organicWau,
            breakEvenWau: p.breakEvenWau,
            paidNeeded,
            totalWithPaid: p.organicWau + paidNeeded,
            // Cumulative budget needed at different CACs
            budgetCac1: paidNeeded * 1.00,
        }
    })

    // Break-even month (when organic catches up)
    const breakEvenMonthIdx = projection2026.findIndex(p => p.profit >= 0)
    const breakEvenMonthName = breakEvenMonthIdx >= 0 ? months2026[breakEvenMonthIdx] : 'Not in 2026'
    const organicBreakEvenPossible = breakEvenMonthIdx >= 0

    return (
        <div className="min-h-screen bg-brand-gray p-6 md:p-8 py-24 mt-32 font-rethink-sans">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold font-candu uppercase tracking-tight text-black">Admin Dashboard</h1>
                            <p className="text-sm text-neutral-600 mt-1">Business metrics & analytics</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Revenue</div>
                                <div className="text-2xl font-extrabold font-candu text-green-600">€{stats.totalRevenue.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Marketing Spent</div>
                                <div className="text-2xl font-extrabold font-candu text-black">€{FINANCIAL_DATA.marketingSpent}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="real-data" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-1 h-auto">
                        <TabsTrigger value="real-data" className="rounded-none font-bold uppercase text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">📊 Real Data</TabsTrigger>
                        <TabsTrigger value="projections" className="rounded-none font-bold uppercase text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">🔮 2026 Projections</TabsTrigger>
                    </TabsList>

                    <TabsContent value="real-data" className="space-y-6 mt-6">
                        {/* Key Metrics - Primary Focus */}
                        <section>
                            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-candu uppercase text-black">
                                <Activity className="h-5 w-5 text-brand-navy" />
                                Key Metrics
                            </h2>
                            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-brand-navy" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Users</p>
                                    </div>
                                    <div className="text-3xl font-extrabold font-candu text-black">{stats.totalUsersCount}</div>
                                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1 font-semibold">
                                        <TrendingUp className="h-3 w-3" />
                                        +{stats.newTotalUsersCount} this month
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-4 w-4 text-brand-navy" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Weekly Active</p>
                                    </div>
                                    <div className="text-3xl font-extrabold font-candu text-black">{currentWau}</div>
                                    <p className="text-sm text-neutral-600 mt-1">Peak: {chromeStoreData.totals.peakWau}</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-brand-navy" />
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Monthly Revenue</p>
                                    </div>
                                    <div className="text-3xl font-extrabold font-candu text-black">€{stats.monthlyRevenue.toFixed(2)}</div>
                                    <p className="text-sm text-neutral-600 mt-1">From mellowtel</p>
                                </div>
                                <div className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 ${profit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {profit >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Monthly Profit</p>
                                    </div>
                                    <div className={`text-3xl font-extrabold font-candu ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        €{profit.toFixed(2)}
                                    </div>
                                    <p className="text-sm text-neutral-600 mt-1">vs €{FINANCIAL_DATA.totalCosts} costs</p>
                                </div>
                            </div>
                        </section>

                        {/* Unit Economics */}
                        <section>
                            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-candu uppercase text-black">
                                <Target className="h-5 w-5 text-brand-navy" />
                                Unit Economics
                            </h2>
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">CAC</div>
                                    <div className={`text-2xl font-extrabold font-candu ${cac <= targetMaxCac ? 'text-green-600' : 'text-yellow-600'}`}>
                                        €{cac.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-neutral-600 mt-1">€{FINANCIAL_DATA.marketingSpent} / {stats.totalUsersCount}</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Target CAC</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">€{targetMaxCac.toFixed(2)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">LTV / 3</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">LTV</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">€{ltv.toFixed(2)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">ARPU / Churn</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">LTV/CAC</div>
                                    <div className={`text-2xl font-extrabold font-candu ${ltvCacRatio >= 3 ? 'text-green-600' : ltvCacRatio >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {ltvCacRatio === Infinity ? '∞' : `${ltvCacRatio.toFixed(1)}x`}
                                    </div>
                                    <p className="text-xs text-neutral-600 mt-1">Target: 3x+</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">ARPU</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">€{arpu.toFixed(2)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">Per active user</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Churn</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">{(churnRate * 100).toFixed(1)}%</div>
                                    <p className="text-xs text-neutral-600 mt-1">Monthly</p>
                                </div>
                            </div>
                        </section>

                        {/* Path to Profitability - Highlighted */}
                        {profit < 0 && (
                            <div className="bg-brand-yellow border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
                                <h3 className="text-xl font-extrabold font-candu uppercase mb-2 text-black flex items-center gap-2">
                                    🎯 Path to Profitability
                                </h3>
                                <p className="text-sm text-neutral-700 mb-4">Break even at €{FINANCIAL_DATA.totalCosts}/month costs</p>
                                <div className="grid gap-4 md:grid-cols-3 mb-4">
                                    <div className="p-4 bg-white border-2 border-black">
                                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Current Revenue</div>
                                        <div className="text-2xl font-extrabold font-candu mt-1 text-black">€{currentMonthlyRevenue.toFixed(2)}</div>
                                    </div>
                                    <div className="p-4 bg-red-100 border-2 border-black">
                                        <div className="text-xs font-bold uppercase tracking-wider text-red-600">Gap to Break Even</div>
                                        <div className="text-2xl font-extrabold font-candu text-red-600 mt-1">€{revenueGap.toFixed(2)}</div>
                                    </div>
                                    <div className="p-4 bg-white border-2 border-black">
                                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">WAU Needed</div>
                                        <div className="text-2xl font-extrabold font-candu text-black mt-1">{requiredWauForProfitability.toLocaleString()}</div>
                                        <p className="text-xs text-neutral-600">+{wauGrowthNeeded.toLocaleString()} more</p>
                                    </div>
                                </div>
                                <div className="text-sm text-neutral-700 space-y-1">
                                    <p>📈 <strong>Grow WAU:</strong> Need {requiredWauForProfitability.toLocaleString()} WAU at €{arpu.toFixed(2)} ARPU</p>
                                    <p>💰 <strong>Increase ARPU:</strong> Need €{(FINANCIAL_DATA.totalCosts / currentWau).toFixed(2)} ARPU at current {currentWau} WAU</p>
                                    <p>✂️ <strong>Cut Costs:</strong> Reduce to €{currentMonthlyRevenue.toFixed(2)}/month</p>
                                </div>
                            </div>
                        )}

                        {/* Charts - 2 Column Grid */}
                        <section>
                            <h2 className="text-xl font-extrabold mb-4 font-candu uppercase text-black">Growth Trends</h2>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-1">Weekly Active Users</h3>
                                    <p className="text-xs text-neutral-600 mb-4">
                                        {chromeStoreData.yearOverYear.startWau} → {chromeStoreData.yearOverYear.endWau} ({chromeStoreData.yearOverYear.wauGrowth})
                                    </p>
                                    <ChartContainer config={wauChartConfig} className="h-[200px] w-full">
                                        <AreaChart data={chromeStoreData.monthlyData} margin={{ left: 0, right: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tickFormatter={(v) => v.replace(' 2025', '').slice(0, 3)} fontSize={11} />
                                            <YAxis fontSize={11} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Area
                                                type="monotone"
                                                dataKey="wauAvg"
                                                stroke="var(--color-wauAvg)"
                                                fill="var(--color-wauAvg)"
                                                fillOpacity={0.3}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </div>

                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-1">Acquisition & Churn</h3>
                                    <p className="text-xs text-neutral-600 mb-4">
                                        {chromeStoreData.totals.totalInstalls} installs, {chromeStoreData.totals.totalUninstalls} uninstalls ({chromeStoreData.totals.netUsers} net)
                                    </p>
                                    <ChartContainer config={growthChartConfig} className="h-[200px] w-full">
                                        <ComposedChart data={chromeStoreData.monthlyData} margin={{ left: 0, right: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tickFormatter={(v) => v.replace(' 2025', '').slice(0, 3)} fontSize={11} />
                                            <YAxis fontSize={11} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend wrapperStyle={{ fontSize: 11 }} />
                                            <Bar dataKey="installs" fill="var(--color-installs)" radius={2} />
                                            <Bar dataKey="uninstalls" fill="var(--color-uninstalls)" radius={2} />
                                            <Line type="monotone" dataKey="netGrowth" stroke="var(--color-netGrowth)" strokeWidth={2} />
                                        </ComposedChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </section>

                        {/* Revenue Chart */}
                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h3 className="text-base font-bold text-black mb-1">Revenue & ARPU Trend</h3>
                            <p className="text-xs text-neutral-600 mb-4">Monthly revenue and ARPU per WAU</p>
                            <ChartContainer config={revenueChartConfig} className="h-[200px] w-full">
                                <ComposedChart data={monthlyMetricsData} margin={{ left: 0, right: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tickFormatter={(v) => v.replace(' 2025', '').slice(0, 3)} fontSize={11} />
                                    <YAxis yAxisId="left" orientation="left" fontSize={11} />
                                    <YAxis yAxisId="right" orientation="right" fontSize={11} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar yAxisId="left" dataKey="revenue" name="Revenue (€)" fill="var(--color-revenue)" radius={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="arpu" name="ARPU (€)" stroke="var(--color-arpu)" strokeWidth={2} dot={{ r: 3 }} />
                                </ComposedChart>
                            </ChartContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="projections" className="space-y-6 mt-6">
                        {/* 2026 PROJECTIONS SECTION */}
                        <section className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <h2 className="text-xl font-extrabold flex items-center gap-2 font-candu uppercase text-black">
                                    🔮 2026 Projections
                                </h2>
                                <div className="text-sm text-neutral-600">
                                    Based on {(organicGrowthRate * 100).toFixed(1)}% monthly organic growth | €{currentArpu.toFixed(2)} ARPU (+{(arpuGrowthRate * 100).toFixed(1)}%/mo)
                                </div>
                            </div>

                            {/* Key Projection Metrics */}
                            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                <div className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 ${organicBreakEvenPossible ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Organic Break-Even</div>
                                    <div className={`text-2xl font-extrabold font-candu ${organicBreakEvenPossible ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {breakEvenMonthName}
                                    </div>
                                    <p className="text-xs text-neutral-600 mt-1">
                                        {organicBreakEvenPossible ? '✓ Achievable organically' : '⚠ Needs paid growth'}
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Dec 2026 WAU (Organic)</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">{projection2026[11]?.organicWau.toLocaleString()}</div>
                                    <p className="text-xs text-neutral-600 mt-1">
                                        vs {projection2026[11]?.breakEvenWau.toLocaleString()} needed
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Dec 2026 Revenue</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">€{projection2026[11]?.revenue.toFixed(0)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">
                                        Profit: <span className={projection2026[11]?.profit >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                            €{projection2026[11]?.profit.toFixed(0)}
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Users Gap (Dec)</div>
                                    <div className={`text-2xl font-extrabold font-candu ${projection2026[11]?.gapToBreakEven <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {projection2026[11]?.gapToBreakEven > 0 ? '+' : ''}{projection2026[11]?.gapToBreakEven.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-neutral-600 mt-1">Paid users needed to break even</p>
                                </div>
                            </div>

                            {/* Organic vs Break-Even WAU Chart */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                <h3 className="text-base font-bold text-black mb-1">2026 Organic Growth vs Break-Even Target</h3>
                                <p className="text-xs text-neutral-600 mb-4">
                                    Green = Projected organic WAU | Red line = WAU needed for break-even | Blue = Paid users needed to fill gap
                                </p>
                                <ChartContainer config={projectionChartConfig} className="h-[280px] w-full">
                                    <ComposedChart data={paidGrowthChartData} margin={{ left: 0, right: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" fontSize={11} />
                                        <YAxis fontSize={11} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="organicWau" name="Organic WAU" stackId="wau" fill="var(--color-organicWau)" radius={[0, 0, 2, 2]} />
                                        <Bar dataKey="paidNeeded" name="Paid Users Needed" stackId="wau" fill="var(--color-paidWau)" radius={[2, 2, 0, 0]} />
                                        <Line type="monotone" dataKey="breakEvenWau" name="Break-Even WAU" stroke="var(--color-breakEvenWau)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    </ComposedChart>
                                </ChartContainer>
                            </div>

                            {/* Paid Acquisition Scenarios Table */}
                            <div className="bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                                    💰 Paid Acquisition Scenarios
                                </h3>
                                <p className="text-xs text-neutral-700 mb-4">
                                    Budget needed at different CAC levels to hit break-even by target quarter
                                </p>
                                <div className="overflow-x-auto bg-white border-2 border-black">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black">
                                                <TableHead className="text-xs font-bold">Target</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Organic WAU</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Break-Even</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Paid Needed</TableHead>
                                                <TableHead className="text-right text-xs font-bold text-green-600">€0.50 CAC</TableHead>
                                                <TableHead className="text-right text-xs font-bold text-yellow-600">€1.00 CAC</TableHead>
                                                <TableHead className="text-right text-xs font-bold text-red-600">€2.00 CAC</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paidGrowthScenarios.map((scenario) => (
                                                <TableRow key={scenario.targetQuarter} className="border-b border-neutral-200">
                                                    <TableCell className="font-bold text-xs py-2">
                                                        {scenario.targetQuarter} ({scenario.targetMonth})
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs py-2">{scenario.organicWau.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-xs py-2">{scenario.breakEvenWau.toLocaleString()}</TableCell>
                                                    <TableCell className={`text-right text-xs py-2 font-semibold ${scenario.paidUsersNeeded === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                                        {scenario.paidUsersNeeded === 0 ? '✓ 0' : `+${scenario.paidUsersNeeded.toLocaleString()}`}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs py-2">
                                                        <div className="text-green-600 font-semibold">€{scenario.budgetCac05.toLocaleString()}</div>
                                                        <div className="text-neutral-500 text-[10px]">€{scenario.monthlyBudget05}/mo</div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs py-2">
                                                        <div className="text-yellow-600 font-semibold">€{scenario.budgetCac1.toLocaleString()}</div>
                                                        <div className="text-neutral-500 text-[10px]">€{scenario.monthlyBudget1}/mo</div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs py-2">
                                                        <div className="text-red-600 font-semibold">€{scenario.budgetCac2.toLocaleString()}</div>
                                                        <div className="text-neutral-500 text-[10px]">€{scenario.monthlyBudget2}/mo</div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="mt-4 text-xs text-neutral-700 space-y-1 border-t border-black pt-3">
                                    <p><strong>📊 How to read:</strong> Each row shows what&apos;s needed to hit break-even by that quarter.</p>
                                    <p><strong>💡 Recommendation:</strong> Start with €{paidGrowthScenarios[0]?.monthlyBudget1 || 0}/mo testing at €1 CAC target. Optimize down to €0.50 CAC before scaling.</p>
                                </div>
                            </div>

                            {/* Monthly Projection Table (Detailed) */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                <h3 className="text-base font-bold text-black mb-1">Monthly 2026 Projection</h3>
                                <p className="text-xs text-neutral-600 mb-4">
                                    Detailed month-by-month forecast based on current trends
                                </p>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black">
                                                <TableHead className="text-xs font-bold">Month</TableHead>
                                                <TableHead className="text-right text-xs font-bold">WAU</TableHead>
                                                <TableHead className="text-right text-xs font-bold">ARPU</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Revenue</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Costs</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Profit</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Break-Even Gap</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {projection2026.map((p) => (
                                                <TableRow key={p.month} className={p.profit >= 0 ? 'bg-green-100' : ''}>
                                                    <TableCell className="font-bold text-xs py-2">{p.month}</TableCell>
                                                    <TableCell className="text-right text-xs py-2">{p.organicWau.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-xs py-2">€{p.arpu}</TableCell>
                                                    <TableCell className="text-right text-xs py-2 text-green-600 font-semibold">€{p.revenue}</TableCell>
                                                    <TableCell className="text-right text-xs py-2 text-red-600">€{p.costs}</TableCell>
                                                    <TableCell className={`text-right text-xs py-2 font-semibold ${p.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        €{p.profit}
                                                    </TableCell>
                                                    <TableCell className={`text-right text-xs py-2 ${p.gapToBreakEven <= 0 ? 'text-green-600 font-semibold' : 'text-neutral-600'}`}>
                                                        {p.gapToBreakEven <= 0 ? '✓ Profitable' : `+${p.gapToBreakEven} users`}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </section>
                    </TabsContent>
                </Tabs>

                {/* Detailed Breakdown - Available in both views */}
                <div className="mt-6">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black hover:text-brand-navy transition-colors bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-3 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none"
                    >
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {showDetails ? 'Hide' : 'Show'} Detailed Breakdown
                    </button>

                    {showDetails && (
                        <div className="mt-4 space-y-4">
                            {/* Cost Breakdown & Database Stats Side by Side */}
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-1">Fixed Monthly Costs</h3>
                                    <p className="text-xs text-neutral-600 mb-4">€{FINANCIAL_DATA.totalCosts}/month total</p>
                                    <Table>
                                        <TableBody>
                                            {FINANCIAL_DATA.costBreakdown.map((cost) => (
                                                <TableRow key={cost.category} className="border-b border-neutral-200">
                                                    <TableCell className="font-bold py-2">{cost.category}</TableCell>
                                                    <TableCell className="text-right py-2">€{cost.amount.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right text-neutral-500 py-2">
                                                        {(cost.amount / FINANCIAL_DATA.totalCosts * 100).toFixed(0)}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="font-bold border-t-2 border-black">
                                                <TableCell className="py-2">Total</TableCell>
                                                <TableCell className="text-right py-2">€{FINANCIAL_DATA.totalCosts.toFixed(2)}</TableCell>
                                                <TableCell className="text-right py-2">100%</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-1">Database Stats</h3>
                                    <p className="text-xs text-neutral-600 mb-4">Live from Supabase</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Profiles</div>
                                            <div className="text-xl font-extrabold font-candu text-black">{stats.profilesCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Nodes</div>
                                            <div className="text-xl font-extrabold font-candu text-black">{stats.nodesCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Anonymous</div>
                                            <div className="text-xl font-extrabold font-candu text-black">{stats.anonymousNodesCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">New (30d)</div>
                                            <div className="text-xl font-extrabold font-candu text-green-600">+{stats.newProfilesCount}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Breakdown */}
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                <h3 className="text-base font-bold text-black mb-1">Monthly Metrics</h3>
                                <p className="text-xs text-neutral-600 mb-4">Historical data</p>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black">
                                                <TableHead className="text-xs font-bold">Month</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Installs</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Uninstalls</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Net</TableHead>
                                                <TableHead className="text-right text-xs font-bold">WAU</TableHead>
                                                <TableHead className="text-right text-xs font-bold">Retention</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {chromeStoreData.monthlyData.map((m) => {
                                                const retention = m.installs > 0 ? ((m.installs - m.uninstalls) / m.installs * 100) : 0
                                                return (
                                                    <TableRow key={m.month} className="border-b border-neutral-200">
                                                        <TableCell className="font-bold text-xs py-2">{m.month.replace(' 2025', '')}</TableCell>
                                                        <TableCell className="text-right text-green-600 text-xs py-2 font-semibold">+{m.installs}</TableCell>
                                                        <TableCell className="text-right text-red-600 text-xs py-2">-{m.uninstalls}</TableCell>
                                                        <TableCell className={`text-right font-semibold text-xs py-2 ${m.netGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {m.netGrowth >= 0 ? '+' : ''}{m.netGrowth}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs py-2">{m.wauAvg}</TableCell>
                                                        <TableCell className="text-right text-xs py-2">{retention.toFixed(0)}%</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
