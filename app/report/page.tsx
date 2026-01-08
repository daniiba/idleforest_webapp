"use client"

import { useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/client'
import AnnualReport2023 from "@/components/annual-report"
import Navigation from "@/components/navigation"
import { HistoricalDataChart } from "@/components/analytics/HistoricalDataChart"
import { FileText, BarChart3 } from "lucide-react"
import { SmartCTA } from "@/components/smart-cta"

interface HistoricalData {
  created_at: string
  requests_total: number
  active_nodes: number
  earnings: number
}

// Create client once outside component
const supabase = createClient()

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'report' | 'analytics'>('report')
  const [data, setData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray pt-32 pb-12 font-inter">
      <Navigation />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <h1 className="font-candu text-[38px] sm:text-5xl md:text-6xl font-extrabold text-black uppercase leading-[1.05] mb-6">
                Annual <span className="text-brand-yellow bg-black px-2">Report</span>
              </h1>

              {/* Tabs moved here */}
              <div className="inline-flex rounded-lg bg-brand-navy/95 p-1 gap-1 mb-8">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors text-sm sm:text-base ${activeTab === 'report'
                    ? 'bg-brand-yellow text-black'
                    : 'text-white hover:text-brand-yellow'
                    }`}
                >
                  <FileText className="inline-block mr-2 h-4 w-4" />
                  Annual Report
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-2 sm:py-3 rounded-md font-semibold transition-colors text-sm sm:text-base ${activeTab === 'analytics'
                    ? 'bg-brand-yellow text-black'
                    : 'text-white hover:text-brand-yellow'
                    }`}
                >
                  <BarChart3 className="inline-block mr-2 h-4 w-4" />
                  Analytics
                </button>
              </div>

              {/* Content */}
              {activeTab === 'report' && <AnnualReport2023 />}

              {activeTab === 'analytics' && (
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
                  {loading ? (
                    <div className="h-[240px] w-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <div className="w-full space-y-6 sm:space-y-8">
                      <h2 className="text-2xl sm:text-3xl font-bold font-rethink-sans text-black">Historical Data</h2>
                      <HistoricalDataChart data={data} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand-yellow border-2 border-black p-8 sticky top-24 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                About IdleForest
              </h3>
              <p className="text-neutral-900 mb-6 leading-relaxed">
                IdleForest is a passive browser extension that plants trees while you browse, game, or stream.
                It uses your unused internet bandwidth to fund reforestation projects.
              </p>

              <SmartCTA className="w-full text-black" showLearnMore={false} forceVertical={true} buttonVariant="inverse" />

              <div className="mt-6 text-sm text-neutral-800 border-t-2 border-black/10 pt-4 font-medium">
                <p className="mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                  Free to use
                </p>
                <p className="mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                  No account required
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                  Open source
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}