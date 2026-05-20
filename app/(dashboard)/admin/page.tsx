'use client'

import React, { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { plantingsData } from '@/lib/plantings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, XAxis, YAxis, ComposedChart, Legend } from 'recharts'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import { getAdminStats, getMonthlyRevenueHistory, verifyAdminPassword, verifyAdminSession, getPowerUsers, getSegmentCounts, syncSegmentToResend, syncAllUsersToResend, getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, sendUserEmail, getResendAudiences, getAudienceContacts, getUserEmailHistory, sendBroadcastToAudience, fetchUrlMetadata, getMarketingEntries, createMarketingEntry, updateMarketingEntry, deleteMarketingEntry, getMarketingEntriesForReport, addSerpKeyword, removeSerpKeyword, getCompaniesAdmin, createCompanyAdmin, updateCompanyAdmin, deleteCompanyAdmin, getNodeTransferRequestsAdmin, approveNodeTransferAdmin, rejectNodeTransferAdmin, type CompanyAdmin, type NodeTransferRequestAdmin, type PowerUser, type SegmentStats, type UserSegment, type EmailTemplate, type ResendContact, type EmailLog, type UrlMetadata, type MarketingEntry, type SerpKeyword } from './actions'
import chromeStoreData from './chrome-store-data.json'
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, Target, ChevronDown, ChevronUp, Lock, Zap, Clock, UserPlus, RefreshCw, Mail, Send, Loader2, Search, Plus, Trash2, X, FileText, Pencil, Eye, Code, List, UserX, Calendar, History, Trophy, Check, MousePointer, AlertTriangle, Download, Link2, TreePine, Monitor } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Email Preview Component with proper scaling
const EmailPreview = ({ html, subject, className = "" }: { html: string; subject?: string; className?: string }) => {
    return (
        <div className={`w-full h-full border-2 border-black overflow-hidden bg-gray-50 relative group flex flex-col ${className}`}>
            {subject && (
                <div className="bg-white border-b-2 border-black p-2 text-xs font-bold text-neutral-500 truncate flex-shrink-0">
                    Subject: <span className="text-black">{subject}</span>
                </div>
            )}
            <div className="flex-grow relative w-full h-full overflow-hidden">
                <div className="w-[200%] h-[200%] origin-top-left transform scale-50 absolute top-0 left-0">
                    <iframe
                        srcDoc={html}
                        className="w-full h-full border-none pointer-events-none"
                        tabIndex={-1}
                        title="Email Preview"
                    />
                </div>
                {/* Overlay to catch interaction */}
                <div className="absolute inset-0 z-10" />
            </div>
        </div>
    )
}


// Hardcoded Financial Data
const COST_BREAKDOWN = [
    { category: 'Tech Fix Fee', amount: 300.00 },
    { category: 'Salary Cost', amount: 180.00 },
]

const FINANCIAL_DATA = {
    totalCosts: COST_BREAKDOWN.reduce((sum, cost) => sum + cost.amount, 0),
    marketingSpent: 700.00, // Actual marketing spent so far (for CAC)
    costBreakdown: COST_BREAKDOWN,
}

// Chart Configs
const wauChartConfig = {
    wauAvg: { label: "Weekly Active Users", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const desktopChartConfig = {
    wauAvg: { label: "Desktop WAU", color: "hsl(217, 91%, 60%)" },
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

const churnChartConfig = {
    uninstallRate: { label: "Uninstall Rate", color: "hsl(0, 72%, 51%)" },
} satisfies ChartConfig

const compactId = (value: string | null | undefined, chars = 8) => {
    if (!value) return '—'
    return value.length > chars * 2 ? `${value.slice(0, chars)}...${value.slice(-chars)}` : value
}

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '—'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value))
}

const getTransferStatusClass = (status: NodeTransferRequestAdmin['status']) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-900 border-yellow-400'
    if (status === 'approved') return 'bg-green-100 text-green-900 border-green-500'
    if (status === 'rejected') return 'bg-red-100 text-red-900 border-red-500'
    return 'bg-neutral-100 text-neutral-700 border-neutral-400'
}

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
        activeLast30DaysUsersCount: number,
        churnRate: number,
        // Platform breakdown
        chromeWau: number,
        chromeWauCurrent: number,
        desktopWau: number,
        extensionNodeCount: number,
        desktopNodeCount: number,
        extensionRevenueShare: number,
        desktopRevenueShare: number,
        extensionRevenue: number,
        desktopRevenue: number,
        extensionArpu: number,
        desktopArpu: number,
        desktopOptOutRate: number
    } | null>(null)
    const [revenueHistory, setRevenueHistory] = useState<{ month: string; earnings: number; revenue: number }[]>([])
    const [showDetails, setShowDetails] = useState(false)

    const [isVerifying, setIsVerifying] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    // Power Users state
    const [powerUsers, setPowerUsers] = useState<PowerUser[]>([])
    const [segmentStats, setSegmentStats] = useState<SegmentStats | null>(null)
    const [selectedSegment, setSelectedSegment] = useState<UserSegment | 'all'>('all')
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [syncingSegment, setSyncingSegment] = useState<UserSegment | null>(null)
    const [syncResult, setSyncResult] = useState<{ segment: string; success: boolean; message: string } | null>(null)

    // Templates & Email State
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [templateModalMode, setTemplateModalMode] = useState<'create' | 'edit'>('create')
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
    const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', content: '', from_email: '' })
    const [emailCompose, setEmailCompose] = useState({ userId: '', userEmail: '', userName: '', subject: '', content: '', from_email: '', loading: false })
    const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null)
    const [activeTab, setActiveTab] = useState('real-data')

    // Audiences State
    const [audiences, setAudiences] = useState<{ id: string; name: string }[]>([])
    const [selectedAudienceId, setSelectedAudienceId] = useState<string | null>(null)
    const [audienceContacts, setAudienceContacts] = useState<ResendContact[]>([])
    const [isLoadingContacts, setIsLoadingContacts] = useState(false)

    // Email History State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [historyUser, setHistoryUser] = useState<PowerUser | null>(null)
    const [emailHistory, setEmailHistory] = useState<EmailLog[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    // Broadcast Campaign State
    const [broadcastAudienceId, setBroadcastAudienceId] = useState<string>('')
    const [broadcastTemplateId, setBroadcastTemplateId] = useState<string>('')
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)
    const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string } | null>(null)

    // Sync All Users State
    const [isSyncingAllUsers, setIsSyncingAllUsers] = useState(false)
    const [syncAllUsersResult, setSyncAllUsersResult] = useState<{ success: boolean; message: string } | null>(null)

    // PDF Report State
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    // Marketing Entries State (persisted to database)
    const [marketingEntries, setMarketingEntries] = useState<MarketingEntry[]>([])
    const [isLoadingEntries, setIsLoadingEntries] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1) // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [newEntryUrl, setNewEntryUrl] = useState('')
    const [newEntryCost, setNewEntryCost] = useState('')
    const [newEntryNotes, setNewEntryNotes] = useState('')
    const [newEntryImpressions, setNewEntryImpressions] = useState('')
    const [newEntryClicks, setNewEntryClicks] = useState('')
    const [newEntryEngagement, setNewEntryEngagement] = useState('')
    const [newEntryKeywords, setNewEntryKeywords] = useState<string[]>([])
    const [newEntryKeywordInput, setNewEntryKeywordInput] = useState('')
    const [isAddingEntry, setIsAddingEntry] = useState(false)
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
    const [editEntryCost, setEditEntryCost] = useState('')
    const [editEntryNotes, setEditEntryNotes] = useState('')
    const [editEntryImpressions, setEditEntryImpressions] = useState('')
    const [editEntryClicks, setEditEntryClicks] = useState('')
    const [editEntryEngagement, setEditEntryEngagement] = useState('')
    const [editEntryKeywordInput, setEditEntryKeywordInput] = useState('')
    const [addingKeywordForEntry, setAddingKeywordForEntry] = useState<string | null>(null)
    const [removingKeywordId, setRemovingKeywordId] = useState<string | null>(null)
    const [refreshingEntryId, setRefreshingEntryId] = useState<string | null>(null)
    const [marketingTotals, setMarketingTotals] = useState({ totalCost: 0, totalImpressions: 0, totalClicks: 0, totalEngagement: 0 })

    // Companies & Portals State
    const [companies, setCompanies] = useState<CompanyAdmin[]>([])
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
    const [companyModalMode, setCompanyModalMode] = useState<'create' | 'edit'>('create')
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null)
    const [newCompany, setNewCompany] = useState({ name: '', slug: '', invite_code: '', theme_color: '#10B981', website: '', video_url: '', logo_url: '', description: '', is_invite_only: true })
    const [isSavingCompany, setIsSavingCompany] = useState(false)
    const [previewCompany, setPreviewCompany] = useState<CompanyAdmin | null>(null)

    // Node Transfer Requests State
    const [nodeTransferRequests, setNodeTransferRequests] = useState<NodeTransferRequestAdmin[]>([])
    const [isLoadingNodeTransfers, setIsLoadingNodeTransfers] = useState(false)
    const [nodeTransferActionId, setNodeTransferActionId] = useState<string | null>(null)
    const [nodeTransferResult, setNodeTransferResult] = useState<{ success: boolean; message: string } | null>(null)

    const fetchNodeTransferRequests = async (preserveResult = false) => {
        setIsLoadingNodeTransfers(true)
        if (!preserveResult) {
            setNodeTransferResult(null)
        }
        try {
            const result = await getNodeTransferRequestsAdmin()
            setNodeTransferRequests(result.requests)
            if (result.error) {
                setNodeTransferResult({ success: false, message: result.error })
            }
        } catch (error) {
            console.error('Error fetching node transfer requests:', error)
            setNodeTransferResult({ success: false, message: 'Failed to load node transfer requests' })
        } finally {
            setIsLoadingNodeTransfers(false)
        }
    }

    const handleNodeTransferDecision = async (requestId: string, decision: 'approve' | 'reject') => {
        const request = nodeTransferRequests.find(item => item.id === requestId)
        const actionLabel = decision === 'approve' ? 'approve' : 'reject'
        if (!request || !confirm(`Are you sure you want to ${actionLabel} this node transfer?`)) return

        setNodeTransferActionId(requestId)
        setNodeTransferResult(null)
        try {
            const result = decision === 'approve'
                ? await approveNodeTransferAdmin(requestId)
                : await rejectNodeTransferAdmin(requestId)

            if (result.success) {
                setNodeTransferResult({
                    success: true,
                    message: decision === 'approve'
                        ? `Node ${compactId(request.node_identifier)} moved to ${request.to_display_name || request.to_email || compactId(request.to_user_id)}.`
                        : `Transfer request for ${compactId(request.node_identifier)} was rejected.`
                })
                await fetchNodeTransferRequests(true)
            } else {
                setNodeTransferResult({ success: false, message: result.error || `Failed to ${actionLabel} transfer request` })
            }
        } catch (error) {
            console.error(`Error trying to ${actionLabel} node transfer request:`, error)
            setNodeTransferResult({ success: false, message: `Failed to ${actionLabel} transfer request` })
        } finally {
            setNodeTransferActionId(null)
        }
    }

    // Fetch Companies
    const fetchCompanies = async () => {
        setIsLoadingCompanies(true)
        try {
            const data = await getCompaniesAdmin()
            setCompanies(data)
        } catch (error) {
            console.error('Error fetching companies:', error)
        } finally {
            setIsLoadingCompanies(false)
        }
    }

    const handleSaveCompany = async () => {
        if (!newCompany.name.trim()) return
        setIsSavingCompany(true)

        try {
            if (companyModalMode === 'create') {
                const result = await createCompanyAdmin(newCompany)
                if (result.success) {
                    setIsCompanyModalOpen(false)
                    await fetchCompanies()
                } else {
                    alert(result.error)
                }
            } else if (companyModalMode === 'edit' && editingCompanyId) {
                const result = await updateCompanyAdmin(editingCompanyId, newCompany)
                if (result.success) {
                    setIsCompanyModalOpen(false)
                    await fetchCompanies()
                } else {
                    alert(result.error)
                }
            }
        } catch (error) {
            console.error('Error saving company:', error)
            alert('Failed to save company')
        } finally {
            setIsSavingCompany(false)
        }
    }

    const handleDeleteCompany = async (id: string) => {
        if (!confirm('Are you sure you want to delete this company? Existing users will lose their association.')) return
        try {
            const result = await deleteCompanyAdmin(id)
            if (result.success) {
                await fetchCompanies()
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error('Error deleting company:', error)
        }
    }

    const startEditingCompany = (company: CompanyAdmin) => {
        setCompanyModalMode('edit')
        setEditingCompanyId(company.id)
        setNewCompany({
            name: company.name || '',
            slug: company.slug || '',
            invite_code: company.invite_code || '',
            theme_color: company.theme_color || '#10B981',
            website: company.website || '',
            video_url: company.video_url || '',
            logo_url: company.logo_url || '',
            description: company.description || '',
            is_invite_only: company.is_invite_only
        })
        setIsCompanyModalOpen(true)
    }

    const openCreateCompany = () => {
        setCompanyModalMode('create')
        setEditingCompanyId(null)
        setNewCompany({ name: '', slug: '', invite_code: '', theme_color: '#10B981', website: '', video_url: '', logo_url: '', description: '', is_invite_only: true })
        setIsCompanyModalOpen(true)
    }

    // Fetch marketing entries for selected month/year
    const fetchMarketingEntries = async () => {
        setIsLoadingEntries(true)
        try {
            const data = await getMarketingEntriesForReport(selectedMonth, selectedYear)
            setMarketingEntries(data.entries)
            setMarketingTotals({
                totalCost: data.totalCost,
                totalImpressions: data.totalImpressions,
                totalClicks: data.totalClicks,
                totalEngagement: data.totalEngagement
            })
        } catch (error) {
            console.error('Error fetching marketing entries:', error)
        } finally {
            setIsLoadingEntries(false)
        }
    }

    // Add new marketing entry
    const handleAddMarketingEntry = async () => {
        if (!newEntryUrl.trim() || isAddingEntry) return

        setIsAddingEntry(true)
        try {
            const result = await createMarketingEntry({
                url: newEntryUrl.trim(),
                cost: newEntryCost ? parseFloat(newEntryCost) : null,
                notes: newEntryNotes.trim() || null,
                impressions: newEntryImpressions ? parseInt(newEntryImpressions) : null,
                clicks: newEntryClicks ? parseInt(newEntryClicks) : null,
                engagement: newEntryEngagement ? parseInt(newEntryEngagement) : null,
                month: selectedMonth,
                year: selectedYear
            })

            if (result.success && result.entry) {
                // Add SERP keywords if any
                for (const kw of newEntryKeywords) {
                    await addSerpKeyword(result.entry.id, kw)
                }

                setNewEntryUrl('')
                setNewEntryCost('')
                setNewEntryNotes('')
                setNewEntryImpressions('')
                setNewEntryClicks('')
                setNewEntryEngagement('')
                setNewEntryKeywords([])
                setNewEntryKeywordInput('')
                await fetchMarketingEntries()
            }
        } catch (error) {
            console.error('Error adding marketing entry:', error)
        } finally {
            setIsAddingEntry(false)
        }
    }

    const handleUpdateMarketingEntry = async (id: string) => {
        try {
            await updateMarketingEntry(id, {
                cost: editEntryCost ? parseFloat(editEntryCost) : null,
                notes: editEntryNotes.trim() || null,
                impressions: editEntryImpressions ? parseInt(editEntryImpressions) : null,
                clicks: editEntryClicks ? parseInt(editEntryClicks) : null,
                engagement: editEntryEngagement ? parseInt(editEntryEngagement) : null
            })
            setEditingEntryId(null)
            await fetchMarketingEntries()
        } catch (error) {
            console.error('Error updating marketing entry:', error)
        }
    }

    // Delete marketing entry
    const handleDeleteMarketingEntry = async (id: string) => {
        if (!confirm('Delete this entry?')) return
        try {
            await deleteMarketingEntry(id)
            await fetchMarketingEntries()
        } catch (error) {
            console.error('Error deleting marketing entry:', error)
        }
    }

    const startEditingEntry = (entry: MarketingEntry) => {
        setEditingEntryId(entry.id)
        setEditEntryCost(entry.cost?.toString() || '')
        setEditEntryNotes(entry.notes || '')
        setEditEntryImpressions(entry.impressions?.toString() || '')
        setEditEntryClicks(entry.clicks?.toString() || '')
        setEditEntryEngagement(entry.engagement?.toString() || '')
        setEditEntryKeywordInput('')
    }

    // Add keyword to new entry (local only)
    const handleAddNewEntryKeyword = () => {
        const kw = newEntryKeywordInput.trim()
        if (!kw || newEntryKeywords.includes(kw)) return
        setNewEntryKeywords([...newEntryKeywords, kw])
        setNewEntryKeywordInput('')
    }

    // Add keyword to existing entry (persisted to DB)
    const handleAddKeywordToEntry = async (entryId: string) => {
        const kw = editEntryKeywordInput.trim()
        if (!kw) return
        setAddingKeywordForEntry(entryId)
        try {
            const result = await addSerpKeyword(entryId, kw)
            if (result.success) {
                setEditEntryKeywordInput('')
                await fetchMarketingEntries()
            } else {
                alert(result.error || 'Failed to add keyword')
            }
        } catch (error) {
            console.error('Error adding keyword:', error)
        } finally {
            setAddingKeywordForEntry(null)
        }
    }

    // Remove keyword from existing entry (persisted to DB)
    const handleRemoveKeyword = async (keywordId: string) => {
        setRemovingKeywordId(keywordId)
        try {
            const result = await removeSerpKeyword(keywordId)
            if (result.success) {
                await fetchMarketingEntries()
            }
        } catch (error) {
            console.error('Error removing keyword:', error)
        } finally {
            setRemovingKeywordId(null)
        }
    }

    // Refresh YouTube analytics for an entry
    const handleRefreshAnalytics = async (id: string) => {
        setRefreshingEntryId(id)
        try {
            const { refreshMarketingEntryAnalytics } = await import('./actions')
            const result = await refreshMarketingEntryAnalytics(id)
            if (result.success) {
                await fetchMarketingEntries()
                // Show warning if URL wasn't found in SERP
                if (result.error) {
                    alert(result.error)
                }
            } else {
                alert(result.error || 'Failed to refresh analytics')
            }
        } catch (error) {
            console.error('Error refreshing analytics:', error)
            alert('Failed to refresh analytics')
        } finally {
            setRefreshingEntryId(null)
        }
    }


    // Calculate trees planted this month from plantings data
    const getTreesThisMonth = () => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        return plantingsData.events.filter(event => {
            const eventDate = new Date(event.date)
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
        }).reduce((sum, event) => sum + event.trees, 0)
    }

    // Calculate total trees planted
    const getTotalTrees = () => {
        return plantingsData.events.reduce((sum, event) => sum + event.trees, 0)
    }

    // Get donations this month
    const getDonationsThisMonth = () => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        return plantingsData.receipts
            .filter(receipt => {
                if (!receipt.date) return false
                const receiptDate = new Date(receipt.date)
                return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear
            })
            .reduce((sum, receipt) => sum + (receipt.amount || 0), 0)
    }

    // Generate structured Monthly Report PDF
    const generateMonthlyReport = async () => {
        if (isGeneratingPdf || !stats) return

        const previousTab = activeTab
        setIsGeneratingPdf(true)

        try {
            // 1. Ensure we are on the data tab so charts are rendered
            if (activeTab !== 'real-data') {
                setActiveTab('real-data')
                // Small delay to allow charts to render
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            // 2. Capture charts
            const wauChart = document.getElementById('wau-chart')
            const desktopChart = document.getElementById('desktop-chart')
            const growthChart = document.getElementById('acquisition-chart')
            const revenueChart = document.getElementById('revenue-chart')

            const chartImages: { [key: string]: string | null } = {
                wau: null,
                desktop: null,
                growth: null,
                revenue: null
            }

            if (wauChart) {
                const canvas = await html2canvas(wauChart, { scale: 2 })
                chartImages.wau = canvas.toDataURL('image/png')
            }

            if (desktopChart) {
                const canvas = await html2canvas(desktopChart, { scale: 2 })
                chartImages.desktop = canvas.toDataURL('image/png')
            }

            if (growthChart) {
                const canvas = await html2canvas(growthChart, { scale: 2 })
                chartImages.growth = canvas.toDataURL('image/png')
            }

            if (revenueChart) {
                const canvas = await html2canvas(revenueChart, { scale: 2 })
                chartImages.revenue = canvas.toDataURL('image/png')
            }

            // 3. Generate PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const margin = 20
            let y = 20

            // Current month/year
            const now = new Date()
            const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

            // === HEADER ===
            pdf.setFillColor(252, 211, 77) // brand-yellow
            pdf.rect(0, 0, pageWidth, 40, 'F')

            pdf.setFontSize(28)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(0, 0, 0)
            pdf.text('IdleForest', margin, 25)

            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'normal')
            pdf.text(`Monthly Report - ${monthYear}`, margin, 35)

            y = 55

            // === USER METRICS ===
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.setTextColor(34, 34, 34)
            pdf.text('User Metrics', margin, y)
            y += 10

            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
            pdf.text(`Total Users: ${stats.totalUsersCount.toLocaleString()}`, margin, y)
            y += 6
            pdf.text(`New Users This Month: +${stats.newTotalUsersCount.toLocaleString()}`, margin, y)
            y += 6
            pdf.text(`Weekly Active Users: ${(stats.chromeWauCurrent + stats.desktopWau).toLocaleString()} (${stats.chromeWauCurrent} extension + ${stats.desktopWau} desktop)`, margin, y)
            y += 6
            pdf.text(`Monthly Churn Rate: ${(stats.churnRate * 100).toFixed(1)}%`, margin, y)
            y += 15

            // === FINANCIALS ===
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Financials', margin, y)
            y += 10

            const profit = stats.monthlyRevenue - FINANCIAL_DATA.totalCosts
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
            pdf.text(`Revenue: EUR ${stats.monthlyRevenue.toFixed(2)}`, margin, y)
            y += 6
            pdf.text(`Costs: EUR ${FINANCIAL_DATA.totalCosts.toFixed(2)}`, margin, y)
            y += 6
            pdf.text(`Marketing Spent: EUR ${FINANCIAL_DATA.marketingSpent.toFixed(2)}`, margin, y)
            y += 6
            pdf.setFont('helvetica', 'bold')
            pdf.text(`Profit/Loss: EUR ${profit.toFixed(2)}`, margin, y)
            pdf.setFont('helvetica', 'normal')
            y += 15

            // === ENVIRONMENTAL IMPACT ===
            const treesThisMonth = getTreesThisMonth()
            const totalTrees = getTotalTrees()
            const donationsThisMonth = getDonationsThisMonth()

            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Environmental Impact', margin, y)
            y += 10

            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
            if (treesThisMonth > 0) {
                pdf.text(`Trees Planted This Month: ${treesThisMonth.toLocaleString()}`, margin, y)
                y += 6
            }
            pdf.text(`Total Trees Planted: ${totalTrees.toLocaleString()}`, margin, y)
            y += 6
            if (donationsThisMonth > 0) {
                pdf.text(`Donations This Month: $${donationsThisMonth.toFixed(2)}`, margin, y)
                y += 6
            }
            y += 10

            // === POSTS & PARTNERSHIPS ===
            if (marketingEntries.length > 0) {
                pdf.setFontSize(16)
                pdf.setFont('helvetica', 'bold')
                pdf.text('Posts & Partnerships', margin, y)
                y += 10

                // Show total marketing cost
                if (marketingTotals.totalCost > 0) {
                    pdf.setFontSize(11)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(`Total Marketing Cost: EUR ${marketingTotals.totalCost.toFixed(2)}`, margin, y)
                    pdf.setFont('helvetica', 'normal')
                    y += 8
                }

                pdf.setFontSize(11)
                for (const entry of marketingEntries) {
                    // Check if we need a new page
                    if (y > 270) {
                        pdf.addPage()
                        y = 20
                    }

                    const costStr = entry.cost ? ` (EUR ${entry.cost.toFixed(2)})` : ''
                    // Clean title to remove emojis/special chars if needed, though simpler chars might pass
                    // For now, assuming title is mostly safe text
                    pdf.text(`- ${entry.title}${costStr}`, margin, y)
                    y += 5
                    pdf.setTextColor(60, 100, 180)
                    pdf.text(`  ${entry.url}`, margin, y)
                    pdf.setTextColor(34, 34, 34)
                    if (entry.notes) {
                        y += 4
                        pdf.setTextColor(100, 100, 100)
                        pdf.text(`  ${entry.notes}`, margin, y)
                        pdf.setTextColor(34, 34, 34)
                    }
                    y += 7
                }
                y += 5
            }

            // === CHARTS PAGE ===
            if (chartImages.wau || chartImages.desktop) {
                pdf.addPage()
                let chartY = 20

                pdf.setFontSize(16)
                pdf.setFont('helvetica', 'bold')
                pdf.text('Weekly Active Users', margin, chartY)
                chartY += 10

                if (chartImages.wau) {
                    // Fit width, maintain aspect ratio roughly
                    const imgProps = pdf.getImageProperties(chartImages.wau)
                    const pdfImgWidth = pageWidth - (margin * 2)
                    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width

                    pdf.addImage(chartImages.wau, 'PNG', margin, chartY, pdfImgWidth, pdfImgHeight)
                    chartY += pdfImgHeight + 10
                }

                if (chartImages.desktop) {
                    if (chartY > 200) { pdf.addPage(); chartY = 20; }

                    pdf.setFontSize(16)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text('Desktop Growth', margin, chartY)
                    chartY += 10

                    const imgProps = pdf.getImageProperties(chartImages.desktop)
                    const pdfImgWidth = pageWidth - (margin * 2)
                    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width

                    pdf.addImage(chartImages.desktop, 'PNG', margin, chartY, pdfImgWidth, pdfImgHeight)
                    chartY += pdfImgHeight + 10
                }
            }

            // === REVENUE & GROWTH CHARTS PAGE ===
            if (chartImages.revenue || chartImages.growth) {
                pdf.addPage()
                let chartY = 20

                if (chartImages.revenue) {
                    pdf.setFontSize(16)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text('Revenue Trends', margin, chartY)
                    chartY += 10

                    const imgProps = pdf.getImageProperties(chartImages.revenue)
                    const pdfImgWidth = pageWidth - (margin * 2)
                    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width

                    pdf.addImage(chartImages.revenue, 'PNG', margin, chartY, pdfImgWidth, pdfImgHeight)
                    chartY += pdfImgHeight + 10
                }

                if (chartImages.growth) {
                    if (chartY > 200) { pdf.addPage(); chartY = 20; }

                    pdf.setFontSize(16)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text('Acquisition & Churn', margin, chartY)
                    chartY += 10

                    const imgProps = pdf.getImageProperties(chartImages.growth)
                    const pdfImgWidth = pageWidth - (margin * 2)
                    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width

                    pdf.addImage(chartImages.growth, 'PNG', margin, chartY, pdfImgWidth, pdfImgHeight)
                    chartY += pdfImgHeight + 10
                }
            }

            // === FOOTER ===
            const footerY = pdf.internal.pageSize.getHeight() - 15
            pdf.setFontSize(9)
            pdf.setTextColor(100, 100, 100)
            const checkPage = pdf.getNumberOfPages()
            for (let i = 1; i <= checkPage; i++) {
                pdf.setPage(i)
                pdf.text(`Generated on ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin, footerY)
                pdf.text('idleforest.io', pageWidth - margin - 25, footerY)
            }

            // Generate filename with month-year
            const filename = `idleforest-report-${monthYear.toLowerCase().replace(' ', '-')}.pdf`
            pdf.save(filename)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. See console for details.')
        } finally {
            if (activeTab !== previousTab) {
                setActiveTab(previousTab)
            }
            setIsGeneratingPdf(false)
        }
    }

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

    // Fetch power users data 
    const fetchPowerUsersData = async () => {
        setIsLoadingUsers(true)
        try {
            const [users, counts] = await Promise.all([
                getPowerUsers(),
                getSegmentCounts()
            ])
            setPowerUsers(users)
            setSegmentStats(counts)
        } catch (err) {
            console.error('Error fetching power users:', err)
        } finally {
            setIsLoadingUsers(false)
        }
    }

    // Fetch templates
    const fetchTemplates = async () => {
        try {
            const data = await getEmailTemplates()
            setTemplates(data)
        } catch (err) {
            console.error('Error fetching templates:', err)
        }
    }

    // Fetch Audiences
    const fetchAudiences = async () => {
        try {
            const data = await getResendAudiences()
            setAudiences(data)
            if (data.length > 0 && !selectedAudienceId) {
                setSelectedAudienceId(data[0].id)
            }
        } catch (err) {
            console.error('Error fetching audiences:', err)
        }
    }

    // Fetch Audience Contacts
    const fetchContacts = async (audienceId: string) => {
        setIsLoadingContacts(true)
        try {
            const data = await getAudienceContacts(audienceId)
            setAudienceContacts(data)
        } catch (err) {
            console.error('Error fetching contacts:', err)
        } finally {
            setIsLoadingContacts(false)
        }
    }

    useEffect(() => {
        if (selectedAudienceId) {
            fetchContacts(selectedAudienceId)
        }
    }, [selectedAudienceId])

    // Also fetch contacts when broadcast audience is selected (for preview)
    useEffect(() => {
        if (broadcastAudienceId) {
            fetchContacts(broadcastAudienceId)
        }
    }, [broadcastAudienceId])

    useEffect(() => {
        if (isAuthenticated) {
            fetchTemplates()
        }
    }, [isAuthenticated])

    // Template Handlers
    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (templateModalMode === 'create') {
                await createEmailTemplate(newTemplate.name, newTemplate.subject, newTemplate.content, newTemplate.from_email || undefined)
            } else if (templateModalMode === 'edit' && editingTemplateId) {
                await updateEmailTemplate(editingTemplateId, newTemplate.name, newTemplate.subject, newTemplate.content, newTemplate.from_email || undefined)
            }
            await fetchTemplates()
            setIsTemplateModalOpen(false)
            setNewTemplate({ name: '', subject: '', content: '', from_email: '' })
            setEditingTemplateId(null)
            setTemplateModalMode('create')
        } catch (err) {
            console.error('Error saving template:', err)
            alert('Failed to save template')
        }
    }

    const handleEditTemplate = (template: EmailTemplate) => {
        setNewTemplate({
            name: template.name,
            subject: template.subject,
            content: template.content,
            from_email: template.from_email || ''
        })
        setEditingTemplateId(template.id)
        setTemplateModalMode('edit')
        setIsTemplateModalOpen(true)
    }

    const handleCloseTemplateModal = () => {
        setIsTemplateModalOpen(false)
        setNewTemplate({ name: '', subject: '', content: '', from_email: '' })
        setEditingTemplateId(null)
        setTemplateModalMode('create')
    }

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return
        try {
            await deleteEmailTemplate(id)
            await fetchTemplates()
        } catch (err) {
            console.error('Error deleting template:', err)
        }
    }

    // Email Handlers
    const handleOpenEmailModal = (user: PowerUser) => {
        setEmailCompose({
            userId: user.user_id,
            userEmail: user.email || '',
            userName: user.display_name || '',
            subject: '',
            content: '',
            from_email: '',
            loading: false
        })
        setEmailResult(null)
        setIsEmailModalOpen(true)
    }

    const handleLoadTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setEmailCompose(prev => ({
                ...prev,
                subject: template.subject,
                content: template.content,
                from_email: template.from_email || ''
            }))
        }
    }

    // Send test email to daniiba account
    const handleSendTestEmail = async () => {
        const testUser = powerUsers.find(u => u.display_name.toLowerCase().includes('daniiba') || u.email?.toLowerCase().includes('daniiba'))
        if (!testUser || !testUser.email) {
            setEmailResult({ success: false, message: 'Test user "daniiba" not found or has no email' })
            return
        }

        setEmailCompose(prev => ({ ...prev, loading: true }))
        setEmailResult(null)

        try {
            await sendUserEmail(
                testUser.user_id,
                testUser.email,
                `[TEST] ${emailCompose.subject}`,
                emailCompose.content,
                testUser.display_name,
                emailCompose.from_email || undefined
            )
            setEmailResult({ success: true, message: `Test email sent to ${testUser.email}!` })
        } catch (err) {
            setEmailResult({
                success: false,
                message: err instanceof Error ? err.message : 'Failed to send test email'
            })
        } finally {
            setEmailCompose(prev => ({ ...prev, loading: false }))
        }
    }

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setEmailCompose(prev => ({ ...prev, loading: true }))
        setEmailResult(null)

        try {
            await sendUserEmail(
                emailCompose.userId,
                emailCompose.userEmail,
                emailCompose.subject,
                emailCompose.content,
                emailCompose.userName,
                emailCompose.from_email || undefined
            )
            setEmailResult({ success: true, message: 'Email sent successfully!' })
            setTimeout(() => {
                setIsEmailModalOpen(false)
                setEmailResult(null)
            }, 1500)
        } catch (err) {
            setEmailResult({
                success: false,
                message: err instanceof Error ? err.message : 'Failed to send email'
            })
        } finally {
            setEmailCompose(prev => ({ ...prev, loading: false }))
        }
    }

    // Handle segment sync
    const handleSyncSegment = async (segment: UserSegment, dryRun: boolean = false) => {
        setSyncingSegment(segment)
        setSyncResult(null)
        try {
            const result = await syncSegmentToResend(segment, dryRun)
            if (dryRun) {
                setSyncResult({
                    segment,
                    success: true,
                    message: `Preview: ${result.usersToSync} users would be synced to Resend`
                })
            } else {
                setSyncResult({
                    segment,
                    success: result.success,
                    message: result.success
                        ? `Synced ${result.syncedCount} users to Resend`
                        : `Errors: ${result.errors?.join(', ')}`
                })
            }
        } catch (err) {
            setSyncResult({
                segment,
                success: false,
                message: 'Failed to sync: ' + (err instanceof Error ? err.message : 'Unknown error')
            })
        } finally {
            setSyncingSegment(null)
        }
    }

    // Handle viewing email history for a user
    const handleViewEmailHistory = async (user: PowerUser) => {
        setHistoryUser(user)
        setEmailHistory([])
        setIsHistoryModalOpen(true)
        setIsLoadingHistory(true)

        try {
            const history = await getUserEmailHistory(user.user_id)
            setEmailHistory(history)
        } catch (err) {
            console.error('Error fetching email history:', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    // Handle sending a broadcast campaign
    const handleSendBroadcast = async () => {
        if (!broadcastAudienceId || !broadcastTemplateId) return

        setIsSendingBroadcast(true)
        setBroadcastResult(null)

        try {
            const result = await sendBroadcastToAudience(
                broadcastAudienceId,
                broadcastTemplateId
            )

            if (result.success) {
                setBroadcastResult({
                    success: true,
                    message: `Broadcast sent! ID: ${result.broadcastId}`
                })
                setBroadcastAudienceId('')
                setBroadcastTemplateId('')
            } else {
                setBroadcastResult({
                    success: false,
                    message: result.error || 'Failed to send broadcast'
                })
            }
        } catch (err) {
            setBroadcastResult({
                success: false,
                message: err instanceof Error ? err.message : 'Failed to send broadcast'
            })
        } finally {
            setIsSendingBroadcast(false)
        }
    }

    // Handle syncing all users to an audience
    const handleSyncAllUsers = async (dryRun: boolean = false) => {
        setIsSyncingAllUsers(true)
        setSyncAllUsersResult(null)

        try {
            const result = await syncAllUsersToResend(undefined, dryRun)
            if (dryRun) {
                setSyncAllUsersResult({
                    success: true,
                    message: `Preview: ${result.usersToSync} users with emails would be synced to "idleforest_all_users" audience`
                })
            } else {
                setSyncAllUsersResult({
                    success: result.success,
                    message: result.success
                        ? `Successfully synced ${result.syncedCount} users to "idleforest_all_users" audience!`
                        : `Errors: ${result.errors?.join(', ')}`
                })
            }
        } catch (err) {
            setSyncAllUsersResult({
                success: false,
                message: err instanceof Error ? err.message : 'Failed to sync users'
            })
        } finally {
            setIsSyncingAllUsers(false)
        }
    }

    // Filter users by selected segment
    const filteredUsers = powerUsers.filter(u => {
        const matchesSegment = selectedSegment === 'all' || u.segments.includes(selectedSegment)
        const matchesSearch = searchQuery === '' ||
            u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesSegment && matchesSearch
    })

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
    const activeLast30DaysArpu = stats.activeLast30DaysUsersCount > 0 ? (stats.monthlyRevenue / stats.activeLast30DaysUsersCount) : 0
    const churnRate = stats.churnRate
    const ltv = churnRate > 0 ? (arpu / churnRate) : (arpu * 12)
    const profit = stats.monthlyRevenue - FINANCIAL_DATA.totalCosts

    // CAC calculation based on actual marketing spend
    const cac = stats.totalUsersCount > 0 ? (FINANCIAL_DATA.marketingSpent / stats.totalUsersCount) : 0
    const ltvCacRatio = cac > 0 ? (ltv / cac) : Infinity

    // Target CAC based on 3x LTV/CAC rule
    const targetMaxCac = ltv / 3

    // Monthly revenue per WAU - merge actual revenue with WAU data
    // For months where we have desktop data, add it to total WAU for accurate ARPU
    const monthlyMetricsData = chromeStoreData.monthlyData.map((m) => {
        const revenueData = revenueHistory.find(r => r.month === m.month)
        const actualRevenue = revenueData?.revenue || 0

        // Check if we have desktop data for this month
        const desktopDataForMonth = chromeStoreData.desktopData.find(d => d.month === m.month)
        const desktopWauForMonth = desktopDataForMonth?.wauAvg || 0
        const totalWauForMonth = m.wauAvg + desktopWauForMonth

        const actualArpu = totalWauForMonth > 0 ? (actualRevenue / totalWauForMonth) : 0
        // Monthly uninstall rate = uninstalls / installs for that month
        const uninstallRate = m.installs > 0 ? (m.uninstalls / m.installs) * 100 : 0
        return {
            ...m,
            revenue: Math.round(actualRevenue * 100) / 100,
            arpu: Math.round(actualArpu * 100) / 100,
            totalWau: totalWauForMonth,
            hasDesktopData: desktopWauForMonth > 0,
            uninstallRate: Math.round(uninstallRate * 10) / 10 // Percentage with 1 decimal
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
                            <button
                                onClick={generateMonthlyReport}
                                disabled={isGeneratingPdf}
                                className="bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 font-bold uppercase text-sm tracking-wider text-black hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                            >
                                {isGeneratingPdf ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><Download className="h-4 w-4" /> Report</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        setActiveTab(value)
                        if (value === 'power-users') {
                            fetchPowerUsersData()
                            fetchAudiences()
                        }
                        if (value === 'templates') {
                            fetchTemplates()
                            fetchAudiences()
                        }
                        if (value === 'audiences') {
                            fetchAudiences()
                        }
                        if (value === 'marketing') {
                            fetchMarketingEntries()
                        }
                        if (value === 'companies') {
                            fetchCompanies()
                        }
                        if (value === 'node-transfers') {
                            fetchNodeTransferRequests()
                        }
                    }}
                    className="w-full" defaultValue={'real-data'}                 >
                    <TabsList className="grid w-full max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none p-1 h-auto">
                        <TabsTrigger value="real-data" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">📊 Data</TabsTrigger>
                        <TabsTrigger value="projections" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">🔮 Projections</TabsTrigger>
                        <TabsTrigger value="power-users" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">👥 Users</TabsTrigger>
                        <TabsTrigger value="audiences" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">📋 Lists</TabsTrigger>
                        <TabsTrigger value="templates" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">📝 Templates</TabsTrigger>
                        <TabsTrigger value="marketing" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">📣 Marketing</TabsTrigger>
                        <TabsTrigger value="companies" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">🏢 Companies</TabsTrigger>
                        <TabsTrigger value="node-transfers" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">Transfers</TabsTrigger>
                        <TabsTrigger value="report" className="rounded-none font-bold uppercase text-xs sm:text-sm py-3 data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:shadow-none">📄 Report</TabsTrigger>
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
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Weekly Active (Current)</p>
                                    </div>
                                    <div className="text-3xl font-extrabold font-candu text-black">{stats.chromeWauCurrent + stats.desktopWau}</div>
                                    <p className="text-sm text-neutral-600 mt-1">
                                        <span className="text-blue-600">{stats.chromeWauCurrent}</span> ext + <span className="text-purple-600">{stats.desktopWau}</span> desktop
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">Avg: {stats.chromeWau + stats.desktopWau} (used for ARPU)</p>
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
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">ARPU (Blended)</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">€{arpu.toFixed(2)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">All platforms</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">ARPU (Active 30d)</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">€{activeLast30DaysArpu.toFixed(2)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">{stats.activeLast30DaysUsersCount} registered active users</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Monthly Churn <span className="text-blue-600">(Chrome)</span></div>
                                    <div className="text-2xl font-extrabold font-candu text-black">{(churnRate * 100).toFixed(1)}%</div>
                                    <p className="text-xs text-neutral-600 mt-1">Avg uninstalls / installs</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Opt-Out Rate <span className="text-purple-600">(Desktop)</span></div>
                                    <div className="text-2xl font-extrabold font-candu text-black">{(stats.desktopOptOutRate * 100).toFixed(1)}%</div>
                                    <p className="text-xs text-neutral-600 mt-1">{stats.desktopNodeCount} desktop devices</p>
                                </div>
                            </div>
                        </section>

                        {/* Platform Breakdown */}
                        <section>
                            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-candu uppercase text-black">
                                <Activity className="h-5 w-5 text-brand-navy" />
                                Platform Breakdown
                            </h2>
                            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Extension ARPU</div>
                                    <div className="text-2xl font-extrabold font-candu text-blue-600">€{stats.extensionArpu.toFixed(2)}</div>
                                    <p className="text-xs text-neutral-600 mt-1">{stats.chromeWau} WAU • {(stats.extensionRevenueShare * 100).toFixed(0)}% of revenue</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Extension Devices</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">{stats.extensionNodeCount}</div>
                                    <p className="text-xs text-neutral-600 mt-1">Chrome Extension users</p>
                                </div>
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Desktop Devices</div>
                                    <div className="text-2xl font-extrabold font-candu text-black">{stats.desktopNodeCount}</div>
                                    <p className="text-xs text-neutral-600 mt-1">Windows + macOS users</p>
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
                            <div className="grid gap-4 lg:grid-cols-3">
                                <div id="wau-chart" className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
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

                                <div id="acquisition-chart" className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-1">Acquisition & Churn <span className="text-amber-600 text-sm font-normal">(Chrome Store only)</span></h3>
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

                                <div id="desktop-chart" className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-1">Desktop App Growth</h3>
                                    <p className="text-xs text-neutral-600 mb-4">
                                        Active users on desktop app
                                    </p>
                                    <ChartContainer config={desktopChartConfig} className="h-[200px] w-full">
                                        <BarChart data={chromeStoreData.desktopData} margin={{ left: 0, right: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tickFormatter={(v) => v.replace(' 2026', '').slice(0, 3)} fontSize={11} />
                                            <YAxis fontSize={11} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="wauAvg" fill="var(--color-wauAvg)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </section>

                        {/* Revenue Chart */}
                        <div id="revenue-chart" className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h3 className="text-base font-bold text-black mb-1">Revenue & ARPU Trend</h3>
                            <p className="text-xs text-neutral-600 mb-4">ARPU includes desktop WAU where available (Jan 2026+)</p>
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

                    {/* MARKETING TAB - Posts & Partnerships with Database Persistence */}
                    <TabsContent value="marketing" className="space-y-6 mt-6">
                        {/* Month/Year Selector */}
                        <div className="flex flex-wrap items-center gap-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold">Month:</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="border-2 border-black px-3 py-2 font-bold"
                                >
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                        <option key={i + 1} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-bold">Year:</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="border-2 border-black px-3 py-2 font-bold"
                                >
                                    {[2024, 2025, 2026, 2027].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={fetchMarketingEntries}
                                disabled={isLoadingEntries}
                                className="bg-brand-yellow border-2 border-black px-4 py-2 font-bold text-sm uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                            >
                                {isLoadingEntries ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                Load
                            </button>
                        </div>

                        {/* Add new entry form */}
                        <section className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-candu uppercase text-black">
                                <Plus className="h-5 w-5 text-brand-navy" />
                                Add Entry
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="lg:col-span-2">
                                    <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">URL *</label>
                                    <input
                                        type="url"
                                        placeholder="Paste URL (Instagram, YouTube, LinkedIn, etc.)"
                                        value={newEntryUrl}
                                        onChange={(e) => setNewEntryUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddMarketingEntry()}
                                        className="w-full px-4 py-3 border-2 border-black text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        YouTube videos: analytics can be auto-fetched after adding
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Cost (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newEntryCost}
                                        onChange={(e) => setNewEntryCost(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Notes</label>
                                    <input
                                        type="text"
                                        placeholder="Optional notes..."
                                        value={newEntryNotes}
                                        onChange={(e) => setNewEntryNotes(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black text-sm"
                                    />
                                </div>
                            </div>

                            {/* Analytics fields (collapsible) */}

                            {/* SERP keywords — shown for any non-social-media URL */}
                            {newEntryUrl && !['youtube.com', 'youtu.be', 'instagram.com', 'tiktok.com', 'linkedin.com', 'twitter.com', 'x.com'].some(d => newEntryUrl.toLowerCase().includes(d)) && (
                                <div className="mt-3 p-3 bg-orange-50 border border-orange-200">
                                    <label className="text-xs font-bold uppercase text-orange-700 mb-1 block">🔍 SERP Keywords (Google Ranking)</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder='e.g. "idle game browser extension"'
                                            value={newEntryKeywordInput}
                                            onChange={(e) => setNewEntryKeywordInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewEntryKeyword() } }}
                                            className="flex-1 px-4 py-2 border-2 border-orange-300 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddNewEntryKeyword}
                                            disabled={!newEntryKeywordInput.trim()}
                                            className="px-3 py-2 bg-orange-500 text-white text-xs font-bold uppercase disabled:opacity-50"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    {newEntryKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {newEntryKeywords.map((kw, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                                                    {kw}
                                                    <button onClick={() => setNewEntryKeywords(newEntryKeywords.filter((_, j) => j !== i))} className="text-orange-400 hover:text-orange-700">✕</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-orange-600 mt-1">Add keywords to track this article&apos;s Google ranking (top 50+)</p>
                                </div>
                            )}

                            <details className="mt-4">
                                <summary className="text-xs font-bold uppercase text-neutral-500 cursor-pointer hover:text-neutral-700">
                                    + Manual Analytics (optional - for non-YouTube)
                                </summary>
                                <div className="grid gap-4 sm:grid-cols-3 mt-3 pt-3 border-t border-gray-200">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Impressions/Views</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={newEntryImpressions}
                                            onChange={(e) => setNewEntryImpressions(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Clicks</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={newEntryClicks}
                                            onChange={(e) => setNewEntryClicks(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 mb-1 block">Engagement (likes, comments)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={newEntryEngagement}
                                            onChange={(e) => setNewEntryEngagement(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 text-sm"
                                        />
                                    </div>
                                </div>
                            </details>

                            <button
                                onClick={handleAddMarketingEntry}
                                disabled={!newEntryUrl.trim() || isAddingEntry}
                                className="mt-4 bg-brand-yellow border-2 border-black px-6 py-3 font-bold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                {isAddingEntry ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                                ) : (
                                    <><Plus className="h-4 w-4" /> Add Entry</>
                                )}
                            </button>
                        </section>

                        {/* Entries List */}
                        <section className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-candu uppercase text-black">
                                <Link2 className="h-5 w-5 text-brand-navy" />
                                Entries ({marketingEntries.length})
                            </h2>

                            {isLoadingEntries ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
                                </div>
                            ) : marketingEntries.length > 0 ? (
                                <div className="space-y-4">
                                    {marketingEntries.map((entry) => (
                                        <div key={entry.id} className="flex gap-4 p-4 bg-gray-50 border-2 border-gray-200 hover:border-black transition-colors">
                                            {/* Thumbnail */}
                                            {entry.image_url && (
                                                <div className="w-20 h-20 flex-shrink-0 bg-gray-200 border border-gray-300 overflow-hidden">
                                                    <img
                                                        src={entry.image_url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`text-xs font-bold uppercase px-2 py-0.5 ${entry.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                                        entry.platform === 'youtube' ? 'bg-red-600 text-white' :
                                                            entry.platform === 'linkedin' ? 'bg-blue-700 text-white' :
                                                                entry.platform === 'twitter' ? 'bg-black text-white' :
                                                                    entry.platform === 'tiktok' ? 'bg-gradient-to-r from-cyan-400 to-pink-500 text-white' :
                                                                        entry.platform === 'blog' ? 'bg-orange-500 text-white' :
                                                                            'bg-gray-600 text-white'
                                                        }`}>
                                                        {entry.platform}
                                                    </span>
                                                    {entry.cost && (
                                                        <span className="text-sm font-bold text-green-700">€{entry.cost.toFixed(2)}</span>
                                                    )}
                                                    {/* Analytics badges */}
                                                    {entry.impressions && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                            {entry.impressions.toLocaleString()} views
                                                        </span>
                                                    )}
                                                    {entry.clicks && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                            {entry.clicks.toLocaleString()} clicks
                                                        </span>
                                                    )}
                                                    {/* Engagement breakdown - show individual metrics if available */}
                                                    {(entry.likes || entry.comments || entry.shares) ? (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1.5">
                                                            {entry.likes ? <span title="Likes">❤️ {entry.likes.toLocaleString()}</span> : null}
                                                            {entry.comments ? <span title="Comments">💬 {entry.comments.toLocaleString()}</span> : null}
                                                            {entry.shares ? <span title="Shares">↗️ {entry.shares.toLocaleString()}</span> : null}
                                                        </span>
                                                    ) : entry.engagement && (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                            {entry.engagement.toLocaleString()} engagement
                                                        </span>
                                                    )}
                                                    {/* SERP ranking badges (multi-keyword) */}
                                                    {entry.serp_keywords_data && entry.serp_keywords_data.length > 0 && entry.serp_keywords_data.map((kw) => (
                                                        kw.position ? (
                                                            <span key={kw.id} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold" title={kw.snippet || undefined}>
                                                                🏆 #{kw.position} for &quot;{kw.keyword}&quot;
                                                            </span>
                                                        ) : kw.last_checked ? (
                                                            <span key={kw.id} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded" title="URL not found in Google results">
                                                                🔍 Not ranked for &quot;{kw.keyword}&quot;
                                                            </span>
                                                        ) : (
                                                            <span key={kw.id} className="text-xs bg-orange-50 text-orange-400 px-2 py-0.5 rounded">
                                                                ⏳ &quot;{kw.keyword}&quot; (not checked yet)
                                                            </span>
                                                        )
                                                    ))}
                                                </div>
                                                <h3 className="font-bold text-sm line-clamp-1 mb-1">{entry.title}</h3>
                                                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                                                    {entry.url}
                                                </a>

                                                {/* Edit Mode */}
                                                {editingEntryId === entry.id ? (
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex gap-2 items-center flex-wrap">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="Cost €"
                                                                value={editEntryCost}
                                                                onChange={(e) => setEditEntryCost(e.target.value)}
                                                                className="w-24 px-2 py-1 border-2 border-black text-sm"
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Notes"
                                                                value={editEntryNotes}
                                                                onChange={(e) => setEditEntryNotes(e.target.value)}
                                                                className="flex-1 min-w-[100px] px-2 py-1 border-2 border-black text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 items-center flex-wrap">
                                                            <input
                                                                type="number"
                                                                placeholder="Views"
                                                                value={editEntryImpressions}
                                                                onChange={(e) => setEditEntryImpressions(e.target.value)}
                                                                className="w-24 px-2 py-1 border-2 border-gray-300 text-sm"
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Clicks"
                                                                value={editEntryClicks}
                                                                onChange={(e) => setEditEntryClicks(e.target.value)}
                                                                className="w-24 px-2 py-1 border-2 border-gray-300 text-sm"
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Engagement"
                                                                value={editEntryEngagement}
                                                                onChange={(e) => setEditEntryEngagement(e.target.value)}
                                                                className="w-24 px-2 py-1 border-2 border-gray-300 text-sm"
                                                            />
                                                        </div>
                                                        {(entry.platform === 'blog' || entry.platform === 'other') && (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold uppercase text-orange-700">🔍 SERP Keywords</label>
                                                                {/* Existing keywords as removable chips */}
                                                                {entry.serp_keywords_data && entry.serp_keywords_data.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {entry.serp_keywords_data.map((kw) => (
                                                                            <span key={kw.id} className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                                                                                {kw.keyword}
                                                                                {kw.position && <span className="text-orange-500">#{kw.position}</span>}
                                                                                <button
                                                                                    onClick={() => handleRemoveKeyword(kw.id)}
                                                                                    disabled={removingKeywordId === kw.id}
                                                                                    className="text-orange-400 hover:text-red-600 disabled:opacity-50"
                                                                                >
                                                                                    {removingKeywordId === kw.id ? <Loader2 className="h-3 w-3 animate-spin" /> : '✕'}
                                                                                </button>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {/* Add new keyword */}
                                                                <div className="flex gap-1 items-center">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Add keyword..."
                                                                        value={editEntryKeywordInput}
                                                                        onChange={(e) => setEditEntryKeywordInput(e.target.value)}
                                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeywordToEntry(entry.id) } }}
                                                                        className="flex-1 px-2 py-1 border-2 border-orange-300 text-sm bg-orange-50"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAddKeywordToEntry(entry.id)}
                                                                        disabled={!editEntryKeywordInput.trim() || addingKeywordForEntry === entry.id}
                                                                        className="px-2 py-1 bg-orange-500 text-white text-xs font-bold disabled:opacity-50"
                                                                    >
                                                                        {addingKeywordForEntry === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : '+ Add'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleUpdateMarketingEntry(entry.id)}
                                                                className="px-3 py-1 bg-green-500 text-white text-xs font-bold"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingEntryId(null)}
                                                                className="px-3 py-1 bg-gray-300 text-black text-xs font-bold"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : entry.notes ? (
                                                    <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                                                ) : null}
                                            </div>

                                            {/* Actions */}
                                            {editingEntryId !== entry.id && (
                                                <div className="flex flex-col gap-1">
                                                    {/* Refresh button for supported platforms */}
                                                    {(['youtube', 'instagram', 'tiktok', 'linkedin'].includes(entry.platform) || (['blog', 'other'].includes(entry.platform) && entry.serp_keywords_data && entry.serp_keywords_data.length > 0)) && (
                                                        <button
                                                            onClick={() => handleRefreshAnalytics(entry.id)}
                                                            disabled={refreshingEntryId === entry.id}
                                                            className="p-2 text-green-600 hover:bg-green-100 border border-transparent hover:border-green-200 disabled:opacity-50"
                                                            title={`Refresh ${entry.platform === 'youtube' ? 'YouTube' : 'Olostep'} analytics`}
                                                        >
                                                            {refreshingEntryId === entry.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <RefreshCw className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => startEditingEntry(entry)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMarketingEntry(entry.id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 border border-transparent hover:border-red-200"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-neutral-400">
                                    <Link2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No entries for this month. Add a URL above or load a different month.</p>
                                </div>
                            )}
                        </section>
                    </TabsContent>

                    {/* REPORT TAB - Summary and PDF Generation */}
                    <TabsContent value="report" className="space-y-6 mt-6">
                        <section className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 font-candu uppercase text-black">
                                <FileText className="h-5 w-5 text-brand-navy" />
                                Monthly Report Generator
                            </h2>
                            <p className="text-sm text-neutral-600 mb-6">Generate a comprehensive PDF report with user metrics, financials, environmental impact, and marketing entries from the current month.</p>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
                                <div className="p-4 bg-green-50 border border-green-200">
                                    <div className="text-xs font-bold uppercase text-green-700 mb-1">Trees This Month</div>
                                    <div className="text-2xl font-bold text-green-800">{getTreesThisMonth().toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-200">
                                    <div className="text-xs font-bold uppercase text-blue-700 mb-1">Total Trees</div>
                                    <div className="text-2xl font-bold text-blue-800">{getTotalTrees().toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-yellow-50 border border-yellow-200">
                                    <div className="text-xs font-bold uppercase text-yellow-700 mb-1">Revenue</div>
                                    <div className="text-2xl font-bold text-yellow-800">€{stats?.monthlyRevenue.toFixed(2) || '0.00'}</div>
                                </div>
                                <div className="p-4 bg-purple-50 border border-purple-200">
                                    <div className="text-xs font-bold uppercase text-purple-700 mb-1">Marketing Entries</div>
                                    <div className="text-2xl font-bold text-purple-800">{marketingEntries.length}</div>
                                </div>
                                <div className="p-4 bg-red-50 border border-red-200">
                                    <div className="text-xs font-bold uppercase text-red-700 mb-1">Marketing Cost</div>
                                    <div className="text-2xl font-bold text-red-800">€{marketingTotals.totalCost.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-2 border-gray-200 p-4 mb-6">
                                <h3 className="font-bold text-sm mb-2">Report includes:</h3>
                                <ul className="text-sm text-gray-600 grid gap-1">
                                    <li>• User metrics (total users, new users, WAU, churn rate)</li>
                                    <li>• Financials (revenue, costs, profit/loss)</li>
                                    <li>• Environmental impact (trees planted, donations)</li>
                                    <li>• Marketing entries from the Marketing tab ({marketingEntries.length} entries, €{marketingTotals.totalCost.toFixed(2)} total cost)</li>
                                </ul>
                            </div>

                            <button
                                onClick={generateMonthlyReport}
                                disabled={isGeneratingPdf}
                                className="w-full bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-4 font-bold uppercase text-sm tracking-wider text-black hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isGeneratingPdf ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Generating PDF...</>
                                ) : (
                                    <><Download className="h-5 w-5" /> Generate Monthly Report PDF</>
                                )}
                            </button>
                        </section>
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

                    {/* POWER USERS TAB */}
                    <TabsContent value="power-users" className="space-y-6 mt-6">
                        {isLoadingUsers ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
                                <span className="ml-3 text-neutral-600 font-bold">Loading users...</span>
                            </div>
                        ) : (
                            <>
                                {/* Segment Stats Cards */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-extrabold flex items-center gap-2 font-candu uppercase text-black">
                                            <Users className="h-5 w-5 text-brand-navy" />
                                            User Segments
                                            {(selectedSegment === 'active' || selectedSegment === 'new_users' || selectedSegment === 'power_users' || selectedSegment === 'team_owners' || selectedSegment === 'profile_no_desktop') && (
                                                <button
                                                    onClick={() => handleSyncSegment(selectedSegment as UserSegment)}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border-2 border-black hover:bg-brand-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <Mail className="h-3 w-3" /> Sync to Resend
                                                </button>
                                            )}
                                        </h2>
                                        <button
                                            onClick={fetchPowerUsersData}
                                            className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        >
                                            <RefreshCw className="h-4 w-4" /> Refresh
                                        </button>
                                    </div>

                                    {/* Search Filter */}
                                    <div className="mb-6">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                                        <button
                                            onClick={() => setSelectedSegment('all')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'all' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="h-4 w-4 text-brand-navy" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">All Users</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.total || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('power_users')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'power_users' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap className="h-4 w-4 text-yellow-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Power Users</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.power_users || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('active')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'active' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Activity className="h-4 w-4 text-green-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Active (7d)</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.active || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('inactive')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'inactive' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-4 w-4 text-red-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Inactive (30d+)</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.inactive || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('new_users')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'new_users' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <UserPlus className="h-4 w-4 text-blue-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">New (30d)</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.new_users || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('unopted_desktop')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'unopted_desktop' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Unopted Desktop</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.unopted_desktop || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('extension_no_desktop')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'extension_no_desktop' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <MousePointer className="h-4 w-4 text-orange-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Extension Only</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.extension_no_desktop || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('profile_no_desktop')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'profile_no_desktop' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Monitor className="h-4 w-4 text-blue-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Profile No Desktop</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.profile_no_desktop || 0}</div>
                                        </button>
                                        <button
                                            onClick={() => setSelectedSegment('team_owners')}
                                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left transition-all ${selectedSegment === 'team_owners' ? 'bg-brand-yellow' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                <span className="text-xs font-bold uppercase text-neutral-500">Team Owners</span>
                                            </div>
                                            <div className="text-2xl font-extrabold font-candu">{segmentStats?.team_owners || 0}</div>
                                        </button>
                                    </div>
                                </section>

                                {/* Sync to Resend Section */}
                                <section className="bg-brand-navy border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <Mail className="h-5 w-5 text-brand-yellow" />
                                                Sync to Resend
                                            </h3>
                                            <p className="text-sm text-gray-300 mt-1">
                                                {selectedSegment === 'all'
                                                    ? `Sync all ${filteredUsers.filter(u => u.email).length} users with emails to Resend audience`
                                                    : `Sync ${filteredUsers.filter(u => u.email).length} users with emails to Resend audience`
                                                }
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {selectedSegment === 'all' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSyncAllUsers(true)}
                                                        disabled={isSyncingAllUsers}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all"
                                                    >
                                                        {isSyncingAllUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                        Preview
                                                    </button>
                                                    <button
                                                        onClick={() => handleSyncAllUsers(false)}
                                                        disabled={isSyncingAllUsers}
                                                        className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all"
                                                    >
                                                        {isSyncingAllUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                        Sync Now
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleSyncSegment(selectedSegment, true)}
                                                        disabled={syncingSegment !== null}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all"
                                                    >
                                                        {syncingSegment === selectedSegment ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                        Preview
                                                    </button>
                                                    <button
                                                        onClick={() => handleSyncSegment(selectedSegment, false)}
                                                        disabled={syncingSegment !== null}
                                                        className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all"
                                                    >
                                                        {syncingSegment === selectedSegment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                        Sync Now
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {selectedSegment === 'all' && syncAllUsersResult && (
                                        <div className={`mt-4 p-3 border-2 border-black ${syncAllUsersResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <p className={`text-sm font-bold ${syncAllUsersResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                                {syncAllUsersResult.message}
                                            </p>
                                        </div>
                                    )}
                                    {selectedSegment !== 'all' && syncResult && syncResult.segment === selectedSegment && (
                                        <div className={`mt-4 p-3 border-2 border-black ${syncResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <p className={`text-sm font-bold ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                                {syncResult.message}
                                            </p>
                                        </div>
                                    )}
                                </section>

                                {/* User Table */}
                                <section className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-4">
                                        {selectedSegment === 'all' ? 'All Users' : `${selectedSegment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`} ({filteredUsers.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b-2 border-black">
                                                    <TableHead className="text-xs font-bold">Name</TableHead>
                                                    <TableHead className="text-xs font-bold">Email</TableHead>
                                                    <TableHead className="text-right text-xs font-bold">Points</TableHead>
                                                    <TableHead className="text-xs font-bold">Last Active</TableHead>
                                                    <TableHead className="text-xs font-bold">Segments</TableHead>
                                                    <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUsers.slice(0, 50).map((user) => (
                                                    <TableRow key={user.id} className="border-b border-neutral-200">
                                                        <TableCell className="font-bold text-xs py-2">
                                                            <div>{user.display_name}</div>
                                                            {user.team_name && (
                                                                <div className="flex items-center gap-1 text-[10px] text-orange-600 mt-0.5 font-normal">
                                                                    <Trophy className="h-3 w-3" />
                                                                    Owner of {user.team_name}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-2 text-neutral-600">
                                                            {user.email || <span className="text-red-400">No email</span>}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs py-2 font-semibold">
                                                            {user.total_points.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-2 text-neutral-600">
                                                            {user.last_active
                                                                ? new Date(user.last_active).toLocaleDateString()
                                                                : <span className="text-neutral-400">Never</span>}
                                                        </TableCell>
                                                        <TableCell className="text-xs py-2">
                                                            <div className="flex gap-1 flex-wrap">
                                                                {user.segments.map(seg => (
                                                                    <span
                                                                        key={seg}
                                                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-black ${seg === 'power_users' ? 'bg-yellow-100' :
                                                                            seg === 'active' ? 'bg-green-100' :
                                                                                seg === 'inactive' ? 'bg-red-100' :
                                                                                    seg === 'unopted_desktop' ? 'bg-purple-100' :
                                                                                        seg === 'profile_no_desktop' ? 'bg-blue-100' :
                                                                                        'bg-blue-100'
                                                                            }`}
                                                                    >
                                                                        {seg.replace(/_/g, ' ')}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs py-2">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => handleViewEmailHistory(user)}
                                                                    className="inline-flex items-center justify-center p-2 text-neutral-500 hover:text-brand-navy hover:bg-blue-50 transition-colors"
                                                                    title="View Email History"
                                                                >
                                                                    <History className="h-4 w-4" />
                                                                </button>
                                                                {user.email && (
                                                                    <button
                                                                        onClick={() => handleOpenEmailModal(user)}
                                                                        className="inline-flex items-center justify-center p-2 text-brand-navy hover:bg-blue-50 transition-colors"
                                                                        title="Send Email"
                                                                    >
                                                                        <Mail className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {filteredUsers.length > 50 && (
                                            <p className="text-center text-sm text-neutral-500 mt-4">
                                                Showing first 50 of {filteredUsers.length} users
                                            </p>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </TabsContent>

                    {/* AUDIENCES TAB */}
                    <TabsContent value="audiences" className="space-y-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-extrabold flex items-center gap-2 font-candu uppercase text-black">
                                <List className="h-5 w-5 text-brand-navy" />
                                Email Lists ({audiences.length})
                            </h2>
                            <button
                                onClick={() => selectedAudienceId && fetchContacts(selectedAudienceId)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoadingContacts ? 'animate-spin' : ''}`} /> Refresh
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-6">
                            {/* Audience List Sidebar */}
                            <div className="lg:col-span-1 space-y-2">
                                <h3 className="text-sm font-bold uppercase text-neutral-500 mb-2">Select Audience</h3>
                                {audiences.map(audience => (
                                    <button
                                        key={audience.id}
                                        onClick={() => setSelectedAudienceId(audience.id)}
                                        className={`w-full text-left p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all ${selectedAudienceId === audience.id ? 'bg-brand-yellow translate-x-[1px] translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        {audience.name}
                                    </button>
                                ))}
                                {audiences.length === 0 && (
                                    <div className="p-4 bg-neutral-100 border-2 border-dashed border-neutral-300 text-sm text-neutral-500 text-center">
                                        No audiences found in Resend.
                                    </div>
                                )}
                            </div>

                            {/* Contacts Table */}
                            <div className="lg:col-span-3">
                                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-base font-bold text-black mb-4 flex items-center justify-between">
                                        <span>Contacts in List ({audienceContacts.length})</span>
                                        {selectedAudienceId && <span className="text-xs font-normal text-neutral-500 uppercase tracking-wider">ID: {selectedAudienceId}</span>}
                                    </h3>

                                    {isLoadingContacts ? (
                                        <div className="py-12 flex justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b-2 border-black">
                                                        <TableHead className="text-xs font-bold">Email</TableHead>
                                                        <TableHead className="text-xs font-bold">Name</TableHead>
                                                        <TableHead className="text-xs font-bold">Status</TableHead>
                                                        <TableHead className="text-right text-xs font-bold">Joined</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {audienceContacts.length > 0 ? audienceContacts.map((contact, i) => (
                                                        <TableRow key={i} className="border-b border-neutral-200">
                                                            <TableCell className="font-bold text-xs py-2">{contact.email}</TableCell>
                                                            <TableCell className="text-xs py-2 text-neutral-600">
                                                                {contact.firstName ? `${contact.firstName} ${contact.lastName || ''}` : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-xs py-2">
                                                                {contact.unsubscribed ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-[10px] font-bold uppercase">
                                                                        <UserX className="h-3 w-3" /> Unsubscribed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase">
                                                                        <Zap className="h-3 w-3" /> Active
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs py-2 text-neutral-500">
                                                                {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    )) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                                                                No contacts in this list specifically. Power users might be synced but not showing here if the Resend API delay is active.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="templates" className="space-y-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-extrabold flex items-center gap-2 font-candu uppercase text-black">
                                <FileText className="h-5 w-5 text-brand-navy" />
                                Email Templates
                            </h2>
                            <button
                                onClick={() => {
                                    setTemplateModalMode('create')
                                    setNewTemplate({ name: '', subject: '', content: '', from_email: '' })
                                    setIsTemplateModalOpen(true)
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <Plus className="h-4 w-4" /> Create Template
                            </button>
                        </div>

                        {/* Broadcast Campaign Section */}
                        <div className="bg-brand-navy border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <Send className="h-5 w-5 text-brand-yellow" />
                                Send Broadcast Campaign
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Select Template</label>
                                    <select
                                        value={broadcastTemplateId}
                                        onChange={(e) => setBroadcastTemplateId(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
                                    >
                                        <option value="">Choose a template...</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Select Audience</label>
                                    <select
                                        value={broadcastAudienceId}
                                        onChange={(e) => setBroadcastAudienceId(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
                                    >
                                        <option value="">Choose an audience...</option>
                                        {audiences.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                    {audiences.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-1">Load audiences from Lists tab first</p>
                                    )}
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleSendBroadcast}
                                        disabled={!broadcastTemplateId || !broadcastAudienceId || isSendingBroadcast}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-yellow text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isSendingBroadcast ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" /> Send Broadcast
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {broadcastResult && (
                                <div className={`mt-4 p-3 border-2 border-black ${broadcastResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <p className={`text-sm font-bold ${broadcastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {broadcastResult.message}
                                    </p>
                                </div>
                            )}

                            {/* Preview Section */}
                            {broadcastTemplateId && broadcastAudienceId && (
                                <div className="mt-6 pt-6 border-t-2 border-gray-600">
                                    <h4 className="text-sm font-bold uppercase text-gray-300 mb-4 flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> Preview Before Sending
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Email Preview */}
                                        <div className="bg-white border-2 border-black">
                                            <div className="bg-neutral-100 border-b-2 border-black px-3 py-2 text-xs font-bold uppercase text-neutral-500">
                                                Email Template
                                            </div>
                                            {(() => {
                                                const selectedTemplate = templates.find(t => t.id === broadcastTemplateId)
                                                if (!selectedTemplate) return null
                                                return (
                                                    <div className="p-3">
                                                        <p className="text-sm font-bold mb-2 truncate">Subject: {selectedTemplate.subject}</p>
                                                        <div className="h-[200px]">
                                                            <EmailPreview html={selectedTemplate.content} />
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>

                                        {/* Recipients Preview */}
                                        <div className="bg-white border-2 border-black">
                                            <div className="bg-neutral-100 border-b-2 border-black px-3 py-2 text-xs font-bold uppercase text-neutral-500 flex items-center justify-between">
                                                <span>Recipients</span>
                                                <span className="bg-brand-navy text-white px-2 py-0.5 rounded-full text-[10px]">
                                                    {audienceContacts.filter(c => !c.unsubscribed).length} active
                                                </span>
                                            </div>
                                            <div className="p-3 max-h-[240px] overflow-y-auto">
                                                {isLoadingContacts ? (
                                                    <div className="flex justify-center py-4">
                                                        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                                    </div>
                                                ) : audienceContacts.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {audienceContacts.filter(c => !c.unsubscribed).slice(0, 10).map((contact, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs border-b border-neutral-100 pb-2">
                                                                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                                                                <span className="font-medium truncate">{contact.firstName || 'User'}</span>
                                                                <span className="text-neutral-400 truncate">{contact.email}</span>
                                                            </div>
                                                        ))}
                                                        {audienceContacts.filter(c => !c.unsubscribed).length > 10 && (
                                                            <p className="text-xs text-neutral-400 text-center pt-2">
                                                                +{audienceContacts.filter(c => !c.unsubscribed).length - 10} more recipients
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-neutral-400 text-center py-4">
                                                        Select audience from Lists tab to load contacts
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map(template => (
                                <div key={template.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold mb-2">{template.name}</h3>
                                        <p className="text-sm font-semibold text-neutral-600 mb-2">Subject: {template.subject}</p>

                                        {/* Visual Preview */}
                                        <div className="w-full h-[180px] mb-4">
                                            <EmailPreview html={template.content} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-neutral-100 gap-2">
                                        <button
                                            onClick={() => handleEditTemplate(template)}
                                            className="text-neutral-600 hover:text-black p-2"
                                            title="Edit Template"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="text-red-600 hover:text-red-800 p-2"
                                            title="Delete Template"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && (
                                <div className="col-span-full py-12 text-center text-neutral-500 border-2 border-dashed border-neutral-300">
                                    No templates created yet.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* NODE TRANSFERS TAB */}
                    <TabsContent value="node-transfers" className="space-y-6 mt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <div>
                                <h2 className="text-xl font-extrabold flex items-center gap-2 font-candu uppercase text-black">
                                    <Monitor className="h-5 w-5 text-brand-navy" />
                                    Node Transfers
                                </h2>
                                <p className="text-sm text-neutral-600 mt-1">Approve account-switching requests without moving historical contribution rows.</p>
                            </div>
                            <button
                                onClick={() => fetchNodeTransferRequests()}
                                disabled={isLoadingNodeTransfers}
                                className="bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 font-bold uppercase text-sm tracking-wider text-black hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoadingNodeTransfers ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {nodeTransferResult && (
                            <div className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 font-bold ${nodeTransferResult.success ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                                {nodeTransferResult.message}
                            </div>
                        )}

                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            {isLoadingNodeTransfers ? (
                                <div className="p-12 flex justify-center text-neutral-500">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : nodeTransferRequests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black bg-neutral-50">
                                                <TableHead className="font-bold text-black uppercase text-xs">Node</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Original Owner</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Requested Owner</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Request</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Status</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {nodeTransferRequests.map((request) => {
                                                const isPending = request.status === 'pending'
                                                const currentOwnerChanged = request.node_current_user_id && request.from_user_id && request.node_current_user_id !== request.from_user_id
                                                return (
                                                    <TableRow key={request.id} className="border-b border-neutral-200 hover:bg-neutral-50 align-top">
                                                        <TableCell className="min-w-[220px]">
                                                            <div className="font-mono text-sm font-bold text-black">{compactId(request.node_identifier, 10)}</div>
                                                            <div className="mt-1 text-xs text-neutral-500 flex flex-wrap gap-2">
                                                                <span>{request.node_platform || 'extension'}</span>
                                                                <span>{(request.node_total_requests || 0).toLocaleString()} requests</span>
                                                                {request.node_opt_in === false && <span className="text-red-600 font-bold">opted out</span>}
                                                            </div>
                                                            {currentOwnerChanged && (
                                                                <div className="mt-2 text-xs font-bold text-red-700 flex items-center gap-1">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Current owner: {compactId(request.node_current_user_id)}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="min-w-[220px]">
                                                            <div className="font-bold text-black">{request.from_display_name || request.from_email || 'Unknown user'}</div>
                                                            <div className="text-xs text-neutral-500 font-mono">{compactId(request.from_user_id)}</div>
                                                        </TableCell>
                                                        <TableCell className="min-w-[220px]">
                                                            <div className="font-bold text-black">{request.to_display_name || request.to_email || 'Unknown user'}</div>
                                                            <div className="text-xs text-neutral-500 font-mono">{compactId(request.to_user_id)}</div>
                                                        </TableCell>
                                                        <TableCell className="min-w-[220px]">
                                                            <div className="text-sm text-black">{request.reason || 'No reason provided'}</div>
                                                            <div className="text-xs text-neutral-500 mt-1">{formatDateTime(request.created_at)}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex border px-2 py-1 text-xs font-bold uppercase ${getTransferStatusClass(request.status)}`}>
                                                                {request.status}
                                                            </span>
                                                            {request.resolved_at && (
                                                                <div className="text-xs text-neutral-500 mt-2">{formatDateTime(request.resolved_at)}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right min-w-[170px]">
                                                            {isPending ? (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleNodeTransferDecision(request.id, 'approve')}
                                                                        disabled={nodeTransferActionId === request.id}
                                                                        className="bg-green-100 text-green-900 border-2 border-black px-3 py-2 font-bold text-xs uppercase hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                                                                    >
                                                                        {nodeTransferActionId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleNodeTransferDecision(request.id, 'reject')}
                                                                        disabled={nodeTransferActionId === request.id}
                                                                        className="bg-red-100 text-red-900 border-2 border-black px-3 py-2 font-bold text-xs uppercase hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-neutral-500 font-bold uppercase">No action</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-neutral-500 flex flex-col items-center">
                                    <Monitor className="h-12 w-12 text-neutral-300 mb-4" />
                                    <p className="font-bold text-black text-lg">No Node Transfer Requests</p>
                                    <p className="text-sm mt-1">Requests appear here when a logged-in user asks to move a local node from another account.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* COMPANIES TAB */}
                    <TabsContent value="companies" className="space-y-6 mt-6">
                        <div className="flex justify-between items-center bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <div>
                                <h2 className="text-xl font-extrabold flex items-center gap-2 font-candu uppercase text-black">
                                    <TreePine className="h-5 w-5 text-brand-navy" />
                                    Companies & Portals
                                </h2>
                                <p className="text-sm text-neutral-600 mt-1">Manage B2B partners and their custom widgets</p>
                            </div>
                            <button
                                onClick={openCreateCompany}
                                className="bg-brand-navy text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 flex items-center gap-2 font-bold hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                            >
                                <Plus className="h-4 w-4" /> New Company
                            </button>
                        </div>

                        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            {isLoadingCompanies ? (
                                <div className="p-12 flex justify-center text-neutral-500">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : companies.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-2 border-black bg-neutral-50">
                                                <TableHead className="font-bold text-black uppercase text-xs">Name</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Slug</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Invite Code</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs">Color</TableHead>
                                                <TableHead className="font-bold text-black uppercase text-xs text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {companies.map((company) => (
                                                <TableRow key={company.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {company.logo_url && (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={company.logo_url} alt="Logo" className="w-6 h-6 rounded-full object-cover border border-neutral-300" />
                                                            )}
                                                            {company.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">/c/{company.slug || '—'}</TableCell>
                                                    <TableCell className="font-mono text-sm">{company.invite_code || '—'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-sm border border-black" style={{ backgroundColor: company.theme_color || '#10B981' }}></div>
                                                            <span className="text-xs">{company.theme_color}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const url = `${window.location.origin}/en/widget/c/${company.slug}`
                                                                    navigator.clipboard.writeText(`<iframe src="${url}" width="350px" height="450px" style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" allow="clipboard-write"></iframe>`)
                                                                    alert('Widget iframe code copied to clipboard!')
                                                                }}
                                                                className="text-neutral-500 hover:text-black p-2" title="Copy Widget Code">
                                                                <Code className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setPreviewCompany(company)}
                                                                className="text-neutral-500 hover:text-brand-yellow p-2" title="Preview Widget">
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => startEditingCompany(company)} className="text-neutral-500 hover:text-brand-navy p-2" title="Edit">
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteCompany(company.id)} className="text-red-500 hover:text-red-700 p-2" title="Delete">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-neutral-500 flex flex-col items-center">
                                    <TreePine className="h-12 w-12 text-neutral-300 mb-4" />
                                    <p className="font-bold text-black text-lg">No Companies Yet</p>
                                    <p className="text-sm mt-1 mb-4">Create your first B2B client company to generate a widget.</p>
                                    <button onClick={openCreateCompany} className="text-brand-navy font-bold hover:underline">Create Company</button>
                                </div>
                            )}
                        </div>
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
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Devices</div>
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

            {/* CREATE/EDIT COMPANY MODAL */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] flex flex-col relative">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-brand-yellow">
                            <h2 className="text-xl font-extrabold font-candu uppercase">
                                {companyModalMode === 'create' ? 'Create New Company' : 'Edit Company'}
                            </h2>
                            <button
                                onClick={() => setIsCompanyModalOpen(false)}
                                className="p-1 hover:bg-black/10 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-black block">Company Name *</label>
                                        <input
                                            type="text"
                                            value={newCompany.name}
                                            onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy font-medium"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-black block">Slug (URL)</label>
                                        <input
                                            type="text"
                                            value={newCompany.slug}
                                            onChange={e => setNewCompany({ ...newCompany, slug: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy font-mono text-sm"
                                            placeholder="acme-corp"
                                        />
                                        <p className="text-xs text-neutral-500">Used for /c/slug portal</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-black block">Invite Code</label>
                                        <input
                                            type="text"
                                            value={newCompany.invite_code}
                                            onChange={e => setNewCompany({ ...newCompany, invite_code: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy font-mono text-sm"
                                            placeholder="acme123"
                                        />
                                        <p className="text-xs text-neutral-500">Gateway code for the widget tracking</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold uppercase tracking-wider text-black block">Theme Color (Hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={newCompany.theme_color}
                                                onChange={e => setNewCompany({ ...newCompany, theme_color: e.target.value })}
                                                className="w-12 h-11 border-2 border-black cursor-pointer p-0"
                                            />
                                            <input
                                                type="text"
                                                value={newCompany.theme_color}
                                                onChange={e => setNewCompany({ ...newCompany, theme_color: e.target.value })}
                                                className="flex-1 px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 items-center flex gap-3 pt-8 border-t border-neutral-200 mt-4">
                                        <input
                                            type="checkbox"
                                            id="invite_only_check"
                                            checked={newCompany.is_invite_only}
                                            onChange={e => setNewCompany({ ...newCompany, is_invite_only: e.target.checked })}
                                            className="w-5 h-5 border-2 border-black rounded-none appearance-none checked:bg-brand-navy checked:border-brand-navy flex items-center justify-center relative outline-none"
                                        />
                                        <div>
                                            <label htmlFor="invite_only_check" className="text-sm font-bold uppercase tracking-wider text-black block cursor-pointer">Invite Only Registration</label>
                                            <p className="text-xs text-neutral-500">Requires valid invite code to join</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-neutral-200 pt-4 mt-4">
                                    <label className="text-sm font-bold uppercase tracking-wider text-black block">Custom Explainer Video URL (YouTube, MP4)</label>
                                    <input
                                        type="url"
                                        value={newCompany.video_url}
                                        onChange={e => setNewCompany({ ...newCompany, video_url: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy"
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-black block">Company Logo URL</label>
                                    <input
                                        type="url"
                                        value={newCompany.logo_url}
                                        onChange={e => setNewCompany({ ...newCompany, logo_url: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy"
                                        placeholder="https://acme.com/logo.png"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wider text-black block">Short Description</label>
                                    <textarea
                                        value={newCompany.description}
                                        onChange={e => setNewCompany({ ...newCompany, description: e.target.value })}
                                        className="w-full min-h-[100px] px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-brand-navy resize-y"
                                        placeholder="Join us in making the world greener..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t-4 border-black bg-neutral-50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsCompanyModalOpen(false)}
                                className="px-6 py-2 border-2 border-black font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveCompany}
                                disabled={isSavingCompany || !newCompany.name.trim()}
                                className="px-6 py-2 border-2 border-black font-bold uppercase tracking-wider text-white bg-brand-navy hover:bg-brand-navy/90 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                            >
                                {isSavingCompany && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Company
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW WIDGET MODAL */}
            {previewCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md flex flex-col relative overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-neutral-50">
                            <h2 className="text-lg font-extrabold font-candu uppercase text-black break-words flex-1 pr-4">
                                Preview: {previewCompany.name}
                            </h2>
                            <button
                                onClick={() => setPreviewCompany(null)}
                                className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-8 bg-neutral-100 flex items-center justify-center min-h-[500px]">
                            {/* Iframe wrapper to simulate widget embed */}
                            <iframe
                                src={`/en/widget/c/${previewCompany.slug}`}
                                width="350px"
                                height="450px"
                                className="border-none rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] bg-white"
                                title={`Preview Widget for ${previewCompany.name}`}
                            ></iframe>
                        </div>

                        <div className="p-4 border-t-4 border-black bg-neutral-50 flex justify-between items-center text-xs text-neutral-500 font-medium">
                            <span>Width: 350px</span>
                            <span>Height: 450px</span>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT TEMPLATE MODAL */}
            {
                isTemplateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-4xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-h-[95vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-extrabold font-candu uppercase text-black">
                                    {templateModalMode === 'create' ? 'Create Template' : 'Edit Template'}
                                </h2>
                                <button onClick={handleCloseTemplateModal} className="p-1 hover:bg-neutral-100 rounded">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <Tabs defaultValue="edit" className="w-full">
                                <TabsList className="mb-4 bg-neutral-100 border border-neutral-200">
                                    <TabsTrigger value="edit" className="flex gap-2 items-center">
                                        <Code className="h-4 w-4" /> Editor
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="flex gap-2 items-center">
                                        <Eye className="h-4 w-4" /> Preview
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="edit">
                                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Template Name</label>
                                                <input
                                                    required
                                                    value={newTemplate.name}
                                                    onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                    placeholder="e.g. Welcome Email"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">From Email</label>
                                                <input
                                                    value={newTemplate.from_email}
                                                    onChange={e => setNewTemplate({ ...newTemplate, from_email: e.target.value })}
                                                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                    placeholder="Daniel from IdleForest <daniel@idleforest.com>"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Subject Line</label>
                                            <input
                                                required
                                                value={newTemplate.subject}
                                                onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                placeholder="Email subject..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">HTML Content</label>
                                            <textarea
                                                required
                                                value={newTemplate.content}
                                                onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-black min-h-[400px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                                placeholder="<p>Enter HTML content here...</p>"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-6">
                                            <button
                                                type="button"
                                                onClick={handleCloseTemplateModal}
                                                className="px-4 py-2 font-bold border-2 border-transparent hover:bg-neutral-100"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                                            >
                                                {templateModalMode === 'create' ? 'Create Template' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </TabsContent>

                                <TabsContent value="preview">
                                    <div className="border-2 border-neutral-300 rounded-md bg-gray-50 overflow-hidden">
                                        <div className="bg-white border-b border-neutral-200 p-3 text-sm text-neutral-500 flex gap-4">
                                            <span><span className="font-bold text-black">Subject:</span> {newTemplate.subject || '(No subject)'}</span>
                                        </div>
                                        <div className="bg-white min-h-[500px] w-full">
                                            <iframe
                                                srcDoc={newTemplate.content}
                                                className="w-full h-[500px]"
                                                title="Email Preview"
                                                sandbox="allow-same-origin"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                )
            }

            {/* SEND EMAIL MODAL */}
            {
                isEmailModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-extrabold font-candu uppercase text-black flex items-center gap-2">
                                    <Mail className="h-5 w-5" /> Send Email
                                </h2>
                                <button onClick={() => setIsEmailModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {emailResult && (
                                <div className={`mb-4 p-3 border-2 border-black ${emailResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    <p className="font-bold text-sm">{emailResult.message}</p>
                                </div>
                            )}

                            <form onSubmit={handleSendEmail} className="space-y-4">
                                <div className="bg-neutral-50 p-3 border border-neutral-200 text-sm">
                                    <span className="font-bold text-neutral-500">To:</span> {emailCompose.userEmail}
                                </div>

                                {templates.length > 0 && (
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Load Template</label>
                                        <select
                                            onChange={(e) => handleLoadTemplate(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-white"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select a template...</option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold mb-1">Subject</label>
                                    <input
                                        required
                                        value={emailCompose.subject}
                                        onChange={e => setEmailCompose({ ...emailCompose, subject: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        placeholder="Subject line..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Message (HTML)</label>
                                    <textarea
                                        required
                                        value={emailCompose.content}
                                        onChange={e => setEmailCompose({ ...emailCompose, content: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-black min-h-[200px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                                        placeholder="Email content..."
                                    />
                                </div>

                                <div className="flex justify-between gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleSendTestEmail}
                                        disabled={emailCompose.loading || !emailCompose.content || !emailCompose.subject}
                                        className="px-4 py-2 bg-brand-navy text-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                                        title="Send test email to daniiba account"
                                    >
                                        🧪 Test (daniiba)
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEmailModalOpen(false)}
                                            className="px-4 py-2 font-bold border-2 border-transparent hover:bg-neutral-100"
                                            disabled={emailCompose.loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={emailCompose.loading}
                                            className="px-6 py-2 bg-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                                        >
                                            {emailCompose.loading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Send className="h-4 w-4" /> Send Email
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* EMAIL HISTORY MODAL */}
            {
                isHistoryModalOpen && historyUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-extrabold font-candu uppercase text-black flex items-center gap-2">
                                        <History className="h-5 w-5" /> Email History
                                    </h2>
                                    <p className="text-sm text-neutral-500 mt-1">{historyUser.display_name} ({historyUser.email || 'No email'})</p>
                                </div>
                                <button onClick={() => setIsHistoryModalOpen(false)} className="p-1 hover:bg-neutral-100 rounded">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {isLoadingHistory ? (
                                <div className="py-12 flex justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
                                </div>
                            ) : emailHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {emailHistory.map((log) => (
                                        <div key={log.id} className="p-4 border-2 border-neutral-200 hover:border-black transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{log.subject}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.email_type === 'broadcast' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {log.email_type}
                                                        </span>
                                                        {log.segment && (
                                                            <span className="text-neutral-400">• {log.segment.replace('_', ' ')}</span>
                                                        )}
                                                    </div>
                                                    {/* Tracking indicators */}
                                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                                        {log.delivered_at && (
                                                            <span className="flex items-center gap-1 text-green-600" title={`Delivered: ${new Date(log.delivered_at).toLocaleString()}`}>
                                                                <Check className="h-3 w-3" /> Delivered
                                                            </span>
                                                        )}
                                                        {log.opened_at && (
                                                            <span className="flex items-center gap-1 text-blue-600" title={`Opened: ${new Date(log.opened_at).toLocaleString()}`}>
                                                                <Eye className="h-3 w-3" /> Opened
                                                            </span>
                                                        )}
                                                        {log.clicked_at && (
                                                            <span className="flex items-center gap-1 text-purple-600" title={`Clicked: ${new Date(log.clicked_at).toLocaleString()}`}>
                                                                <MousePointer className="h-3 w-3" /> Clicked
                                                            </span>
                                                        )}
                                                        {log.bounced_at && (
                                                            <span className="flex items-center gap-1 text-red-600" title={`Bounced: ${new Date(log.bounced_at).toLocaleString()}`}>
                                                                <X className="h-3 w-3" /> Bounced
                                                            </span>
                                                        )}
                                                        {log.complained_at && (
                                                            <span className="flex items-center gap-1 text-orange-600" title={`Spam complaint: ${new Date(log.complained_at).toLocaleString()}`}>
                                                                <AlertTriangle className="h-3 w-3" /> Spam
                                                            </span>
                                                        )}
                                                        {!log.delivered_at && !log.bounced_at && log.status === 'sent' && (
                                                            <span className="flex items-center gap-1 text-neutral-400">
                                                                <Clock className="h-3 w-3" /> Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase ${log.status === 'sent' || log.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        log.status === 'bounced' || log.status === 'complained' ? 'bg-red-100 text-red-700' :
                                                            'bg-neutral-100 text-neutral-700'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                    <p className="text-xs text-neutral-400 mt-1">
                                                        {new Date(log.sent_at).toLocaleDateString()} {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-neutral-500 border-2 border-dashed border-neutral-300">
                                    <History className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                                    <p className="font-bold">No emails sent to this user yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    )
}
