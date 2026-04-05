import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { personsApi, adminApi, factsApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';
import VerifiedBadge from '../components/VerifiedBadge';
import { toast } from '../components/Toast';

const PAGE_SIZE = 20;
const USERS_PAGE_SIZE = 10;

// ── Icon components (функции, не JSX-объект) ───────────────────────────────────
const IcoUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcoDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IcoBan = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)
const IcoGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcoX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IcoUpload = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/>
  </svg>
)
const IcoWarn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IcoLock = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IcoShield = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IcoDone = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="16 10 11 15 8 12"/>
  </svg>
)
const IcoSparkle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
)
const IcoSpinner = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────────
function SimilarityBar({ score }) {
  if (score == null) return <span className="text-[11px] text-slate-400">—</span>
  const pct = Math.round(score * 100)
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 52, height: 5, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{pct}%</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-5 animate-pulse flex gap-4">
          <div className="skeleton w-3 h-14 rounded" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 skeleton rounded w-1/2" />
            <div className="h-3 skeleton rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ IconComponent, title, sub }) {
  return (
    <div className="card p-16 text-center">
      <div className="flex justify-center mb-3 opacity-25 text-slate-500">
        <IconComponent />
      </div>
      <p className="font-serif text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  )
}

// ── Buttons ────────────────────────────────────────────────────────────────────
function BtnVerify({ onClick, label = 'Верифицировать' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
    >
      <IcoCheck />{label}
    </button>
  )
}
function BtnReject({ onClick, label = 'Отклонить' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
    >
      <IcoX />{label}
    </button>
  )
}
function BtnRestore({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
    >
      <IcoUpload />Восстановить
    </button>
  )
}

// ── Doc row ────────────────────────────────────────────────────────────────────
function DocRow({ doc, accentColor, actions }) {
  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div style={{ width: 3, minHeight: 48, borderRadius: 4, background: accentColor, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-slate-400 shrink-0"><IcoDoc /></span>
          <p className="font-medium text-sm text-slate-800 truncate">{doc.filename}</p>
          <VerifiedBadge status={doc.verification_status} similarityScore={doc.similarity_score} />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-slate-400">
            {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Схожесть</span>
            <SimilarityBar score={doc.similarity_score} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0 flex-wrap">{actions}</div>
    </div>
  )
}

// ── Tabs ───────────────────────────────────────────────────────────────────────
function PendingDocumentsTab() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await adminApi.listPendingDocuments({ page: p, limit: PAGE_SIZE })
      setDocs(data.items); setTotal(data.total); setPage(p)
    } catch { setDocs([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(1) }, [load])

  const handle = async (id, status) => {
    try {
      await adminApi.verifyDocument(id, status)
      toast.success(status === 'verified' ? 'Документ верифицирован' : 'Документ отклонён')
      load(page)
    } catch { toast.error('Ошибка при обновлении статуса') }
  }

  if (loading) return <LoadingSkeleton />
  if (docs.length === 0) return (
    <EmptyState IconComponent={IcoDone} title="Нет документов на проверке" sub="Все загруженные документы верифицированы" />
  )

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <DocRow key={doc.id} doc={doc} accentColor="#f59e0b"
          actions={
            <>
              <BtnVerify onClick={() => handle(doc.id, 'verified')} />
              <BtnReject onClick={() => handle(doc.id, 'rejected')} />
            </>
          }
        />
      ))}
      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={load} />
      )}
    </div>
  )
}

function AutoRejectedTab() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await adminApi.listAutoRejected({ page: p, limit: PAGE_SIZE })
      setDocs(data.items); setTotal(data.total); setPage(p)
    } catch { setDocs([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(1) }, [load])

  const handle = async (id, status) => {
    try {
      await adminApi.overrideDocument(id, status)
      toast.success(status === 'verified' ? 'Документ восстановлен в архив' : 'Отклонение подтверждено')
      load(page)
    } catch { toast.error('Ошибка при обновлении статуса') }
  }

  if (loading) return <LoadingSkeleton />
  if (docs.length === 0) return (
    <EmptyState IconComponent={IcoShield} title="Нет авто-отклонённых документов" sub="Ни один документ не был заблокирован автоматически" />
  )

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
        <span className="text-red-500 mt-0.5 shrink-0"><IcoWarn /></span>
        <p className="text-xs text-red-700 font-medium leading-relaxed">
          Эти документы авто-отклонены из-за схожести ≥ 98%. Вы можете восстановить их вручную.
        </p>
      </div>
      {docs.map(doc => (
        <DocRow key={doc.id} doc={doc} accentColor="#ef4444"
          actions={
            <>
              <BtnRestore onClick={() => handle(doc.id, 'verified')} />
              <BtnReject onClick={() => handle(doc.id, 'rejected')} label="Подтвердить" />
            </>
          }
        />
      ))}
      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={load} />
      )}
    </div>
  )
}

function PendingPersonsTab() {
  const { t } = useTranslation()
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await personsApi.list({ status: 'pending', page: p, limit: PAGE_SIZE })
      setPersons(data.items); setTotal(data.total); setPage(p)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(1) }, [load])

  const setStatus = async (id, status) => {
    try {
      await personsApi.setStatus(id, status)
      toast.success(status === 'verified' ? 'Запись верифицирована' : 'Запись отклонена')
      load(page)
    } catch { toast.error('Ошибка при обновлении статуса') }
  }

  if (loading) return <LoadingSkeleton />
  if (persons.length === 0) return (
    <EmptyState IconComponent={IcoDone} title="Все записи проверены" sub="Нет записей, ожидающих проверки" />
  )

  return (
    <div className="space-y-3">
      {persons.map(p => (
        <div key={p.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div style={{ width: 3, minHeight: 48, borderRadius: 4, background: '#f59e0b', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link
                to={`/persons/${p.id}`}
                className="font-serif font-semibold text-slate-800 hover:text-primary-700 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                {p.full_name}
              </Link>
              <VerifiedBadge status={p.status} similarityScore={null} />
            </div>
            <p className="text-xs text-slate-400 truncate">
              {[p.birth_year, p.region, p.charge].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <BtnVerify onClick={() => setStatus(p.id, 'verified')} label={t('admin.verify')} />
            <BtnReject onClick={() => setStatus(p.id, 'rejected')} label={t('admin.reject')} />
          </div>
        </div>
      ))}
      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={load} />
      )}
    </div>
  )
}

function UsersTab() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const searchTimeoutRef = useRef(null)

  const loadUsers = useCallback(async (p = 1, q = '') => {
    setLoading(true)
    try {
      const { data } = await adminApi.listUsers({ page: p, limit: USERS_PAGE_SIZE, q })
      setUsers(data.items); setTotal(data.total); setPage(p)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadUsers(1, search) }, [loadUsers, search])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success('Роль успешно изменена')
    } catch { toast.error('Не удалось изменить роль') }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Поиск по email..."
        onChange={e => {
          clearTimeout(searchTimeoutRef.current)
          const v = e.target.value
          searchTimeoutRef.current = setTimeout(() => setSearch(v), 500)
        }}
        className="input mb-4"
      />
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-5 py-3">Пользователь</th>
              <th className="px-5 py-3">Роль</th>
              <th className="px-5 py-3">Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(3)].map((_, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-5 py-3"><div className="h-4 skeleton rounded w-48" /></td>
                  <td className="px-5 py-3"><div className="h-4 skeleton rounded w-24" /></td>
                  <td className="px-5 py-3"><div className="h-4 skeleton rounded w-20" /></td>
                </tr>
              ))
              : users.map(user => (
                <tr key={user.id} className="bg-white border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{user.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUser.id || user.role === 'super_admin'}
                      className="input !py-1 !px-2 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="user">Пользователь</option>
                      <option value="moderator">Модератор</option>
                      {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {Math.ceil(total / USERS_PAGE_SIZE) > 1 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / USERS_PAGE_SIZE)}
          onPageChange={p => loadUsers(p, search)}
        />
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
const TABS_CFG = [
  { id: 'persons',       label: 'Люди',            Icon: IcoUser,    danger: false },
  { id: 'documents',     label: 'Документы',        Icon: IcoDoc,     danger: false },
  { id: 'auto_rejected', label: 'Авто-отклонённые', Icon: IcoBan,     danger: true  },
]
const SUPER_TAB = { id: 'users', label: 'Пользователи', Icon: IcoGear, danger: false }

export default function AdminPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('persons')
  const [counts, setCounts] = useState({ persons: 0, documents: 0, autoRejected: 0 })
  const [generatingFacts, setGeneratingFacts] = useState(false)
  const [factsMsg, setFactsMsg] = useState('')
  const [factsOk, setFactsOk] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      personsApi.list({ status: 'pending', page: 1, limit: 1 }),
      adminApi.listPendingDocuments({ page: 1, limit: 1 }),
      adminApi.listAutoRejected({ page: 1, limit: 1 }),
    ]).then(([p, d, ar]) => {
      setCounts({
        persons:      p.status  === 'fulfilled' ? (p.value.data.total  ?? 0) : 0,
        documents:    d.status  === 'fulfilled' ? (d.value.data.total  ?? 0) : 0,
        autoRejected: ar.status === 'fulfilled' ? (ar.value.data.total ?? 0) : 0,
      })
    })
  }, [])

  const handleGenerateFacts = async () => {
    setGeneratingFacts(true); setFactsMsg('')
    try {
      await factsApi.generate()
      setFactsOk(true); setFactsMsg('Генерация запущена в фоне.')
    } catch {
      setFactsOk(false); setFactsMsg('Ошибка при запуске генерации.')
    } finally { setGeneratingFacts(false) }
  }

  if (!user || !['moderator', 'super_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-slate-300 mb-3"><IcoLock /></div>
        <p className="font-serif text-lg text-slate-400">Доступ запрещён</p>
      </div>
    )
  }

  const totalPending = counts.persons + counts.documents
  const tabs = user.role === 'super_admin' ? [...TABS_CFG, SUPER_TAB] : TABS_CFG
  const countMap = { persons: counts.persons, documents: counts.documents, auto_rejected: counts.autoRejected, users: 0 }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-800">{t('admin.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Ожидают проверки: <strong className="text-slate-600">{totalPending}</strong>
          </p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">{totalPending} ожидают проверки</span>
          </div>
        )}
      </div>

      {/* Facts generation */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-serif font-semibold text-slate-800 text-sm">Генерация фактов</p>
          <p className="text-xs text-slate-400 mt-0.5">«Знаете ли вы?» для всех документов без фактов</p>
          {factsMsg && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={factsOk ? 'text-emerald-500' : 'text-red-500'}>
                {factsOk ? <IcoCheck /> : <IcoX />}
              </span>
              <p className={`text-xs font-medium ${factsOk ? 'text-emerald-600' : 'text-red-600'}`}>
                {factsMsg}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleGenerateFacts}
          disabled={generatingFacts}
          className="btn-primary !text-xs !py-2 !px-4 shrink-0 disabled:opacity-60"
        >
          {generatingFacts
            ? <span className="flex items-center gap-1.5"><IcoSpinner /> Запуск...</span>
            : <span className="flex items-center gap-1.5"><IcoSparkle /> Сгенерировать факты</span>
          }
        </button>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-slate-200 mb-5 overflow-x-auto">
          {tabs.map(tab => {
            const cnt = countMap[tab.id] || 0
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  isActive
                    ? tab.danger
                      ? 'border-red-500 text-red-600'
                      : 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={isActive ? '' : 'opacity-50'}>
                  <tab.Icon />
                </span>
                {tab.label}
                {cnt > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    tab.danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {cnt}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {activeTab === 'persons'       && <PendingPersonsTab />}
        {activeTab === 'documents'     && <PendingDocumentsTab />}
        {activeTab === 'auto_rejected' && <AutoRejectedTab />}
        {activeTab === 'users'         && <UsersTab />}
      </div>
    </div>
  )
}