import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { documentsApi, factsApi } from '../api';
import FileUploader from '../components/FileUploader';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';
import DocumentViewerModal from '../components/DocumentViewerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import VerifiedBadge from '../components/VerifiedBadge';
import { toast } from '../components/Toast';

const PAGE_SIZE = 5;

// ── File type SVG icons ────────────────────────────────────────────────────────
const IcoPdf = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#fee2e2"/>
    <path d="M7 2h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="#fca5a5" stroke="#ef4444" strokeWidth="0.5"/>
    <path d="M14 2v4h4" fill="none" stroke="#ef4444" strokeWidth="0.8"/>
    <text x="6" y="18" style={{fontSize:'5px',fontWeight:700,fill:'#dc2626',fontFamily:'monospace'}}>PDF</text>
  </svg>
)
const IcoMd = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#e0e7ff"/>
    <path d="M7 2h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="#c7d2fe" stroke="#6366f1" strokeWidth="0.5"/>
    <path d="M14 2v4h4" fill="none" stroke="#6366f1" strokeWidth="0.8"/>
    <text x="6" y="18" style={{fontSize:'4.5px',fontWeight:700,fill:'#4f46e5',fontFamily:'monospace'}}>MD</text>
  </svg>
)
const IcoTxt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#f1f5f9"/>
    <path d="M7 2h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5"/>
    <path d="M14 2v4h4" fill="none" stroke="#94a3b8" strokeWidth="0.8"/>
    <text x="5.5" y="18" style={{fontSize:'4px',fontWeight:700,fill:'#64748b',fontFamily:'monospace'}}>TXT</text>
  </svg>
)

const FILE_ICONS = { pdf: <IcoPdf />, md: <IcoMd />, txt: <IcoTxt /> }

function ProcBadge({ status }) {
  const map = {
    pending:           { label: 'Ожидает',   color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
    processing:        { label: 'Обработка', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
    failed_extraction: { label: 'Ошибка ИИ', color: '#9f1239', bg: '#fff1f2', border: '#fecdd3' },
  }
  const cfg = map[status]
  if (!cfg) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 600,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

const LockBanner = ({ onOpenLogin }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer select-none"
    onClick={onOpenLogin}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-amber-800">Только для зарегистрированных</p>
      <p className="text-xs text-amber-600 mt-0.5">Войдите или создайте аккаунт, чтобы загружать документы</p>
    </div>
    <button onClick={onOpenLogin} className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
      Войти
    </button>
  </div>
)

export default function DocumentsPage({ onOpenLogin }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [viewingDoc, setViewingDoc] = useState(null)
  const [scope, setScope] = useState('all')
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Используем ref для хранения id удаляемого документа
  // чтобы избежать проблем с stale closure
  const deleteIdRef = useRef(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async (p = 1, currentScope = 'all', currentSearch = '') => {
    setLoading(true)
    try {
      const params = { page: p, limit: PAGE_SIZE }
      if (currentScope === 'my') params.scope = 'my'
      if (currentSearch.trim()) params.q = currentSearch.trim()
      const { data } = await documentsApi.list(params)
      setDocs(data.items ?? [])
      setTotal(data.total ?? 0)
      setPage(p)
    } catch (err) {
      if (err.response?.status === 401) setScope('all')
    } finally {
      setLoading(false)
    }
  }, [])

  // Храним актуальные scope и search в refs для использования в callbacks
  const scopeRef = useRef(scope)
  const searchRef = useRef(search)
  const pageRef = useRef(page)
  useEffect(() => { scopeRef.current = scope }, [scope])
  useEffect(() => { searchRef.current = search }, [search])
  useEffect(() => { pageRef.current = page }, [page])

  useEffect(() => { load(1, scope, search) }, [load, scope, search])

  const handleDeleteClick = (e, id) => {
    e.stopPropagation()
    e.preventDefault()
    deleteIdRef.current = id
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false)
    const id = deleteIdRef.current
    deleteIdRef.current = null
    if (!id) return
    try {
      await documentsApi.delete(id)
      toast.success('Документ удалён')
      // После удаления: если страница опустела — переходим на предыдущую
      const newTotal = total - 1
      const newMaxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE))
      const targetPage = Math.min(pageRef.current, newMaxPage)
      load(targetPage, scopeRef.current, searchRef.current)
    } catch {
      toast.error('Не удалось удалить документ')
    }
  }

  const handleDeleteCancel = () => {
    setConfirmOpen(false)
    deleteIdRef.current = null
  }

  const handleViewDoc = async (id) => {
    setViewingDoc({ id, filename: '...', raw_text: null })
    try {
      const { data } = await documentsApi.get(id)
      setViewingDoc(data)
    } catch {
      setViewingDoc(null)
    }
  }

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (viewId) {
      handleViewDoc(viewId)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleUploaded = () => {
    if (scope === 'my') load(1, 'my', search)
    else setScope('my')
  }

  const handleGenerateFacts = async () => {
    setGenerating(true); setGenMsg('')
    try { await factsApi.generate(); setGenMsg('Генерация запущена') }
    catch { setGenMsg('Ошибка запуска') }
    finally { setGenerating(false) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      {viewingDoc && (
        <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить документ?"
        message="Документ и все связанные данные будут удалены безвозвратно."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-800">{t('documents.title')}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Загружайте документы, и система автоматически создаст карточки.
            </p>
          </div>
          {user && ['moderator', 'super_admin'].includes(user.role) && (
            <div className="shrink-0 text-right">
              <button
                onClick={handleGenerateFacts}
                disabled={generating}
                className="btn-outline !text-xs !py-2 !px-3 flex items-center gap-1.5"
              >
                {generating
                  ? <span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                  : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                    </svg>
                  )
                }
                Сгенерировать факты
              </button>
              {genMsg && <p className="text-[11px] mt-1 text-slate-500">{genMsg}</p>}
            </div>
          )}
        </div>

        {/* Upload */}
        <div className="card p-5 space-y-3">
          <p className="field-label">Загрузить документ</p>
          {!user && <LockBanner onOpenLogin={onOpenLogin} />}
          <div className={!user ? 'pointer-events-none' : ''}>
            <FileUploader onUploaded={handleUploaded} disabled={!user} onDisabledClick={onOpenLogin} />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); load(1, scope, searchInput) } }}
            placeholder="Поиск по названию или содержимому..."
            className="input pl-9 pr-10 w-full"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); load(1, scope, '') }}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        {search && (
          <p className="text-xs text-slate-400 -mt-2">
            Результаты по запросу: <span className="font-medium text-slate-600">«{search}»</span>
          </p>
        )}

        {/* Tabs */}
        <div>
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setScope('all')}
              className={`px-4 py-2 text-sm font-medium ${scope === 'all' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}
            >
              Все документы
            </button>
            <button
              onClick={() => user ? setScope('my') : onOpenLogin?.()}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                user
                  ? scope === 'my'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-slate-500 hover:text-slate-700'
                  : 'text-slate-300 cursor-pointer hover:text-slate-400'
              }`}
            >
              {!user && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              )}
              Мои документы
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="card p-4 h-20 skeleton" />)
            ) : docs.length === 0 ? (
              <div className="card p-14 text-center">
                <div className="flex justify-center mb-3 opacity-30 text-slate-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="font-serif text-slate-500">{t('documents.empty')}</p>
              </div>
            ) : (
              docs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => handleViewDoc(doc.id)}
                  className="card-hover p-4 flex items-center gap-3 cursor-pointer"
                >
                  <div className="shrink-0">
                    {FILE_ICONS[doc.file_type] || <IcoTxt />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{doc.filename}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <VerifiedBadge
                      status={doc.verification_status}
                      similarityScore={doc.similarity_score}
                    />
                    {doc.status !== 'processed' && (
                      <ProcBadge status={doc.status} />
                    )}
                  </div>

                  {user && (user.role !== 'user' || user.id === doc.uploaded_by) && (
                    <button
                      onClick={e => handleDeleteClick(e, doc.id)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => load(p, scope, search)} />
          )}
        </div>
      </div>
    </>
  )
}