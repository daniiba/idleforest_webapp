import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {


  const response = await updateSession(request)

  // A/B Testing Logic
  const url = request.nextUrl
  const variantParam = url.searchParams.get('variant')

  if (variantParam && ['original', 'video', 'screenshots'].includes(variantParam)) {
    // If variant param exists and is valid, set it and update cookie
    response.cookies.set('ab-variant', variantParam)
  } else if (!request.cookies.get('ab-variant')) {
    const variants = ['original', 'video', 'screenshots']
    const randomVariant = variants[Math.floor(Math.random() * variants.length)]
    response.cookies.set('ab-variant', randomVariant)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (external webhook endpoints)
     * - discord (discord related paths)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|discord/bot-added|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}