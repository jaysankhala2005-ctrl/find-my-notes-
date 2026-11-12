import React, { useEffect, useState } from 'react'
import { TrendingUp, BookOpen, CheckCircle, Circle, MinusCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const statusConfig = {
  not_started: { label: 'Not Started', color: 'text-navy-400', bg: 'bg-navy-100 dark:bg-navy-700', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: MinusCircle },
  completed: { label: 'Completed', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
}

export const StudyProgressPage: React.FC = () => {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      fetchData()
    } else {
      // Demo data
      setSubjects([
        { id: '1', name: 'Engineering Chemistry', units: [{ id: 'u1', number: 1, name: 'Atomic Structure' }, { id: 'u2', number: 2, name: 'Thermodynamics' }, { id: 'u3', number: 3, name: 'Electrochemistry' }] },
        { id: '2', name: 'Mathematics-I', units: [{ id: 'u4', number: 1, name: 'Differential Calculus' }, { id: 'u5', number: 2, name: 'Integral Calculus' }] },
        { id: '3', name: 'BEEE', units: [{ id: 'u6', number: 1, name: 'DC Circuits' }, { id: 'u7', number: 2, name: 'AC Circuits' }] },
      ])
      setProgress({ u1: 'completed', u2: 'in_progress', u4: 'completed', u6: 'in_progress' })
      setLoading(false)
    }
  }, [user])

  const fetchData = async () => {
    if (!user) return
    const { data: progressData } = await supabase
      .from('study_progress')
      .select('unit_id, status')
      .eq('user_id', user.id)

    const progMap: Record<string, string> = {}
    progressData?.forEach((p: any) => { progMap[p.unit_id] = p.status })
    setProgress(progMap)

    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('id, name, units(id, number, name)')
      .eq('is_active', true)
      .order('name')

    setSubjects(subjectsData ?? [])
    setLoading(false)
  }

  const updateProgress = async (unitId: string, status: string) => {
    if (!user) return
    if (isSupabaseConfigured()) {
      await supabase.from('study_progress').upsert({ user_id: user.id, unit_id: unitId, status })
    }
    setProgress(prev => ({ ...prev, [unitId]: status }))
    toast.success(`Marked as ${status.replace('_', ' ')}`)
  }

  const getSubjectProgress = (subject: any) => {
    const units = subject.units ?? []
    if (units.length === 0) return 0
    const completed = units.filter((u: any) => progress[u.id] === 'completed').length
    return Math.round((completed / units.length) * 100)
  }

  const totalUnits = subjects.reduce((sum, s) => sum + (s.units?.length ?? 0), 0)
  const completedUnits = Object.values(progress).filter(s => s === 'completed').length
  const overallProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-500" />
          Study Progress
        </h1>
        <p className="text-navy-500 text-sm mt-1">Track your learning journey</p>
      </div>

      {/* Overall Stats */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-navy-900 dark:text-white">Overall Progress</h2>
            <p className="text-navy-500 text-sm">{completedUnits} of {totalUnits} units completed</p>
          </div>
          <div className="text-3xl font-bold text-gradient">{overallProgress}%</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {Object.entries(statusConfig).map(([key, conf]) => {
            const count = Object.values(progress).filter(s => s === key).length +
              (key === 'not_started' ? totalUnits - Object.keys(progress).length : 0)
            return (
              <div key={key} className={`p-4 rounded-xl ${conf.bg} text-center`}>
                <div className={`text-2xl font-bold ${conf.color}`}>{count}</div>
                <div className="text-xs text-navy-500 mt-1">{conf.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-Subject Progress */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject, si) => {
            const pct = getSubjectProgress(subject)
            return (
              <div key={subject.id} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${si * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-900 dark:text-white text-sm">{subject.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="progress-bar flex-1 max-w-48">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-navy-600 dark:text-navy-400">{pct}%</span>
                    </div>
                  </div>
                </div>

                {subject.units && subject.units.length > 0 && (
                  <div className="space-y-2">
                    {subject.units.map((unit: any) => {
                      const unitStatus = progress[unit.id] ?? 'not_started'
                      const conf = statusConfig[unitStatus as keyof typeof statusConfig]
                      const Icon = conf.icon
                      return (
                        <div key={unit.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${conf.color}`} />
                          <span className="text-sm text-navy-700 dark:text-navy-300 flex-1">
                            Unit {unit.number}: {unit.name}
                          </span>
                          <select
                            value={unitStatus}
                            onChange={(e) => updateProgress(unit.id, e.target.value)}
                            className="text-xs border border-navy-200 dark:border-navy-600 rounded-lg px-2 py-1 bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-300 outline-none cursor-pointer"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
