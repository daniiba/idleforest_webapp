import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware({
  locales: ['en', 'es', 'de', 'pt', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes, specific paths, and non-locale app routes
  // Only skip i18n for app-internal routes (API, auth, game, dashboard pages)
  const skipI18nPaths = ['/api', '/auth', '/game', '/install', '/extension-auth', '/onboarding', '/create-team', '/test-donation', '/claim-tree', '/share', '/download-success', '/stats', '/profile', '/admin'];
  if (skipI18nPaths.some(path => pathname.startsWith(path))) {
    return await updateSession(request);
  }

  // 1. Run i18n middleware
  const response = handleI18nRouting(request);

  // 2. Run Supabase middleware (auth)
  const supabaseResponse = await updateSession(request, response);

  // 3. A/B Testing Logic
  const url = request.nextUrl
  const variantParam = url.searchParams.get('variant')

  if (variantParam && ['original', 'video', 'screenshots'].includes(variantParam)) {
    supabaseResponse.cookies.set('ab-variant', variantParam)
  } else if (!request.cookies.get('ab-variant')) {
    const variants = ['original', 'video', 'screenshots']
    const randomVariant = variants[Math.floor(Math.random() * variants.length)]
    supabaseResponse.cookies.set('ab-variant', randomVariant)
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - api/webhooks (external webhook endpoints)
    // - discord/bot-added (discord related paths)
    // - images and other static assets
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|discord/bot-added|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}