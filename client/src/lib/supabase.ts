import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate Supabase configuration
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return url.includes('.supabase.co')
  } catch {
    return false
  }
}

export const hasSupabaseConfig = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl)
)

// Create Supabase client only with valid credentials
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type { User, Session } from '@supabase/supabase-js'