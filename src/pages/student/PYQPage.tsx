import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Layers, Download, Eye, Filter, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal'
import { clsx } from 'clsx'

const DEMO_PAPERS = [
  { id: 'p1', title: 'BEEE Annual Exam 2024', exam_year: 2024, exam_type: 'annual', file_url: null, download_count: 156 },
  { id: 'p2', title: 'BEEE Annual Exam 2023', exam_year: 2023, exam_type: 'annual', file_url: null, download_count: 312 },
  { id: 'p3', title: 'BEEE Annual Exam 2022', exam_year: 2022, exam_type: 'annual', file_url: null, download_count: 289 },
  { id: 'p4', title: 'BEEE Supplementary 2023', exam_year: 2023, exam_type: 'supplementary', file_url: null, download_count: 89 },
  { id: 'p5', title: 'BEEE Mid-Term 2024', exam_year: 2024, exam_type: 'mid_term', file_url: null, download_count: 201 },
]

const examTypeColors: Record<string, string> = {
  annual: 'badge-blue',
  supplementary: 'badge-yellow',
  mid_term: 'badge-purple',
  unit_test: 'badge-gray',
}

export const PYQPage: React.FC = () => {
  const { subjectId } = useParams()
  const [papers, setPapers] = useState<any[]>([])
  const [filteredPapers, setFilteredPapers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)
  const [subjectName, setSubjectName] = useState('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  useEffect(() => {
    if (isSupabaseConfigured() && subjectId) {
      fetchPapers()
    } else {
      setPapers(DEMO_PAPERS)
      setFilteredPapers(DEMO_PAPERS)
      setSubjectName('Basic Electrical and Electronics Engineering')
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    let filtered = papers
    if (yearFilter !== 'all') filtered = filtered.filter(p => p.exam_year === parseInt(yearFilter))
    if (typeFilter !== 'all') filtered = filtered.filter(p => p.exam_type === typeFilter)
    setFilteredPapers(filtered)
  }, [yearFilter, typeFilter, papers])

  const fetchPapers = async () => {
    const [subjectRes, papersRes] = await Promise.all([
      supabase.from('subjects').select('name').eq('id', subjectId).single(),
      supabase.from('question_papers').select('*').eq('subject_id', subjectId).eq('status', 'approved').eq('is_active', true).order('exam_year', { ascending: false }),
    ])
    if (subjectRes.data) setSubjectName(subjectRes.data.name)
    setPapers(papersRes.data ?? DEMO_PAPERS)
    setFilteredPapers(papersRes.data ?? DEMO_PAPERS)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500 flex-wrap">
        <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/subject/${subjectId}`} className="hover:text-brand-600">{subjectName || 'Subject'}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-700 dark:text-navy-300 font-medium">Previous Year Questions</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy-900 dark:text-white font-display">
            Previous Year Questions
          </h1>
          <p className="text-navy-500 text-sm">{subjectName}</p>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setYearFilter('all')}
          className={clsx('btn btn-sm flex-shrink-0', yearFilter === 'all' ? 'btn-primary' : 'btn-secondary')}
        >
          All Years
        </button>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setYearFilter(String(year))}
            className={clsx('btn btn-sm flex-shrink-0', yearFilter === String(year) ? 'btn-primary' : 'btn-secondary')}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-navy-500">
          <Filter className="w-4 h-4" />
          Type:
        </div>
        {['all', 'annual', 'supplementary', 'mid_term', 'unit_test'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-full border transition-all font-medium capitalize',
              typeFilter === type
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-navy-800 text-navy-600 dark:text-navy-400 border-navy-200 dark:border-navy-600 hover:border-brand-400'
            )}
          >
            {type === 'all' ? 'All Types' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Papers List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="card p-12 text-center">
          <Layers className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-600 dark:text-navy-400 font-medium">No question papers found</p>
          <p className="text-navy-400 text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-navy-500">{filteredPapers.length} paper(s) found</p>
          {filteredPapers.map((paper, i) => (
            <div
              key={paper.id}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{paper.exam_year}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 dark:text-white text-sm">{paper.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${examTypeColors[paper.exam_type] ?? 'badge-gray'} capitalize`}>
                    {paper.exam_type.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-navy-400">
                    <Calendar className="w-3 h-3" /> {paper.exam_year}
                  </span>
                  {paper.download_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-navy-400">
                      <Download className="w-3 h-3" /> {paper.download_count}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {paper.file_url ? (
                  <>
                    <button
                      onClick={() => setPdfViewer({ url: paper.file_url, title: paper.title })}
                      className="btn btn-sm btn-secondary"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <a href={paper.file_url} download className="btn btn-sm btn-primary">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-navy-400 italic">PDF not uploaded yet</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pdfViewer && (
        <PDFViewerModal url={pdfViewer.url} title={pdfViewer.title} onClose={() => setPdfViewer(null)} />
      )}
    </div>
  )
}
