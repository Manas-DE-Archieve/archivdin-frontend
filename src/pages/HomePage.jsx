import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import PersonCard from '../components/PersonCard'
import SearchBar from '../components/SearchBar'
import MapVisualization from '../components/MapVisualization'
import Pagination from '../components/Pagination'
import FactsTab from '../components/FactsTab'
import StatsBar from '../components/StatsBar'
import PersonModal from '../components/PersonModal'

const PAGE_SIZE = 10

export default function HomePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('people')
  const [persons, setPersons] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [params, setParams] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState(null)

  const load = useCallback(async (searchParams, p = 1) => {
    setLoading(true)
    try {
      const clean = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== '' && v != null))
      const { data } = await personsApi.list({ ...clean, page: p, limit: PAGE_SIZE })
      setPersons(data.items)
      setTotal(data.total)
      setPage(p)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load({}, 1) }, [load])

  const handleSearch = (p) => { setParams(p); load(p, 1) }
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    // Обертка. Добавлен pt-4 (padding-top) чтобы контент дышал
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-[#1a3a5c] via-[#1e4d78] to-[#16639e] p-6 sm:p-12 mb-6 sm:mb-8 shadow-xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_right,_rgba(255,255,255,0.1)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start sm:items-start text-left">
          <div className="flex items-center gap-3 mb-4 opacity-70">
            <div className="h-px w-6 sm:w-8 bg-white" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-white uppercase">1918 — 1953</span>
            <div className="h-px w-6 sm:w-8 bg-white" />
          </div>
          
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            Архивдин Үнү
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-lg mb-6 sm:mb-8 leading-relaxed">
            {t('app.description')}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
            {total > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white">{total.toLocaleString()}</span>
                <span className="text-white/60 text-xs sm:text-sm">{t('common.records')}</span>
              </div>
            )}
            <Link to="/chat" className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm hover:bg-white/25 transition-all">
              {t('nav.chat')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Mobile Tabs */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-xl mb-6 sm:mb-8">
        {[
          { id: 'people', label: t('nav.home') },
          { id: 'facts',  label: t('nav.history') },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === tb.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Column (Content) */}
        <div className="flex-1 min-w-0">
          
          {/* People Tab */}
          <div className={tab === 'people' ? 'block' : 'hidden'}>
            <SearchBar onSearch={handleSearch} />
            
            {!loading && persons.length > 0 && (
              <p className="text-xs text-slate-400 mt-4 mb-2 pl-1">
                {t('common.total')}: <strong className="text-slate-600">{total}</strong> {t('common.records')}
              </p>
            )}
            
            <div className="flex flex-col gap-3 mt-3">
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)
              ) : persons.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                  <div className="text-4xl mb-4 opacity-40">🕊</div>
                  <p className="font-serif text-lg text-slate-600 mb-1">{t('person.notFound')}</p>
                  <p className="text-xs text-slate-400">{t('person.notFoundSubtext')}</p>
                </div>
              ) : (
                persons.map(p => <PersonCard key={p.id} person={p} onClick={setSelectedPersonId} />)
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(params, p)} />
              </div>
            )}
          </div>

          {/* Facts Tab */}
          <div className={tab === 'facts' ? 'block' : 'hidden'}>
            <FactsTab />
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 order-last">
          <MapVisualization />
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2 mb-3">
              <span>📖</span> {t('about.title')}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              {t('about.description')}
            </p>
            <div className="pt-4 border-t border-slate-100">
              <Link to="/chat" className="w-full flex justify-center px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm">
                {t('chat.askButton')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {selectedPersonId && (
        <PersonModal personId={selectedPersonId} onClose={() => setSelectedPersonId(null)} />
      )}
    </div>
  )
}