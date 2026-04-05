import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocumentViewerModal({ doc, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      // zIndex 200: выше всего, без backdrop-filter blur
      style={{ zIndex: 200, backgroundColor: 'rgba(5, 18, 35, 0.78)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl h-[85vh] flex flex-col shadow-card-lg"
        style={{ animation: 'modalSlideUp 0.18s ease', willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">📄</span>
            <h3 className="font-serif font-semibold text-slate-800 truncate">{doc.filename}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {doc.file_type === 'md' ? (
            <article className="prose prose-sm max-w-none prose-slate">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doc.raw_text}
              </ReactMarkdown>
            </article>
          ) : (
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">
              {doc.raw_text}
            </pre>
          )}
        </div>
      </div>

      <style>{`@keyframes modalSlideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}