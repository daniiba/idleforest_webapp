import { createBrowserClient } from '@supabase/ssr'

// Singleton Supabase client for browser - per Supabase best practices
// This ensures all components share the same client instance and auth state
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Keep function for backwards compatibility during migration
export function createClient() {
  return supabase
}