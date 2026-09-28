'use client'

import Navigation from "@/components/navigation"
import DashboardNotice from "@/components/DashboardNotice"
import ReferralAttributionSync from "@/components/referrals/ReferralAttributionSync"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">

      <Navigation variant="dashboard" hideBanner />
      <ReferralAttributionSync />
      <DashboardNotice />
      {/* Main content */}
      <main className="flex-1 bg-brand-gray">
        {children}
      </main>
    </div>
  )
}
