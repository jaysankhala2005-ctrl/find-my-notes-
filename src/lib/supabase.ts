import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return false
  if (url === 'https://placeholder.supabase.co' || key === 'placeholder-key') return false
  if (url.includes('your-project-id') || key.includes('your-anon-key-here')) return false
  if (url.includes('<') || url.includes('>')) return false

  try {
    const parsed = new URL(url)
    return Boolean(parsed.protocol && parsed.host)
  } catch {
    return false
  }
}
