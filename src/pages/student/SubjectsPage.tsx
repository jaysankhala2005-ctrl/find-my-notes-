import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen, ChevronRight, Search, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'

const DEMO_SUBJECTS = [
  { id: '31111111-1111-1111-1111-111111111111', name: 'Engineering Chemistry', short_name: 'Chem', subject_code: 'BT101', credits: 4, description: 'Study of chemical principles, atomic structure, and industrial applications.', unitCount: 5 },
  { id: '31111111-1111-1111-1111-111111111112', name: 'Mathematics-I', short_name: 'Math-I', subject_code: 'BT102', credits: 4, description: 'Differential calculus, integral calculus, matrices, and differential equations.', unitCount: 5 },
  { id: '31111111-1111-1111-1111-111111111113', name: 'Basic Electrical and Electronics Engineering', short_name: 'BEEE', subject_code: 'BT103', credits: 4, description: 'DC/AC circuits, transformers, semiconductor devices and digital electronics.', unitCount: 5 },
  { id: '31111111-1111-1111-1111-111111111114', name: 'English for Communication', short_name: 'English', subject_code: 'BT104', credits: 2, description: 'Reading, writing, speaking and technical communication skills.', unitCount: 4 },
  { id: '31111111-1111-1111-1111-111111111115', name: 'Engineering Drawing', short_name: 'ED', subject_code: 'BT105', credits: 4, description: 'Projections, isometric views, sectional views and technical drawing skills.', unitCount: 5 },
]

const subjectIcons = ['🧪', '📐', '⚡', '📖', '✏️']
const subjectColors = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-emerald-600',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-purple-600',
  'from-rose-400 to-rose-600',
]

export const SubjectsPage: React.FC = () => {
  const { courseId, semesterId } = useParams()
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [semesterName, setSemesterName] = useState('Semester 1')

  useEffect(() => {
    if (isSupabaseConfigured() && semesterId) {
      fetchSubjects()
    } else {
      setSubjects(DEMO_SUBJECTS)
      setLoading(false)
    }
  }, [semesterId])

  const fetchSubjects = async () => {
    const [semRes, subjectsRes] = await Promise.all([
      supabase.from('semesters').select('name').eq('id', semesterId).single(),
      supabase.from('subjects').select('*').eq('semester_id', semesterId).eq('is_active', true).order('name'),
    ])
    if (semRes.data) setSemesterName(semRes.data.name)
    setSubjects(subjectsRes.data ?? DEMO_SUBJECTS)
    setLoading(false)
  }

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject_code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/courses" className="hover:text-brand-600 transition-colors">Courses</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/course/${courseId}/semesters`} className="hover:text-brand-600 transition-colors">B.Tech</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-700 dark:text-navy-300 font-medium">{semesterName}</span>
      </nav>

      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-500" />
            {semesterName} Subjects
          </h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
            {filtered.length} subjects available
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {/* Subject Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-600 dark:text-navy-400 font-medium">No subjects found</p>
          <p className="text-navy-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((subject, i) => (
            <Link
              key={subject.id}
              to={`/subject/${subject.id}`}
              className="card p-6 flex flex-col gap-3 group card-hover-effect animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subjectColors[i % subjectColors.length]} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {subjectIcons[i % subjectIcons.length]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-blue">{subject.subject_code}</span>
                    <span className="text-xs text-navy-400">{subject.credits} Credits</span>
                  </div>
                  <h3 className="font-bold text-navy-900 dark:text-white text-sm mt-1 leading-snug line-clamp-2">
                    {subject.name}
                  </h3>
                </div>
              </div>

              {subject.description && (
                <p className="text-xs text-navy-500 dark:text-navy-400 line-clamp-2">
                  {subject.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-navy-100 dark:border-navy-700">
                <div className="flex items-center gap-1 text-xs text-navy-500">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {subject.unitCount ?? 5} Units
                </div>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:underline flex items-center gap-1">
                  Open <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
