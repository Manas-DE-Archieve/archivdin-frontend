import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../../node_modules/react-i18next'
import { useAuth } from '../hooks/useAuth'

const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'ENG' },
]

export default function Navbar({ onOpenLogin }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const links = [
    { to: '/',          label: t('nav.home') },
    { to: '/chat',      label: t('nav.chat') },
    { to: '/documents', label: t('nav.documents') },
    ...(user && ['moderator','super_admin'].includes(user.role)
      ? [{ to: '/admin', label: t('nav.admin') }]
      : []),
  ]

  return (
    <>
      <nav className="bg-primary-900 text-white border-b border-primary-800 shadow-lg sticky top-0 z-40">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary-300/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group mr-2">
            <div className="w-7 h-7 rounded border border-white/20 group-hover:border-white/40 flex items-center justify-center transition-colors">
              <span className="text-primary-300 text-xs font-serif font-bold">А</span>
            </div>
            <div className="leading-none hidden sm:block">
              <span className="block text-sm font-serif font-semibold text-white">{t('app.title')}</span>
              <span className="block text-slate-400 text-[10px] tracking-wider mt-px">{t('app.subtitle')}</span>
            </div>
            <span className="text-sm font-serif font-semibold text-white sm:hidden">Архивдин Үнү</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            <div className="h-5 w-px bg-slate-700 mr-1" />
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === l.to
                    ? 'text-primary-300 bg-primary-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-primary-800/30'
                }`}
              >
                {l.label}
                {pathname === l.to && (
                  <span className="absolute bottom-1 left-3 right-3 h-px bg-primary-300 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex-1 md:hidden" />

          {/* Desktop lang + auth */}
          <div className="hidden md:flex items-center gap-2">
            {LANGS.map(l => (
              <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
                className={`px-2 py-1 rounded text-[10px] font-semibold tracking-widest transition-colors ${
                  i18n.language === l.code ? 'bg-primary-500 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >{l.label}</button>
            ))}
            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-[11px] text-slate-500 truncate max-w-[120px]">{user.email}</span>
                <button onClick={logout}
                  className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-xs hover:border-slate-400 hover:text-white transition-colors">
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button onClick={onOpenLogin}
                className="px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-500 transition-colors ml-1">
                {t('nav.login')}
              </button>
            )}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden flex flex-col justify-center gap-[5px] w-9 h-9 p-2 rounded-lg hover:bg-primary-800/50 transition-colors"
            aria-label="Меню"
          >
            <span className={`block h-0.5 bg-slate-300 rounded transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-0.5 bg-slate-300 rounded transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-0.5 bg-slate-300 rounded transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      {open && (
        <div className="drawer-backdrop md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-primary-900 z-50 flex flex-col shadow-2xl md:hidden transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-primary-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-white/20 flex items-center justify-center">
              <span className="text-primary-300 text-xs font-serif font-bold">А</span>
            </div>
            <span className="text-sm font-serif font-semibold text-white">Архивдин Үнү</span>
          </div>
          <button onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-primary-800">
            ✕
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-primary-700 text-white'
                  : 'text-slate-300 hover:bg-primary-800/60 hover:text-white'
              }`}
            >
              {pathname === l.to && <span className="w-1 h-4 bg-primary-300 rounded-full" />}
              {l.label}
            </Link>
          ))}
        </div>

        {/* Lang + auth */}
        <div className="px-5 py-5 border-t border-primary-800 space-y-4">
          <div className="flex gap-1.5">
            {LANGS.map(l => (
              <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
                  i18n.language === l.code ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-slate-200 bg-primary-800/50'
                }`}
              >{l.label}</button>
            ))}
          </div>
          {user ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 truncate px-1">{user.email}</p>
              <button onClick={() => { logout(); setOpen(false) }}
                className="w-full py-2.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-primary-800 transition-colors">
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <button onClick={() => { onOpenLogin(); setOpen(false) }}
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-500 transition-colors">
              {t('nav.login')}
            </button>
          )}
        </div>
      </div>
    </>
  )
}