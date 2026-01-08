
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ExtensionAuth() {
  const [isRecovery, setIsRecovery] = useState(false)
  const [extUrl, setExtUrl] = useState<string | null>(null)

  useEffect(() => {
    // Detect Supabase password reset flow (supports ?type=recovery or #type=recovery)
    const qs = (window.location.search || '').replace(/^\?/, '')
    let params = new URLSearchParams(qs)
    // If not found in search, check hash fragment
    if (!params.has('type')) {
      const hash = (window.location.hash || '').replace(/^#/, '')
      if (hash) {
        const hashParams = new URLSearchParams(hash)
        if (hashParams.has('type')) {
          params = hashParams
        }
      }
    }
    const type = (params.get('type') || '').toLowerCase()
    const recovery = type === 'recovery'
    setIsRecovery(recovery)

    if (recovery) {
      // Build extension URL preserving query as a hash fr
      const PROD_ID = 'ofdclafhpmccdddnmfalihgkahgiomjk'
      const EDGE_ID = 'cccklibfpcangcakgpllhcohldgcginb'
      const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : ''
 
      const isEdge = /Edg\//.test(ua)
	  console.log({isEdge})
      const extId =  isEdge ? EDGE_ID : PROD_ID
      const search = window.location.search || ''
      const forwardFragment = search ? `#${search.slice(1)}` : (window.location.hash || '')
      const url = `chrome-extension://${extId}/options.html${forwardFragment}`
      setExtUrl(url)

      // Auto-redirect to the extension for recovery flows (Chromium only)
      try {
        window.location.replace(url)
      } catch {}
    }
  }, [])

  return (
    <main className="min-h-screen bg-brand-gray text-white grid place-items-center px-6">
      <Card className="w-full max-w-xl bg-black border-2 border-neutral-800">
        <CardHeader>
          <CardTitle className="font-rethink-sans text-brand-yellow text-3xl md:text-4xl font-extrabold">
            Email Verified
          </CardTitle>
          <CardDescription>
            {isRecovery
              ? 'Password reset confirmed. You can now finish resetting your password in the Idle Forest extension.'
              : 'Your email has been successfully confirmed. You can now sign in to the Idle Forest browser extension.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-300">
            Open the Idle Forest extension from your browser toolbar (top-right) to continue. If you don’t see it, click the puzzle icon and pin the extension.
          </p>
          <p className="mt-3 text-sm text-neutral-400">
            You can now safely close this tab.
          </p>
        </CardContent>
        <CardFooter className="gap-3">
          {isRecovery && extUrl && (
            <Button asChild className="bg-brand-yellow text-black font-bold hover:text-brand-yellow rounded-full">
              <a href={extUrl}>Open in extension</a>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <a href="/">Go back home</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}