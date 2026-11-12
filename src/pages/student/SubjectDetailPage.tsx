import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PenLine, BookOpen, ChevronRight, Building2, Library, Layers } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'

type NotesCategory = 'handwritten' | 'university' | 'shivani'

const categoryConfig = {
  handwritten: {
    label: 'Handwritten Notes',
    icon: PenLine,
    emoji: '✍️',
    description: 'Faculty & student handwritten notes and PDFs',
    color: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    badge: 'badge-blue',
    features: ['Faculty handwritten notes', 'Faculty-provided PDFs', 'Student notes', 'Student contributions'],
  },
  university: {
    label: 'University Official Notes',
    icon: Building2,
    emoji: '🏛️',
    description: 'Official university study materials and resources',
    color: 'from-purple-500 to-purple-700',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-700',
    badge: 'badge-purple',
    features: ['University study materials', 'Official academic resources', 'University-provided PDFs', 'Subject-wise materials'],
  },
  shivani: {
    label: 'Shivani Publication Notes',
    icon: Library,
    emoji: '📚',
    description: 'Shivani publication study materials and unit PDFs',
    color: 'from-emerald-500 to-emerald-700',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    badge: 'badge-green',
    features: ['Shivani publication notes', 'Subject-wise notes', 'Unit-wise PDFs', 'Comprehensive coverage'],
  },
}

export const SubjectDetailPage: React.FC = () => {
  const { subjectId } = useParams()
  const [subject, setSubject] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notesCounts, setNotesCounts] = useState<Record<NotesCategory, number>>({
    handwritten: 0, university: 0, shivani: 0,
  })

  useEffect(() => {
    if (isSupabaseConfigured() && subjectId) {
      fetchData()
    } else {
      setDemoData()
    }
  }, [subjectId])

  const setDemoData = () => {
    const demoSubjects: Record<string, any> = {
      '31111111-1111-1111-1111-111111111113': {
        name: 'Basic Electrical and Electronics Engineering', short_name: 'BEEE', subject_code: 'BT103', credits: 4,
      },
      '31111111-1111-1111-1111-111111111111': {
        name: 'Engineering Chemistry', short_name: 'Chem', subject_code: 'BT101', credits: 4,
      },
    }
    setSubject(demoSubjects[subjectId ?? ''] ?? {
      name: 'Engineering Subject', short_name: 'SUB', subject_code: 'BT101', credits: 4,
    })
    setNotesCounts({ handwritten: 8, university: 3, shivani: 5 })
    setLoading(false)
  }

  const fetchData = async () => {
    const [subjectRes, unitsRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('id', subjectId).single(),
      supabase.from('units').select('*').eq('subject_id', subjectId).eq('is_active', true).order('number'),
    ])
    setSubject(subjectRes.data)
    setUnits(unitsRes.data ?? [])

    // Fetch notes counts per category
    for (const cat of ['handwritten', 'university', 'shivani'] as NotesCategory[]) {
      const unitIds = unitsRes.data?.map((u: any) => u.id) ?? []
      if (unitIds.length > 0) {
        const { count } = await supabase
          .from('notes')
          .select('id', { count: 'exact' })
          .in('unit_id', unitIds)
          .eq('category', cat)
          .eq('status', 'approved')
        setNotesCounts(prev => ({ ...prev, [cat]: count ?? 0 }))
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/courses" className="hover:text-brand-600">Courses</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-700 dark:text-navy-300 font-medium">{subject?.name}</span>
      </nav>

      {/* Subject Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="badge badge-blue">{subject?.subject_code}</span>
              <span className="text-sm text-navy-400">{subject?.credits} Credits</span>
            </div>
            <h1 className="text-xl font-bold text-navy-900 dark:text-white font-display">{subject?.name}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
              Select a notes category to access study materials
            </p>
          </div>
        </div>

        {/* PYQ quick link */}
        <div className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-700 flex items-center gap-3 flex-wrap">
          <Link
            to={`/subject/${subjectId}/pyq`}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Previous Year Questions (PYQs)
          </Link>
          <span className="text-xs text-navy-400">View year-wise question papers</span>
        </div>
      </div>

      {/* Three Notes Categories */}
      <div>
        <h2 className="section-title mb-4">Select Notes Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(categoryConfig) as [NotesCategory, typeof categoryConfig['handwritten']][]).map(([key, config], i) => (
            <Link
              key={key}
              to={`/subject/${subjectId}/notes/${key}`}
              className="card p-6 flex flex-col gap-4 group card-hover-effect animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl`}>
                {config.emoji}
              </div>

              <div>
                <h3 className="font-bold text-navy-900 dark:text-white font-display">{config.label}</h3>
                <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">{config.description}</p>
              </div>

              <ul className="space-y-1">
                {config.features.map((f, fi) => (
                  <li key={fi} className="text-xs text-navy-600 dark:text-navy-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-navy-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-2 border-t border-navy-100 dark:border-navy-700 mt-auto">
                <span className={`badge ${config.badge}`}>
                  {notesCounts[key]} Notes
                </span>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:underline flex items-center gap-1">
                  Browse <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Units Preview */}
      {units.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Units Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {units.map((unit, i) => (
              <Link
                key={unit.id}
                to={`/subject/${subjectId}/notes/handwritten?unit=${unit.id}`}
                className="card p-4 flex items-center gap-3 group hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{unit.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white line-clamp-1">Unit {unit.number}</p>
                  <p className="text-xs text-navy-500 dark:text-navy-400 line-clamp-1">{unit.name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-navy-400 group-hover:text-brand-500 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
