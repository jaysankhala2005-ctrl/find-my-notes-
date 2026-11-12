import React, { useEffect, useState } from 'react'
import { BookmarkX, Bookmark, FileText, Download, Eye, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/ui/Skeleton'
import { PDFViewerModal } from '../../components/pdf/PDFViewerModal'
import toast from 'react-hot-toast'

export const BookmarksPage: React.FC = () => {
  const { user } = useAuthStore()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      fetchBookmarks()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchBookmarks = async () => {
    if (!user) return
    const { data } = await supabase
      .from('bookmarks')
      .select('id, item_type, item_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const enriched = await Promise.all(
      data.map(async (bm) => {
        if (bm.item_type === 'note') {
          const { data: note } = await supabase.from('notes').select('id, title, file_url, file_size, category').eq('id', bm.item_id).single()
          return { ...bm, details: note }
        }
        if (bm.item_type === 'question_paper') {
          const { data: paper } = await supabase.from('question_papers').select('id, title, file_url, exam_year').eq('id', bm.item_id).single()
          return { ...bm, details: paper }
        }
        return { ...bm, details: null }
      })
    )

    setBookmarks(enriched.filter(b => b.details))
    setLoading(false)
  }

  const removeBookmark = async (bookmarkId: string) => {
    if (!isSupabaseConfigured()) return
    await supabase.from('bookmarks').delete().eq('id', bookmarkId)
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
    toast.success('Bookmark removed')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500" />
          My Bookmarks
        </h1>
        <p className="text-navy-500 text-sm mt-1">Your saved study materials</p>
      </div>

      {!isSupabaseConfigured() ? (
        <div className="card p-12 text-center">
          <Bookmark className="w-10 h-10 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-600 dark:text-navy-400 font-medium">Bookmarks require Supabase setup</p>
          <p className="text-navy-400 text-sm mt-1">Configure Supabase to save and sync your bookmarks across devices</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card p-12 text-center">
          <BookmarkX className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <p className="text-navy-600 dark:text-navy-400 font-medium">No bookmarks yet</p>
          <p className="text-navy-400 text-sm mt-1">Browse notes and bookmark them for quick access</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-navy-500">{bookmarks.length} bookmark(s)</p>
          {bookmarks.map((bm, i) => (
            <div
              key={bm.id}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                {bm.item_type === 'note' ? (
                  <FileText className="w-5 h-5 text-amber-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 dark:text-white text-sm line-clamp-1">
                  {bm.details?.title}
                </p>
                <span className="badge badge-yellow capitalize mt-1">{bm.item_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                {bm.details?.file_url && (
                  <>
                    <button
                      onClick={() => setPdfViewer({ url: bm.details.file_url, title: bm.details.title })}
                      className="btn btn-sm btn-secondary"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a href={bm.details.file_url} download className="btn btn-sm btn-primary">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}
                <button
                  onClick={() => removeBookmark(bm.id)}
                  className="btn btn-sm btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove bookmark"
                >
                  <BookmarkX className="w-4 h-4" />
                </button>
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
