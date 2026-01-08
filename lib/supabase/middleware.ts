import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to public routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/auth') ||
     request.nextUrl.pathname.startsWith('/profile') ||
     request.nextUrl.pathname.startsWith('/verify') ||
     request.nextUrl.pathname.startsWith('/install') ||
     request.nextUrl.pathname === '/' || true)
  ) {
    return supabaseResponse
  }

  // Redirect to login if no user and trying to access protected route
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Allow access to verification and onboarding pages
  if (
    request.nextUrl.pathname.startsWith('/onboarding')
  ) {
    return supabaseResponse
  }

  return supabaseResponse
}
