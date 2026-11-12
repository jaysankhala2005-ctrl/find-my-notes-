import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, BookOpen, FileText, Layers, Filter, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'
import { clsx } from 'clsx'

type ResultType = 'subject' | 'note' | 'question_paper'
interface SearchResult {
  id: string
  type: ResultType
  title: string
  subtitle: string
  link: string
  badge?: string
}

const DEMO_RESULTS: SearchResult[] = [
  { id: '1', type: 'subject', title: 'Engineering Chemistry', subtitle: 'B.Tech · Semester 1 · BT101', link: '/subject/31111111-1111-1111-1111-111111111111', badge: 'Subject' },
  { id: '2', type: 'subject', title: 'Mathematics-I', subtitle: 'B.Tech · Semester 1 · BT102', link: '/subject/31111111-1111-1111-1111-111111111112', badge: 'Subject' },
  { id: '3', type: 'subject', title: 'Basic Electrical and Electronics Engineering', subtitle: 'B.Tech · Semester 1 · BT103', link: '/subject/31111111-1111-1111-1111-111111111113', badge: 'Subject' },
]

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      handleSearch(q)
    }
  }, [searchParams])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setSearched(true)

    if (!isSupabaseConfigured()) {
      // Demo search
      const filtered = DEMO_RESULTS.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered.length > 0 ? filtered : DEMO_RESULTS)
      setLoading(false)
      return
    }

    const searchResults: SearchResult[] = []

    // Search subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, subject_code, semester_id')
      .ilike('name', `%${searchQuery}%`)
      .eq('is_active', true)
      .limit(5)

    subjects?.forEach((s: any) => {
      searchResults.push({
        id: s.id, type: 'subject',
        title: s.name, subtitle: `B.Tech · ${s.subject_code}`,
        link: `/subject/${s.id}`, badge: 'Subject',
      })
    })

    // Search notes
    const { data: notesData } = await supabase
      .from('notes')
      .select('id, title, category, unit_id')
      .ilike('title', `%${searchQuery}%`)
      .eq('status', 'approved')
      .limit(8)

    notesData?.forEach((n: any) => {
      searchResults.push({
        id: n.id, type: 'note',
        title: n.title,
        subtitle: `${n.category.charAt(0).toUpperCase() + n.category.slice(1)} Notes`,
        link: `/notes/${n.id}`, badge: 'Note',
      })
    })

    setResults(searchResults)
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
      handleSearch(query.trim())
    }
  }

  const filtered = typeFilter === 'all' ? results : results.filter(r => r.type === typeFilter)

  const typeIcons: Record<ResultType, React.FC<any>> = {
    subject: BookOpen, note: FileText, question_paper: Layers,
  }
  const typeBadges: Record<ResultType, string> = {
    subject: 'badge-blue', note: 'badge-green', question_paper: 'badge-purple',
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
          <Search className="w-6 h-6 text-brand-500" />
          Search Materials
        </h1>
        <p className="text-navy-500 text-sm mt-1">Find notes, subjects, and question papers</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
          <input
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, notes, topic, code..."
            className="input pl-11 h-12 text-base"
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-gradient px-6 h-12">
          Search
        </button>
      </form>

      {/* Filters */}
      {searched && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-navy-500 flex items-center gap-1">
            <Filter className="w-4 h-4" /> Filter:
          </span>
          {['all', 'subject', 'note', 'question_paper'].map(type => (
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
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : searched ? (
        filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Search className="w-12 h-12 text-navy-300 mx-auto mb-3" />
            <p className="text-navy-600 dark:text-navy-400 font-medium">No results found for "{searchParams.get('q')}"</p>
            <p className="text-navy-400 text-sm mt-1">Try different keywords or browse by course</p>
            <Link to="/courses" className="btn btn-primary btn-sm mt-4 inline-flex">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-navy-500 font-medium">{filtered.length} result(s) for "{searchParams.get('q')}"</p>
            {filtered.map((result, i) => {
              const Icon = typeIcons[result.type]
              return (
                <Link
                  key={result.id}
                  to={result.link}
                  className="card p-4 flex items-center gap-4 hover:shadow-md transition-all group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 dark:text-white text-sm">{result.title}</p>
                    <p className="text-xs text-navy-500 mt-0.5">{result.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${typeBadges[result.type]}`}>{result.badge}</span>
                    <ChevronRight className="w-4 h-4 text-navy-400 group-hover:text-brand-500" />
                  </div>
                </Link>
              )
            })}
          </div>
        )
      ) : (
        <div className="card p-8 text-center">
          <Search className="w-10 h-10 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-500">Enter a search term to find study materials</p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {['BEEE', 'Mathematics', 'Chemistry', 'Engineering Drawing', 'PYQ'].map(t => (
              <button
                key={t}
                onClick={() => { setQuery(t); setSearchParams({ q: t }); handleSearch(t) }}
                className="text-xs px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700 hover:bg-brand-100 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
