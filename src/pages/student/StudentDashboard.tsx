import React, { useEffect, useState } from 'react'
import {
  BookOpen, Bookmark,
  TrendingUp, Upload, Star, ArrowRight,
  GraduationCap, ChevronRight, FileText,
  AlertCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'

interface StatsData {
  totalNotes: number
  totalSubjects: number
  completedUnits: number
  bookmarks: number
}

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState<StatsData>({ totalNotes: 0, totalSubjects: 0, completedUnits: 0, bookmarks: 0 })
  const [loading, setLoading] = useState(true)
  const [recentSubjects, setRecentSubjects] = useState<any[]>([])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchDashboardData()
    } else {
      setLoading(false)
      // Set demo data
      setStats({ totalNotes: 24, totalSubjects: 5, completedUnits: 3, bookmarks: 7 })
      setRecentSubjects([
        { id: '1', name: 'Engineering Chemistry', short_name: 'Chem', subject_code: 'BT101' },
        { id: '2', name: 'Mathematics-I', short_name: 'Math-I', subject_code: 'BT102' },
        { id: '3', name: 'BEEE', short_name: 'BEEE', subject_code: 'BT103' },
      ])
    }
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [notesRes, subjectsRes, progressRes, bookmarksRes] = await Promise.all([
      supabase.from('notes').select('id', { count: 'exact' }).eq('status', 'approved'),
      supabase.from('subjects').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('study_progress').select('*').eq('user_id', user.id),
      supabase.from('bookmarks').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

    setStats({
      totalNotes: notesRes.count ?? 0,
      totalSubjects: subjectsRes.count ?? 0,
      completedUnits: progressRes.data?.filter(p => p.status === 'completed').length ?? 0,
      bookmarks: bookmarksRes.count ?? 0,
    })

    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, short_name, subject_code')
      .eq('is_active', true)
      .limit(5)
    setRecentSubjects(subjects ?? [])
    setLoading(false)
  }

  const statCards = [
    { icon: FileText, label: 'Study Materials', value: stats.totalNotes, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', change: '+12 this week' },
    { icon: BookOpen, label: 'Subjects Available', value: stats.totalSubjects, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', change: 'All semesters' },
    { icon: TrendingUp, label: 'Units Completed', value: stats.completedUnits, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', change: 'Keep it up!' },
    { icon: Bookmark, label: 'Bookmarks', value: stats.bookmarks, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', change: 'View all' },
  ]

  const quickActions = [
    { icon: BookOpen, label: 'Browse Notes', desc: 'Find study materials', to: '/courses', color: 'gradient-brand' },
    { icon: Upload, label: 'Upload Notes', desc: 'Contribute & help others', to: '/upload', color: 'bg-purple-600' },
    { icon: Bookmark, label: 'My Bookmarks', desc: 'Saved materials', to: '/bookmarks', color: 'bg-amber-500' },
    { icon: TrendingUp, label: 'Study Progress', desc: 'Track your progress', to: '/progress', color: 'bg-green-600' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <p className="text-brand-300 font-medium">{greeting()},</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-display mb-2">
              {profile?.full_name ?? 'Student'}!
            </h1>
            <p className="text-navy-300 text-sm md:text-base max-w-lg">
              Access all your engineering study materials — notes, PYQs, and important questions organized by subject and unit.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link to="/courses" className="btn btn-gradient btn-sm">
                Browse Notes <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/search" className="btn btn-sm glass border-white/20 text-white hover:bg-white/10">
                Search Materials
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-center">
              <GraduationCap className="w-12 h-12 text-brand-300 mx-auto mb-2" />
              <p className="text-white text-xs font-medium">B.Tech</p>
              <p className="text-navy-400 text-xs">Semester 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase notice */}
      {!isSupabaseConfigured() && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Demo Mode — Supabase Not Connected</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
              You're seeing sample data. Configure Supabase in <code>.env.local</code> to enable live data, authentication, and file storage.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4 md:p-5 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
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
                <div className="text-xs font-medium text-navy-600 dark:text-navy-400 mt-0.5">{card.label}</div>
                <div className="text-xs text-navy-400 dark:text-navy-500 mt-1">{card.change}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-all group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-navy-900 dark:text-white text-sm">{action.label}</div>
                  <div className="text-xs text-navy-500 dark:text-navy-400">{action.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-navy-400 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-500" />
              Available Subjects
            </h2>
            <Link to="/courses" className="text-sm text-brand-600 font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="card p-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : recentSubjects.length === 0 ? (
              <div className="card p-8 text-center">
                <BookOpen className="w-10 h-10 text-navy-300 mx-auto mb-3" />
                <p className="text-navy-500">No subjects available yet</p>
              </div>
            ) : (
              recentSubjects.map((subject, i) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="card p-4 flex items-center gap-4 hover:shadow-md transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {subject.short_name?.slice(0, 2) ?? subject.name.slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy-900 dark:text-white text-sm line-clamp-1">
                      {subject.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-blue">{subject.subject_code}</span>
                      <span className="text-xs text-navy-400">B.Tech • Sem 1</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-navy-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                </Link>
              ))
            )}

            <Link
              to="/courses"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-navy-200 dark:border-navy-700 text-navy-400 hover:border-brand-400 hover:text-brand-500 transition-all text-sm font-medium"
            >
              <GraduationCap className="w-4 h-4" />
              Browse All Courses & Semesters
            </Link>
          </div>
        </div>
      </div>

      {/* Study Tips */}
      <div className="card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-500" />
          Study Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: '📖', tip: 'Start with unit-wise notes', desc: 'Study each unit systematically before moving to the next.' },
            { emoji: '❓', tip: 'Practice MIMP questions', desc: 'Important questions often appear in exams. Practice them regularly.' },
            { emoji: '📅', tip: 'Review PYQs regularly', desc: 'Solving previous year papers helps understand exam patterns.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-navy-50 dark:bg-navy-800/50">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <p className="font-semibold text-navy-900 dark:text-white text-sm">{item.tip}</p>
                <p className="text-xs text-navy-500 dark:text-navy-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
