import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, AlertCircle, CheckCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabase'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signUp } = useAuthStore()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'faculty',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = passwordStrength(formData.password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500']

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) return setError('Please enter your full name')
    if (!formData.email) return setError('Please enter your email')
    if (formData.password.length < 6) return setError('Password must be at least 6 characters')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match')

    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured. Please add your credentials to .env.local', { duration: 5000 })
      return
    }

    setLoading(true)
    setError('')

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.role,
    )

    setLoading(false)

    if (signUpError) {
      setError(signUpError)
      return
    }

    setSuccess(true)
    toast.success('Account created! Please check your email to verify.')
    setTimeout(() => navigate('/login'), 3000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-navy-900 p-6">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white font-display mb-2">
            Account Created! 🎉
          </h2>
          <p className="text-navy-500 dark:text-navy-400 mb-6">
            We've sent a verification email to <strong>{formData.email}</strong>.
            Please verify your email to activate your account.
          </p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white font-display mb-3">Join Today</h1>
          <p className="text-navy-300 text-lg mb-8">Start your engineering journey with the best study materials</p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { title: 'Free Access', desc: 'All notes are free forever', icon: '🎓' },
              { title: 'Organized', desc: 'Subject and unit-wise structure', icon: '📂' },
              { title: 'Updated', desc: 'Latest study materials', icon: '🔄' },
              { title: 'Contribute', desc: 'Share your own notes', icon: '🤝' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-semibold text-sm">{item.title}</div>
                <div className="text-navy-400 text-xs mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-navy-900 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-navy-900 dark:text-white font-display">Find My Notes</h1>
              <p className="text-xs text-navy-500">Study Smart · Score Higher</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-navy-900 dark:text-white font-display">
              Create account
            </h2>
            <p className="text-navy-500 dark:text-navy-400 mt-1">
              Join thousands of engineering students
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Role selection */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'faculty'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleChange('role', r)}
                    className={clsx(
                      'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                      formData.role === r
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-400 hover:border-navy-300'
                    )}
                  >
                    {r === 'student' ? '👨‍🎓' : '👨‍🏫'}
                    <span className="capitalize">{r}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signupEmail" className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  id="signupEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signupPassword" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={clsx(
                          'h-1 flex-1 rounded-full transition-all',
                          strength >= s ? strengthColors[strength] : 'bg-navy-200 dark:bg-navy-700'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-navy-500">
                    Password strength: <span className="font-medium">{strengthLabels[strength] || 'Very Weak'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={clsx(
                    'input pl-10 pr-10',
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-400 focus:ring-red-200'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-400 focus:ring-green-200'
                      : ''
                  )}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              id="signup-submit-btn"
              className="btn btn-gradient btn-lg w-full mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-navy-500 dark:text-navy-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="link font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
