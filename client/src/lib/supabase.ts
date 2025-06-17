import { createClient } from '@supabase/supabase-js'

// Use the correct Supabase project credentials
const supabaseUrl = 'https://bospemspdmewrvpkuajp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvc3BlbXNwZG1ld3J2cGt1YWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNDYwOTgsImV4cCI6MjA2NTcyMjA5OH0.oa8kSVnmmzy4t3hM9lgl_dul22VS35l3MH9iCYi0r8o'

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
  isValidUrl(supabaseUrl) &&
  supabaseAnonKey.startsWith('eyJ') // Validate JWT format
)

// Create Supabase client only with valid credentials
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type { User, Session } from '@supabase/supabase-js'