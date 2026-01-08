'use client'

import { Card } from "@/components/ui/card"
import { useState } from "react"
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('partners')
        .insert({
          user_id: user.id,
          company_name: formData.get('company_name'),
          website: formData.get('website'),
          contact_name: formData.get('contact_name'),
          company_size: formData.get('company_size'),
          donate_earnings: formData.get('donate_earnings') === 'true'
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Partner profile setup completed"
      })

      router.push('/partner')
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to complete setup",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md p-8 space-y-8 bg-gray-900 border-brand-yellow">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Partner Setup</h1>
          <p className="text-gray-400">Tell us about your business</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="company_name" className="text-sm font-medium">
              Company Name
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md bg-gray-800 border-gray-700 focus:border-brand-yellow focus:ring-brand-yellow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              required
              className="w-full px-3 py-2 border rounded-md bg-gray-800 border-gray-700 focus:border-brand-yellow focus:ring-brand-yellow"
              placeholder="https://"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact_name" className="text-sm font-medium">
              Contact Name
            </label>
            <input
              id="contact_name"
              name="contact_name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md bg-gray-800 border-gray-700 focus:border-brand-yellow focus:ring-brand-yellow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company_size" className="text-sm font-medium">
              Company Size
            </label>
            <select
              id="company_size"
              name="company_size"
              required
              className="w-full px-3 py-2 border rounded-md bg-gray-800 border-gray-700 focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201+">201+ employees</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="donate_earnings"
                value="true"
                className="rounded border-gray-700 bg-gray-800 text-brand-yellow focus:ring-brand-yellow"
              />
              <span className="text-sm font-medium">Donate my earnings to environmental causes</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-brand-yellow hover:bg-brand-yellow rounded-lg focus:ring-4 focus:ring-brand-yellow disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </Card>
    </main>
  )

}