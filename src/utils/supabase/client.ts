import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If variables are missing or invalid, use a dummy valid URL to prevent the constructor from throwing.
  // This allows the UI to render so the user can see the custom error alerts instead of a white screen crash.
  const isValid = supabaseUrl && supabaseUrl.startsWith('http') && supabaseUrl !== 'your_supabase_url'

  return createBrowserClient(
    isValid ? supabaseUrl! : 'https://placeholder.supabase.co',
    isValid ? supabaseAnonKey! : 'placeholder-key'
  )
}
