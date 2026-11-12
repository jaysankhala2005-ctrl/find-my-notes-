import React, { useEffect, useState } from 'react'
import {
  Shield, Users, BookOpen, FileText, CheckCircle, XCircle,
  Download, BarChart3,
  Settings, Upload, GraduationCap, AlertTriangle, Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalFaculty: number
  totalNotes: number
  pendingApprovals: number
  totalSubjects: number
  totalDownloads: number
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, totalStudents: 0, totalFaculty: 0,
    totalNotes: 0, pendingApprovals: 0, totalSubjects: 0, totalDownloads: 0,
  })
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchAdminData()
    } else {
      setDemoData()
    }
  }, [])

  const setDemoData = () => {
    setStats({
      totalUsers: 127, totalStudents: 119, totalFaculty: 8,
      totalNotes: 45, pendingApprovals: 12, totalSubjects: 5, totalDownloads: 1847,
    })
    setPendingSubmissions([
      { id: '1', title: 'Unit 3 Chemistry Notes', submission_type: 'note', category: 'handwritten', created_at: new Date().toISOString(), submitted_by: 'student1@example.com', status: 'pending' },
      { id: '2', title: 'BEEE PYQ 2024', submission_type: 'question_paper', category: null, created_at: new Date().toISOString(), submitted_by: 'faculty@example.com', status: 'pending' },
      { id: '3', title: 'KCL Important Questions', submission_type: 'question', category: null, created_at: new Date().toISOString(), submitted_by: 'student2@example.com', status: 'pending' },
    ])
    setLoading(false)
  }

  const fetchAdminData = async () => {
    const [usersRes, notesRes, subjectsRes, submissionsRes] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('notes').select('id, status, download_count'),
      supabase.from('subjects').select('id', { count: 'exact' }),
      supabase.from('upload_submissions').select('*, submitted_by(full_name, email)').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
    ])

    const users = usersRes.data ?? []
    const notes = notesRes.data ?? []

    setStats({
      totalUsers: users.length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalFaculty: users.filter(u => u.role === 'faculty').length,
      totalNotes: notes.filter(n => n.status === 'approved').length,
      pendingApprovals: notes.filter(n => n.status === 'pending').length,
      totalSubjects: subjectsRes.count ?? 0,
      totalDownloads: notes.reduce((sum, n) => sum + (n.download_count ?? 0), 0),
    })
    setPendingSubmissions(submissionsRes.data ?? [])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    if (!isSupabaseConfigured()) { toast.error('Supabase not configured'); return }
    const { error } = await supabase.from('upload_submissions').update({ status: 'approved' }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setPendingSubmissions(prev => prev.filter(s => s.id !== id))
    setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }))
    toast.success('Submission approved!')
  }

  const handleReject = async (id: string) => {
    if (!isSupabaseConfigured()) { toast.error('Supabase not configured'); return }
    const reason = window.prompt('Rejection reason (optional):')
    const { error } = await supabase.from('upload_submissions')
      .update({ status: 'rejected', rejection_reason: reason || null })
      .eq('id', id)
    if (error) { toast.error(error.message); return }
    setPendingSubmissions(prev => prev.filter(s => s.id !== id))
    setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }))
    toast.success('Submission rejected')
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, sub: `${stats.totalStudents} students · ${stats.totalFaculty} faculty`, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
    { icon: FileText, label: 'Approved Notes', value: stats.totalNotes, sub: 'Live study materials', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: Clock, label: 'Pending Reviews', value: stats.pendingApprovals, sub: 'Awaiting approval', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', urgent: stats.pendingApprovals > 0 },
    { icon: Download, label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), sub: 'All time', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: BookOpen, label: 'Subjects', value: stats.totalSubjects, sub: 'Across all semesters', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ]

  const adminLinks = [
    { icon: Users, label: 'Manage Users', to: '/admin/users', desc: 'View and manage student & faculty accounts' },
    { icon: GraduationCap, label: 'Manage Courses', to: '/admin/courses', desc: 'Add/edit courses, semesters, subjects, units' },
    { icon: FileText, label: 'Manage Notes', to: '/admin/notes', desc: 'Upload, approve, or delete study materials' },
    { icon: Upload, label: 'Pending Approvals', to: '/admin/approvals', desc: `${stats.pendingApprovals} items waiting for review`, urgent: stats.pendingApprovals > 0 },
    { icon: BarChart3, label: 'Analytics', to: '/admin/analytics', desc: 'View platform statistics and trends' },
    { icon: Settings, label: 'Settings', to: '/admin/settings', desc: 'Configure platform settings' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display">Admin Dashboard</h1>
          <p className="text-navy-500 text-sm">Platform management & content moderation</p>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Demo Mode:</strong> Showing sample data. Connect Supabase to manage real content.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={clsx('card p-4 animate-fade-in-up', card.urgent && 'border-amber-300 dark:border-amber-600')}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-navy-900 dark:text-white font-display">{card.value}</div>
                <div className="text-xs font-medium text-navy-600 dark:text-navy-400">{card.label}</div>
                <div className="text-xs text-navy-400 mt-1">{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Quick Links */}
        <div>
          <h2 className="section-title mb-4">Management Tools</h2>
          <div className="space-y-3">
            {adminLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className={clsx(
                  'card p-4 flex items-center gap-4 group hover:shadow-md transition-all animate-fade-in-up',
                  link.urgent && 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
                )}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  link.urgent ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-navy-100 dark:bg-navy-700'
                )}>
                  <link.icon className={clsx('w-5 h-5', link.urgent ? 'text-amber-600' : 'text-navy-600 dark:text-navy-300')} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-navy-900 dark:text-white text-sm flex items-center gap-2">
                    {link.label}
                    {link.urgent && <span className="badge badge-yellow">Urgent</span>}
                  </div>
                  <div className="text-xs text-navy-500 dark:text-navy-400">{link.desc}</div>
                </div>
                <CheckCircle className="w-4 h-4 text-navy-300 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Approvals
            {stats.pendingApprovals > 0 && (
              <span className="badge badge-yellow">{stats.pendingApprovals}</span>
            )}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-navy-600 dark:text-navy-400 font-medium">All caught up!</p>
              <p className="text-navy-400 text-sm">No pending submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map((sub, i) => (
                <div
                  key={sub.id}
                  className="card p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Upload className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy-900 dark:text-white text-sm line-clamp-1">{sub.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="badge badge-yellow capitalize">{sub.submission_type.replace('_', ' ')}</span>
                        {sub.category && <span className="badge badge-gray capitalize">{sub.category}</span>}
                        <span className="text-xs text-navy-400">{format(new Date(sub.created_at), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(sub.id)}
                      className="btn btn-sm flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(sub.id)}
                      className="btn btn-sm flex-1 btn-danger"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}

              {pendingSubmissions.length > 0 && (
                <Link to="/admin/approvals" className="flex items-center justify-center py-3 text-sm text-brand-600 font-medium hover:underline">
                  View all pending submissions →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
