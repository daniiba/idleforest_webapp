"use client"

import { useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/client'
import AnnualReport2023 from "@/components/annual-report"
import Navigation from "@/components/navigation"
import { DailyImpactTable } from "@/components/analytics/DailyImpactTable"
import { HistoricalDataChart } from "@/components/analytics/HistoricalDataChart"
import { FileText, BarChart3 } from "lucide-react"
import { SmartCTA } from "@/components/smart-cta"
import { useTranslations } from "next-intl"

interface HistoricalData {
  created_at: string
  requests_total: number
  active_nodes: number
  earnings: number
  total_users?: number
}

interface UserHistoryData {
  date: string
  total_users: number
}

// Create client once outside component
const supabase = createClient()

export default function ReportPage() {
  const t = useTranslations('Report')
  const [activeTab, setActiveTab] = useState<'report' | 'analytics'>('report')
  const [data, setData] = useState<HistoricalData[]>([])
  const [userHistory, setUserHistory] = useState<UserHistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const latestStats = data[data.length - 1]

  useEffect(() => {
    fetchHistoricalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchHistoricalData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('mellowtel_stats')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      setData(data || [])
      await fetchUserHistory()
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserHistory = async () => {
    try {
      const response = await fetch('/api/report/user-history')
      if (!response.ok) throw new Error('Failed to fetch user history')

      const result = await response.json()
      setUserHistory(result.history || [])
    } catch (error) {
      console.error('Error fetching user history:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] pb-16 text-brand-navy">
      <Navigation />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                {t('annual')} {t('report')}
              </h1>

              {/* Tabs moved here */}
              <div className="inline-flex rounded-full bg-white p-1 gap-1 mb-8 ring-1 ring-neutral-200">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-5 py-2 rounded-full font-semibold transition-colors text-sm ${activeTab === 'report'
                    ? 'bg-brand-navy text-white'
                    : 'text-neutral-600 hover:text-brand-navy'
                    }`}
                >
                  <FileText className="inline-block mr-2 h-4 w-4" />
                  {t('annual_report')}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-5 py-2 rounded-full font-semibold transition-colors text-sm ${activeTab === 'analytics'
                    ? 'bg-brand-navy text-white'
                    : 'text-neutral-600 hover:text-brand-navy'
                    }`}
                >
                  <BarChart3 className="inline-block mr-2 h-4 w-4" />
                  {t('analytics')}
                </button>
              </div>

              {/* Content */}
              {activeTab === 'report' && (
                <AnnualReport2023
                  liveEarnings={latestStats?.earnings ?? null}
                />
              )}

              {activeTab === 'analytics' && (
                loading ? (
                  <div className="flex h-[240px] w-full items-center justify-center rounded-3xl border border-neutral-200 bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-navy"></div>
                  </div>
                ) : (
                  <DailyImpactTable
                    data={data}
                    userHistory={userHistory}
                    middle={<HistoricalDataChart data={data} userHistory={userHistory} />}
                  />
                )
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-7 sticky top-24">
              <h3 className="text-xl font-extrabold text-brand-navy mb-3">
                {t('about_title')}
              </h3>
              <p className="text-neutral-900 mb-6 leading-relaxed">
                {t('about_desc')}
              </p>

              <SmartCTA className="w-full text-black" showLearnMore={false} forceVertical={true} buttonVariant="inverse" desktopOnly showExtensionDownload={false} />

              <div className="mt-6 text-sm text-neutral-800 border-t border-brand-navy/15 pt-4 font-medium">
                <p className="mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-brand-navy text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {t('free_to_use')}
                </p>
                <p className="mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-brand-navy text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {t('no_account')}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-brand-navy text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {t('open_source')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
