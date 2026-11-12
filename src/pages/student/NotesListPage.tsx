import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronRight, FileText, Download, Eye, Bookmark,
  BookmarkCheck, ChevronDown, ChevronUp, HelpCircle,
  BookOpen, PenLine, Building2, Library,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/ui/Skeleton'
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

type ActiveTab = 'notes' | 'mimp' | 'pyq'

const categoryLabels: Record<string, { label: string; icon: React.FC<any>; color: string }> = {
  handwritten: { label: 'Handwritten Notes', icon: PenLine, color: 'text-blue-500' },
  university: { label: 'University Notes', icon: Building2, color: 'text-purple-500' },
  shivani: { label: 'Shivani Notes', icon: Library, color: 'text-emerald-500' },
}

const DEMO_UNITS = [
  { id: '41111111-1111-1111-1111-111111111111', number: 1, name: 'DC Circuits and Network Theorems' },
  { id: '41111111-1111-1111-1111-111111111112', number: 2, name: 'AC Circuits and Resonance' },
  { id: '41111111-1111-1111-1111-111111111113', number: 3, name: 'Transformers and Electrical Machines' },
  { id: '41111111-1111-1111-1111-111111111114', number: 4, name: 'Semiconductor Devices and Circuits' },
  { id: '41111111-1111-1111-1111-111111111115', number: 5, name: 'Digital Electronics and Microprocessors' },
]

const DEMO_QUESTIONS = [
  { id: 'q1', question_text: 'Define Kirchhoff\'s Current Law and Voltage Law. Explain with examples.', question_type: 'important', marks: 10 },
  { id: 'q2', question_text: 'What is Thevenin\'s theorem? State and prove it.', question_type: 'important', marks: 10 },
  { id: 'q3', question_text: 'Explain the concept of resonance in RLC circuits.', question_type: 'long', marks: 7 },
  { id: 'q4', question_text: 'What is power factor? How can it be improved?', question_type: 'short', marks: 5 },
]

export const NotesListPage: React.FC = () => {
  const { subjectId, category } = useParams<{ subjectId: string; category: string }>()
  const { user } = useAuthStore()
  const [units, setUnits] = useState<any[]>([])
  const [notes, setNotes] = useState<Record<string, any[]>>({})
  const [questions, setQuestions] = useState<Record<string, any[]>>({})
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('notes')
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)
  const [subjectName, setSubjectName] = useState('')
  const [progress, setProgress] = useState<Record<string, string>>({})

  const catConfig = categoryLabels[category ?? 'handwritten'] ?? categoryLabels['handwritten']

  useEffect(() => {
    if (isSupabaseConfigured() && subjectId) {
      fetchData()
    } else {
      setUnits(DEMO_UNITS)
      setExpandedUnit(DEMO_UNITS[0].id)
      setSubjectName('Basic Electrical and Electronics Engineering')
      // Demo questions per unit
      const demoQ: Record<string, any[]> = {}
      DEMO_UNITS.forEach(u => { demoQ[u.id] = DEMO_QUESTIONS })
      setQuestions(demoQ)
      setLoading(false)
    }
  }, [subjectId, category])

  const fetchData = async () => {
    const [subjectRes, unitsRes] = await Promise.all([
      supabase.from('subjects').select('name').eq('id', subjectId).single(),
      supabase.from('units').select('*').eq('subject_id', subjectId).eq('is_active', true).order('number'),
    ])

    if (subjectRes.data) setSubjectName(subjectRes.data.name)
    const unitList = unitsRes.data ?? []
    setUnits(unitList)
    if (unitList.length > 0) setExpandedUnit(unitList[0].id)

    // Fetch notes and questions for all units
    for (const unit of unitList) {
      const [notesRes, questionsRes] = await Promise.all([
        supabase.from('notes').select('*').eq('unit_id', unit.id).eq('category', category).eq('status', 'approved'),
        supabase.from('questions').select('*').eq('unit_id', unit.id).eq('status', 'approved'),
      ])
      setNotes(prev => ({ ...prev, [unit.id]: notesRes.data ?? [] }))
      setQuestions(prev => ({ ...prev, [unit.id]: questionsRes.data ?? [] }))
    }

    // Fetch bookmarks
    if (user) {
      const { data: bms } = await supabase.from('bookmarks').select('item_id').eq('user_id', user.id).eq('item_type', 'note')
      setBookmarks(new Set(bms?.map((b: any) => b.item_id) ?? []))
    }

    // Fetch progress
    if (user) {
      const { data: prog } = await supabase.from('study_progress').select('unit_id, status').eq('user_id', user.id)
      const progMap: Record<string, string> = {}
      prog?.forEach((p: any) => { progMap[p.unit_id] = p.status })
      setProgress(progMap)
    }

    setLoading(false)
  }

  const toggleBookmark = async (noteId: string) => {
    if (!user) { toast.error('Please login to bookmark'); return }
    if (!isSupabaseConfigured()) { toast.error('Supabase not configured'); return }

    if (bookmarks.has(noteId)) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('item_id', noteId)
      setBookmarks(prev => { const s = new Set(prev); s.delete(noteId); return s })
      toast.success('Bookmark removed')
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, item_id: noteId, item_type: 'note' })
      setBookmarks(prev => new Set([...prev, noteId]))
      toast.success('Bookmarked!')
    }
  }

  const updateProgress = async (unitId: string, status: string) => {
    if (!user || !isSupabaseConfigured()) return
    await supabase.from('study_progress').upsert({ user_id: user.id, unit_id: unitId, status })
    setProgress(prev => ({ ...prev, [unitId]: status }))
    toast.success(`Unit marked as ${status.replace('_', ' ')}`)
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const tabs: { key: ActiveTab; label: string; icon: React.FC<any> }[] = [
    { key: 'notes', label: 'Study Notes', icon: FileText },
    { key: 'mimp', label: 'Important Questions', icon: HelpCircle },
    { key: 'pyq', label: 'PYQ Links', icon: BookOpen },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/courses" className="hover:text-brand-600">Courses</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/subject/${subjectId}`} className="hover:text-brand-600">
          {subjectName || 'Subject'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-700 dark:text-navy-300 font-medium">{catConfig.label}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center">
          <catConfig.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy-900 dark:text-white font-display">{catConfig.label}</h1>
          <p className="text-navy-500 text-sm">{subjectName}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-navy-100 dark:bg-navy-800 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                : 'text-navy-500 hover:text-navy-700 dark:hover:text-navy-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Units with accordion */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : units.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-600 dark:text-navy-400 font-medium">No units found for this subject</p>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit, i) => {
            const isExpanded = expandedUnit === unit.id
            const unitNotes = notes[unit.id] ?? []
            const unitQuestions = questions[unit.id] ?? []

            return (
              <div key={unit.id} className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
                {/* Unit Header */}
                <button
                  onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{unit.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 dark:text-white text-sm">Unit {unit.number}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400 line-clamp-1">{unit.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={progress[unit.id] ?? 'not_started'}
                        onChange={(e) => updateProgress(unit.id, e.target.value)}
                        className="text-xs border border-navy-200 dark:border-navy-600 rounded-lg px-2 py-1 bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-300 outline-none cursor-pointer"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-gray text-xs">{activeTab === 'notes' ? unitNotes.length : unitQuestions.length} items</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-navy-400" /> : <ChevronDown className="w-4 h-4 text-navy-400" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-navy-100 dark:border-navy-700 p-4">
                    {activeTab === 'notes' && (
                      <>
                        {unitNotes.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                            <p className="text-navy-500 text-sm">No notes available for this unit yet</p>
                            <p className="text-navy-400 text-xs mt-1">Check back later or contribute your notes</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {unitNotes.map((note: any) => (
                              <div key={note.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-50 dark:bg-navy-800/60 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-4 h-4 text-brand-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-navy-900 dark:text-white text-sm line-clamp-1">{note.title}</p>
                                  {note.file_size && (
                                    <p className="text-xs text-navy-400">{formatFileSize(note.file_size)} · PDF</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleBookmark(note.id)}
                                    className={clsx('btn btn-icon btn-sm', bookmarks.has(note.id) ? 'text-amber-500' : 'text-navy-400')}
                                    title="Bookmark"
                                  >
                                    {bookmarks.has(note.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                  </button>
                                  {note.file_url && (
                                    <>
                                      <button
                                        onClick={() => setPdfViewer({ url: note.file_url, title: note.title })}
                                        className="btn btn-sm btn-secondary"
                                        title="View PDF"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> View
                                      </button>
                                      <a
                                        href={note.file_url}
                                        download
                                        className="btn btn-sm btn-primary"
                                        title="Download"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'mimp' && (
                      <>
                        {unitQuestions.length === 0 ? (
                          <div className="text-center py-8">
                            <HelpCircle className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                            <p className="text-navy-500 text-sm">No important questions added yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {unitQuestions.map((q: any, qi: number) => (
                              <div key={q.id} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30">
                                <div className="flex items-start gap-3">
                                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {qi + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-navy-900 dark:text-white text-sm font-medium">{q.question_text}</p>
                                    {q.marks && (
                                      <span className="badge badge-yellow mt-2">{q.marks} Marks</span>
                                    )}
                                    {q.answer_text && (
                                      <details className="mt-2">
                                        <summary className="text-xs text-brand-600 cursor-pointer font-medium">View Answer</summary>
                                        <p className="text-xs text-navy-600 dark:text-navy-400 mt-2 p-3 bg-white dark:bg-navy-800 rounded-lg">
                                          {q.answer_text}
                                        </p>
                                      </details>
                                    )}
                                  </div>
                                  <span className="badge badge-gray text-xs capitalize">{q.question_type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'pyq' && (
                      <div className="text-center py-8">
                        <BookOpen className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                        <p className="text-navy-500 text-sm font-medium">View PYQs for this subject</p>
                        <p className="text-navy-400 text-xs mt-1">Previous year question papers are organized by year</p>
                        <Link
                          to={`/subject/${subjectId}/pyq`}
                          className="btn btn-primary btn-sm mt-4 inline-flex"
                        >
                          Go to PYQ Section
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfViewer && (
        <PDFViewerModal
          url={pdfViewer.url}
          title={pdfViewer.title}
          onClose={() => setPdfViewer(null)}
        />
      )}
    </div>
  )
}
