import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabase'

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return setError('Please enter your email')
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please add your credentials to .env.local')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await resetPassword(email)
    setLoading(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-navy-900 p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-navy-900 dark:text-white font-display">Find My Notes</h1>
            <p className="text-xs text-navy-500">Study Smart · Score Higher</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white font-display mb-2">
              Check Your Email
            </h2>
            <p className="text-navy-500 dark:text-navy-400 mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-navy-900 dark:text-white font-display">
                Forgot password?
              </h2>
              <p className="text-navy-500 dark:text-navy-400 mt-1">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="resetEmail" className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-gradient btn-lg w-full">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                ) : 'Send Reset Link'}
              </button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-navy-500 hover:text-navy-700 dark:hover:text-navy-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
