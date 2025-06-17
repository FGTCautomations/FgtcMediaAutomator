import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have real Supabase credentials
export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey)

// Only create client if credentials are available
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export type { User, Session } from '@supabase/supabase-js'