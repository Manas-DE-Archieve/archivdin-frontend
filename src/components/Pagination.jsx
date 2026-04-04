import { useRef } from 'react'

export default function Pagination({ currentPage, totalPages, onPageChange, scrollRef }) {
  if (totalPages <= 1) return null

  const handleChange = (page) => {
    if (page === currentPage) return
    onPageChange(page)

    // Smooth scroll to top of list (or page top if no ref)
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Show: prev, up to 5 page numbers, next
  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, 5]
    if (currentPage >= totalPages - 2) return [totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
    return [currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2]
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      {/* Prev */}
      <button
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        ←
      </button>

      {/* First page if not in range */}
      {getPages()[0] > 1 && (
        <>
          <button onClick={() => handleChange(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-all">
            1
          </button>
          {getPages()[0] > 2 && <span className="text-slate-300 px-1">…</span>}
        </>
      )}

      {/* Page numbers */}
      {getPages().map(p => (
        <button
          key={p}
          onClick={() => handleChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            p === currentPage
              ? 'bg-primary-500 text-white shadow-sm scale-105'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          {p}
        </button>
      ))}

      {/* Last page if not in range */}
      {getPages()[getPages().length - 1] < totalPages && (
        <>
          {getPages()[getPages().length - 1] < totalPages - 1 && <span className="text-slate-300 px-1">…</span>}
          <button onClick={() => handleChange(totalPages)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-all">
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
      >
        →
      </button>
    </div>
  )
}