import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Pass empty strings if undefined to prevent React tree crash on mount.
  // Supabase will properly throw an error when a method (like signIn) is actually called.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}
