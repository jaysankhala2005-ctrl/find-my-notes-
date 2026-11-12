import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ChevronRight, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'
import { clsx } from 'clsx'

const DEMO_SEMESTERS = Array.from({ length: 8 }, (_, i) => ({
  id: `sem-${i + 1}`,
  number: i + 1,
  name: `Semester ${i + 1}`,
  is_active: true,
  subjectCount: i === 0 ? 5 : Math.floor(Math.random() * 4) + 4,
  isLocked: i > 0,
}))

export const SemestersPage: React.FC = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [semesters, setSemesters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured() && courseId) {
      fetchData()
    } else {
      setCourse({ name: 'Bachelor of Technology', short_name: 'B.Tech' })
      setSemesters(DEMO_SEMESTERS)
      setLoading(false)
    }
  }, [courseId])

  const fetchData = async () => {
    const [courseRes, semestersRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('semesters').select('*').eq('course_id', courseId).eq('is_active', true).order('number'),
    ])
    setCourse(courseRes.data)
    setSemesters(semestersRes.data?.map(s => ({ ...s, isLocked: false, subjectCount: 5 })) ?? DEMO_SEMESTERS)
    setLoading(false)
  }

  const semesterColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-orange-500 to-orange-600',
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/courses" className="hover:text-brand-600 transition-colors">Courses</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-700 dark:text-navy-300 font-medium">
          {course?.short_name ?? 'B.Tech'}
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-500" />
          Select Semester
        </h1>
        <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
          {course?.name ?? 'Bachelor of Technology'} — Choose a semester to browse subjects
        </p>
      </div>

      {/* Semester Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semesters.map((sem, i) => (
            <div key={sem.id} className={clsx('animate-fade-in-up')} style={{ animationDelay: `${i * 0.06}s` }}>
              {sem.isLocked ? (
                <div className="card p-5 text-center opacity-50 cursor-not-allowed">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${semesterColors[i % 8]} flex items-center justify-center mx-auto mb-3 opacity-50`}>
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-bold text-navy-900 dark:text-white">Semester {sem.number}</div>
                  <div className="text-xs text-navy-400 mt-1">Coming Soon</div>
                </div>
              ) : (
                <Link
                  to={`/course/${courseId}/semester/${sem.id}/subjects`}
                  className="card p-5 text-center group card-hover-effect block"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${semesterColors[i % 8]} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-bold text-lg">{sem.number}</span>
                  </div>
                  <div className="font-bold text-navy-900 dark:text-white text-sm">{sem.name}</div>
                  <div className="text-xs text-navy-500 dark:text-navy-400 mt-1">{sem.subjectCount} Subjects</div>
                  {i === 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Available</span>
                    </div>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="card p-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-400">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Active — Notes available
        </div>
        <div className="flex items-center gap-2 text-sm text-navy-400">
          <Lock className="w-4 h-4" />
          Coming Soon — Materials being added
        </div>
      </div>
    </div>
  )
}
