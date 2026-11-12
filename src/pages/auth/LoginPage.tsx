import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabase'
import toast from 'react-hot-toast'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Server not reachable: Supabase credentials are not configured in .env / .env.local')
      toast.error('Supabase is not configured. Please add your credentials to .env', { duration: 5000 })
      return
    }

    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email.trim(), password)
    setLoading(false)

    if (signInError) {
      setError(signInError)
      return
    }

    toast.success('Welcome back! 🎉')
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col items-center justify-center p-8 xl:p-12 min-h-screen">
        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md w-full flex flex-col items-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/20 animate-pulse-glow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white font-display mb-2 tracking-tight">
            Find My Notes
          </h1>

          {/* Tagline */}
          <p className="text-xl text-brand-300 font-medium mb-7">
            Study Smart · Score Higher
          </p>

          {/* Feature list */}
          <div className="w-full flex flex-col gap-3 text-left">
            {[
              { emoji: '📚', text: 'Access handwritten notes from faculty & students' },
              { emoji: '📄', text: 'University official & Shivani publication notes' },
              { emoji: '📝', text: 'Unit-wise important questions (MIMP)' },
              { emoji: '🗓️', text: 'Previous year question papers (PYQs)' },
              { emoji: '🔖', text: 'Bookmark and track your study progress' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 glass rounded-xl px-4 py-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-xl flex-shrink-0 select-none leading-none">{item.emoji}</span>
                <p className="text-navy-200 text-sm font-medium leading-snug break-words">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 pt-2 w-full flex items-center justify-between max-w-sm mx-auto">
            <div className="text-center flex-1">
              <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight">500+</div>
              <div className="text-xs text-navy-400 font-medium mt-1">Study Materials</div>
            </div>
            <div className="h-8 w-px bg-white/10 self-center" />
            <div className="text-center flex-1">
              <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight">50+</div>
              <div className="text-xs text-navy-400 font-medium mt-1">Subjects</div>
            </div>
            <div className="h-8 w-px bg-white/10 self-center" />
            <div className="text-center flex-1">
              <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight">1000+</div>
              <div className="text-xs text-navy-400 font-medium mt-1">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white dark:bg-navy-900">
        <div className="w-full max-w-md my-auto flex flex-col justify-center animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-7 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-navy-900 dark:text-white font-display leading-tight">
                Find My Notes
              </h1>
              <p className="text-xs text-navy-500 dark:text-navy-400">Study Smart · Score Higher</p>
            </div>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white font-display tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-navy-500 dark:text-navy-400 mt-2">
              Sign in to access your study materials
            </p>
          </div>

          {/* Config warning if Supabase is not configured */}
          {!isSupabaseConfigured() && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Supabase Not Configured
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                    Please configure valid Supabase credentials in <code className="bg-amber-100 dark:bg-amber-800/60 px-1 py-0.5 rounded text-[11px]">.env</code> / <code className="bg-amber-100 dark:bg-amber-800/60 px-1 py-0.5 rounded text-[11px]">.env.local</code> to enable authentication.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2.5 p-3 sm:p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm leading-snug animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={error || !isSupabaseConfigured() ? 'mt-5 flex flex-col' : 'mt-6 flex flex-col'}
          >
            {/* Email field */}
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2 cursor-pointer"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="you@example.com"
                  className="input pl-10 h-11 w-full"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mt-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-navy-700 dark:text-navy-300 cursor-pointer"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline focus:outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10 h-11 w-full"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-gradient btn-lg w-full mt-6 h-12 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-navy-500 dark:text-navy-400 mt-5">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold hover:underline ml-1"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
