import React, { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export const UploadPage: React.FC = () => {
  const { user } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'handwritten' as 'handwritten' | 'university' | 'shivani',
    submission_type: 'note' as 'note' | 'question' | 'question_paper',
    question_text: '',
    exam_year: String(new Date().getFullYear()),
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 20MB')
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!file || !user) return null
    const ext = 'pdf'
    const path = `uploads/${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('notes').upload(path, file)
    if (error) { toast.error('File upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('notes').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Please enter a title')
    if (!isSupabaseConfigured()) {
      toast.error('Supabase not configured. Please set up your credentials.')
      return
    }
    if (!user) return toast.error('Please login first')

    setLoading(true)
    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null

    if (file) {
      fileUrl = await uploadFile()
      fileName = file.name
      fileSize = file.size
      if (!fileUrl) { setLoading(false); return }
    }

    const { error } = await supabase.from('upload_submissions').insert({
      submitted_by: user.id,
      submission_type: form.submission_type,
      category: form.submission_type === 'note' ? form.category : null,
      title: form.title,
      description: form.description || null,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      status: 'pending',
    })

    setLoading(false)
    if (error) { toast.error(error.message); return }

    setSuccess(true)
    setForm({ title: '', description: '', category: 'handwritten', submission_type: 'note', question_text: '', exam_year: String(new Date().getFullYear()) })
    setFile(null)
  }

  const formatBytes = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
          <Upload className="w-6 h-6 text-brand-500" />
          Upload Study Material
        </h1>
        <p className="text-navy-500 text-sm mt-1">
          Contribute notes, questions, and PYQs. All uploads go through admin review before being published.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">Upload Submitted!</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Your material is under admin review. You'll be notified once approved.
            </p>
          </div>
          <button onClick={() => setSuccess(false)} className="ml-auto btn btn-icon btn-ghost text-green-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isSupabaseConfigured() && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Supabase is not configured. File uploads require a connected Supabase project with Storage enabled.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Submission Type */}
        <div>
          <label className="label">Submission Type</label>
          <div className="grid grid-cols-3 gap-3">
            {(['note', 'question', 'question_paper'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(p => ({ ...p, submission_type: type }))}
                className={clsx(
                  'p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all text-center',
                  form.submission_type === type
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                    : 'border-navy-200 dark:border-navy-700 text-navy-500 hover:border-navy-300'
                )}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Category (for notes) */}
        {form.submission_type === 'note' && (
          <div>
            <label className="label">Notes Category</label>
            <div className="grid grid-cols-3 gap-3">
              {(['handwritten', 'university', 'shivani'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat }))}
                  className={clsx(
                    'p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all text-center',
                    form.category === cat
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'border-navy-200 dark:border-navy-700 text-navy-500 hover:border-navy-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder={form.submission_type === 'note' ? 'e.g., Unit 1 - DC Circuits Notes' : form.submission_type === 'question' ? 'e.g., KCL & KVL important question' : 'e.g., BEEE Annual Exam 2024'}
            className="input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description (Optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Add any additional details..."
            className="input h-24 resize-none"
          />
        </div>

        {/* PDF Upload */}
        {form.submission_type !== 'question' && (
          <div>
            <label className="label">PDF File {form.submission_type === 'question_paper' ? '*' : '(Optional)'}</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                dragOver
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-navy-200 dark:border-navy-700 hover:border-brand-400'
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-brand-500" />
                  <div className="text-left">
                    <p className="font-medium text-navy-900 dark:text-white text-sm">{file.name}</p>
                    <p className="text-xs text-navy-400">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    className="btn btn-icon btn-ghost text-red-500 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                  <p className="text-navy-600 dark:text-navy-400 text-sm font-medium">Drop PDF here or click to browse</p>
                  <p className="text-navy-400 text-xs mt-1">PDF only • Max 20MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        )}

        <div className="pt-2 border-t border-navy-100 dark:border-navy-700">
          <div className="flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-navy-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-navy-500 dark:text-navy-400">
              By submitting, you confirm that you are authorized to share this material. Copyrighted content without permission will be rejected.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-gradient btn-lg w-full"
            id="upload-submit-btn"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" />Submit for Review</>
            )}
          </button>
        </div>
      </form>

      {/* Submission status note */}
      <div className="card p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-navy-900 dark:text-white text-sm">How it works</p>
          <ol className="mt-2 space-y-1">
            {['Submit your material', 'Admin reviews within 24-48 hours', 'Approved materials appear live for all students', 'You get a notification when approved/rejected'].map((s, i) => (
              <li key={i} className="text-xs text-navy-500 dark:text-navy-400 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
