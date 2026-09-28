'use client'

import Navigation from "@/components/navigation"
import DesktopUpgradeBanner from "@/components/DesktopUpgradeBanner"
import ReferralPrompt from "@/components/referrals/ReferralPrompt"
import ReferralAttributionSync from "@/components/referrals/ReferralAttributionSync"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">

      <Navigation variant="dashboard" />
      <ReferralAttributionSync />
      <DesktopUpgradeBanner />
      <ReferralPrompt />
      {/* Main content */}
      <main className="flex-1 bg-brand-gray">
        {children}
      </main>
    </div>
  )
}
