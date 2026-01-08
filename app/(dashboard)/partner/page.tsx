'use client'

import { Card } from "@/components/ui/card"

export default function PartnerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Partner Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 bg-gray-900 border-brand-yellow">
          <h2 className="text-xl font-semibold mb-2">Total Trees</h2>
          <p className="text-3xl font-bold text-brand-yellow">0</p>
        </Card>
        <Card className="p-6 bg-gray-900 border-brand-yellow">
          <h2 className="text-xl font-semibold mb-2">Active Users</h2>
          <p className="text-3xl font-bold text-brand-yellow">0</p>
        </Card>
        <Card className="p-6 bg-gray-900 border-brand-yellow">
          <h2 className="text-xl font-semibold mb-2">Total Impact</h2>
          <p className="text-3xl font-bold text-brand-yellow">0 kg CO2</p>
        </Card>
      </div>
    </div>
  )
}
