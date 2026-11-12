import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, role?: 'student' | 'faculty') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred'

  const rawMessage = typeof error === 'string' ? error : (error.message || '')
  const msg = rawMessage.toLowerCase()
  const name = error?.name || ''
  const status = error?.status

  // Network / server connection failure
  if (
    name === 'AuthRetryableFetchError' ||
    msg.includes('networkerror') ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('load failed') ||
    msg.includes('network request failed') ||
    msg.includes('connection refused') ||
    status === 0
  ) {
    return 'Server not reachable. Please check backend/Supabase connection and try again.'
  }

  // Invalid credentials
  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('invalid_grant') ||
    msg.includes('invalid email or password')
  ) {
    return 'Invalid email or password'
  }

  // User already exists
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'An account with this email already exists'
  }

  // Email unconfirmed
  if (msg.includes('email not confirmed')) {
    return 'Email address is not confirmed. Please check your inbox for verification link.'
  }

  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429) {
    return 'Too many attempts. Please try again after some time.'
  }

  return rawMessage || 'An unexpected error occurred'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) return { error: formatAuthError(error) }
          if (data.user) {
            await get().fetchProfile(data.user.id)
          }
          return { error: null }
        } catch (err: any) {
          return { error: formatAuthError(err) }
        }
      },

      signUp: async (email, password, fullName, role = 'student') => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, role },
            },
          })
          if (error) return { error: formatAuthError(error) }
          if (data.user) {
            // Profile created automatically via DB trigger
          }
          return { error: null }
        } catch (err: any) {
          return { error: formatAuthError(err) }
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null })
      },

      fetchProfile: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (!error && data) {
            set({ profile: data })
          }
        } catch (err) {
          console.error('Error fetching profile:', err)
        }
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          if (error) return { error: formatAuthError(error) }
          return { error: null }
        } catch (err: any) {
          return { error: formatAuthError(err) }
        }
      },

      updatePassword: async (newPassword) => {
        try {
          const { error } = await supabase.auth.updateUser({ password: newPassword })
          if (error) return { error: formatAuthError(error) }
          return { error: null }
        } catch (err: any) {
          return { error: formatAuthError(err) }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
