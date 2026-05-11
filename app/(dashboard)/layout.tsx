'use client'

import Navigation from "@/components/navigation"
import DesktopUpgradeBanner from "@/components/DesktopUpgradeBanner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">

      <Navigation variant="dashboard" />
      <DesktopUpgradeBanner />
      {/* Main content */}
      <main className="flex-1 bg-brand-gray">
        {children}
      </main>
    </div>
  )
}
