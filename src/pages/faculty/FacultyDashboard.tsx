import React, { useEffect, useState } from 'react'
import {
  GraduationCap, Upload, FileText, CheckCircle, XCircle,
  Clock, AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/ui/Skeleton'
import { format } from 'date-fns'

export const FacultyDashboard: React.FC = () => {
  const { user, profile } = useAuthStore()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      fetchData()
    } else {
      setDemoData()
    }
  }, [user])

  const setDemoData = () => {
    setStats({ pending: 3, approved: 8, rejected: 1 })
    setSubmissions([
      { id: '1', title: 'Unit 1 DC Circuits Notes', submission_type: 'note', category: 'handwritten', status: 'approved', created_at: new Date().toISOString() },
      { id: '2', title: 'BEEE PYQ 2023', submission_type: 'question_paper', category: null, status: 'pending', created_at: new Date().toISOString() },
      { id: '3', title: 'KCL Important Questions', submission_type: 'question', category: null, status: 'pending', created_at: new Date().toISOString() },
    ])
    setLoading(false)
  }

  const fetchData = async () => {
    if (!user) return
    const { data } = await supabase
      .from('upload_submissions')
      .select('*')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false })

    const subs = data ?? []
    setSubmissions(subs)
    setStats({
      pending: subs.filter(s => s.status === 'pending').length,
      approved: subs.filter(s => s.status === 'approved').length,
      rejected: subs.filter(s => s.status === 'rejected').length,
    })
    setLoading(false)
  }

  const statusConfig = {
    pending: { label: 'Pending Review', color: 'badge-yellow', icon: Clock },
    approved: { label: 'Approved', color: 'badge-green', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'badge-red', icon: XCircle },
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-navy-900 p-6">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-purple-400 to-brand-400 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-purple-300 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white font-display">{profile?.full_name}</h1>
            <p className="text-purple-200 text-sm mt-0.5">Faculty Portal — Manage your study materials</p>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">Demo Mode — Connect Supabase to manage real uploads</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock },
          { label: 'Approved', value: stats.approved, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
        ].map((s, i) => (
          <div key={i} className="card p-5 text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className={`text-3xl font-bold font-display ${s.color}`}>{s.value}</div>
            <div className="text-xs text-navy-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/upload" className="card p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-navy-900 dark:text-white">Upload Study Material</p>
            <p className="text-sm text-navy-500">Share notes, questions, and PYQs</p>
          </div>
        </Link>
        <Link to="/faculty/materials" className="card p-5 flex items-center gap-4 group hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-navy-900 dark:text-white">My Materials</p>
            <p className="text-sm text-navy-500">View and manage uploaded content</p>
          </div>
        </Link>
      </div>

      {/* Recent Submissions */}
      <div>
        <h2 className="section-title mb-4">My Submissions</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : submissions.length === 0 ? (
          <div className="card p-12 text-center">
            <Upload className="w-10 h-10 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-500 font-medium">No uploads yet</p>
            <p className="text-navy-400 text-sm mt-1">Start by uploading study materials</p>
            <Link to="/upload" className="btn btn-primary btn-sm mt-4 inline-flex">Upload Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub, i) => {
              const sc = statusConfig[sub.status as keyof typeof statusConfig]
              return (
                <div key={sub.id} className="card p-4 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 dark:text-white text-sm line-clamp-1">{sub.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-gray capitalize text-xs">{sub.submission_type.replace('_', ' ')}</span>
                      {sub.category && <span className="badge badge-blue capitalize text-xs">{sub.category}</span>}
                      <span className="text-xs text-navy-400">{format(new Date(sub.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <span className={`badge ${sc.color}`}>{sc.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
