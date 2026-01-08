import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()

  // Handle PKCE code flow (new Supabase auth)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        redirect('/auth/user/reset-password')
      }
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // Handle legacy token_hash flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        redirect('/auth/user/reset-password')
      }
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}