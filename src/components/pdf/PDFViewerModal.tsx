import React, { useEffect, useRef, useState } from 'react'
import { X, Download, Maximize2, Minimize2 } from 'lucide-react'

interface PDFViewerModalProps {
  url: string
  title: string
  onClose: () => void
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ url, title, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Build the viewer URL - use Google Docs viewer as fallback for cross-origin PDFs
  const viewerUrl = url.startsWith('blob:') || url.startsWith('http')
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    : url

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-navy-950/90 backdrop-blur-sm animate-fade-in`}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 h-14 bg-navy-900 border-b border-navy-800 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            download
            className="btn btn-sm btn-secondary flex items-center gap-1.5"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            onClick={toggleFullscreen}
            className="btn btn-icon btn-ghost text-white"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="btn btn-icon btn-ghost text-white"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden bg-navy-800">
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="w-full h-full border-0"
          title={title}
          allowFullScreen
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 h-10 bg-navy-900 border-t border-navy-800 flex-shrink-0">
        <p className="text-navy-400 text-xs">PDF Viewer</p>
        <p className="text-navy-400 text-xs">Press Esc to close</p>
      </div>
    </div>
  )
}
