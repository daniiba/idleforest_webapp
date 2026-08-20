import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {
  ACQUISITION_COOKIE,
  ACQUISITION_COOKIE_MAX_AGE,
  hasAcquisitionParameters,
} from '@/lib/acquisition-constants';

const handleI18nRouting = createMiddleware({
  locales: ['en', 'es', 'de', 'pt', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
  alternateLinks: false
});

async function entityExists(table: 'teams' | 'profiles', column: 'slug' | 'display_name', operator: 'eq' | 'ilike', value: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const params = new URLSearchParams({
    select: 'id',
    [column]: `${operator}.${value}`,
    limit: '1',
  });

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const rows = await response.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return null;
  }
}

function withAcquisitionCookie(request: NextRequest, response: NextResponse) {
  if (hasAcquisitionParameters(request.nextUrl.searchParams)) {
    response.cookies.set(ACQUISITION_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: ACQUISITION_COOKIE_MAX_AGE,
    });
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');

  if (host === 'idleforest.com') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = 'www.idleforest.com';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  if (pathname === '/rankings') {
    const url = request.nextUrl.clone();
    url.pathname = '/teams';
    url.search = '';
    return NextResponse.redirect(url, 301);
  }

  const teamMatch = pathname.match(/^\/(?:(?:es|de|pt|fr)\/)?teams\/([^/]+)$/);
  if (teamMatch) {
    const exists = await entityExists('teams', 'slug', 'eq', decodeURIComponent(teamMatch[1]));
    if (exists === false) {
      return new Response(null, { status: 410 });
    }
  }

  const profileMatch = pathname.match(/^\/(?:(?:en|es|de|pt|fr)\/)?profile\/([^/]+)$/);
  if (profileMatch) {
    const exists = await entityExists('profiles', 'display_name', 'ilike', decodeURIComponent(profileMatch[1]));
    if (exists === false) {
      return new Response(null, { status: 410 });
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  const requestWithPathname = new NextRequest(request.url, {
    headers: requestHeaders,
    method: request.method,
  });

  // Skip i18n for API routes, specific paths, and non-locale app routes
  // Only skip i18n for app-internal routes (API, auth, game, dashboard pages)
  const skipI18nPaths = ['/api', '/auth', '/game', '/install', '/extension-auth', '/onboarding', '/create-team', '/test-donation', '/claim-tree', '/share', '/download-success', '/download', '/impact', '/stats', '/profile', '/admin', '/record'];
  if (skipI18nPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return withAcquisitionCookie(request, await updateSession(requestWithPathname));
  }

  const homepagePaths = ['/', '/es', '/de', '/pt', '/fr'];
  if (homepagePaths.includes(pathname) && request.nextUrl.searchParams.has('ref')) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('ref');
    return NextResponse.redirect(url, 308);
  }

  // Redirect localized blog/compare routes to English (base) route (308 Permanent Redirect)
  const localeMatch = pathname.match(/^\/(es|de|pt|fr)\/(blog|compare)($|\/)/);
  if (localeMatch) {
    const newPath = pathname.replace(/^\/(es|de|pt|fr)/, '');
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, 308);
  }

  // 1. Run i18n middleware
  const response = handleI18nRouting(requestWithPathname);

  // 2. Run Supabase middleware (auth)
  const supabaseResponse = await updateSession(requestWithPathname, response);
  supabaseResponse.headers.set('x-pathname', pathname);

  // Start a new first-party attribution session for every external campaign click.
  // The ID is intentionally opaque; click details are stored server-side.

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

  return withAcquisitionCookie(request, supabaseResponse);
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
    // - sitemap and robots
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|api/webhooks|discord/bot-added|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|mp4|txt|json)$).*)',
  ],
}
