import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'ENG' },
]

const ArchiveIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="5" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const DocsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const ShieldIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const LoginIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
const LogoutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

const NAV_ITEMS = [
  { to: '/',          labelKey: 'nav.home',      Icon: ArchiveIcon },
  { to: '/chat',      labelKey: 'nav.chat',      Icon: ChatIcon },
  { to: '/documents', labelKey: 'nav.documents', Icon: DocsIcon },
]

export default function Navbar({ onOpenLogin }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    // Закрываем меню с задержкой, чтобы отработала CSS-анимация
    setTimeout(() => setMenuOpen(false), 150)
  }

  // Закрытие меню при смене страницы
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <nav className="sticky top-0 z-[100] shadow-lg bg-gradient-to-br from-[#1a3a5c] to-[#16304f] border-b border-white/10 h-14">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between gap-2">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline relative z-[101]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 bg-white/10 border border-white/20">
              📜
            </div>
            <div className="leading-tight">
              <div className="text-white font-serif font-bold text-sm tracking-wide">Архивдин Үнү</div>
              <div className="text-white/40 text-[9px] tracking-[2px] uppercase hidden sm:block">{t('app.subtitle')}</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-6">
            {NAV_ITEMS.map(({ to, labelKey, Icon }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                    active ? 'bg-white/15 text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon />{t(labelKey)}
                </Link>
              )
            })}
            {['moderator', 'super_admin'].includes(user?.role) && (
              <Link to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  pathname === '/admin' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}>
                <ShieldIcon />{t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Right actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Language switcher */}
            <div className="flex items-center gap-0.5 rounded-lg p-1 bg-black/25 shadow-inner">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest transition-all duration-200 ${
                    i18n.language === l.code ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
                  }`}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                <span className="text-xs text-white/50 truncate max-w-[120px]">{user.email}</span>
                <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all border border-transparent">
                  <LogoutIcon />{t('nav.logout')}
                </button>
              </div>
            ) : (
              <button onClick={onOpenLogin} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-primary-400 to-primary-600 hover:from-primary-300 hover:to-primary-500 shadow-md transition-all">
                <LoginIcon />{t('nav.login')}
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden relative z-[101]">
            {!user && (
              <button onClick={onOpenLogin} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm">
                <LoginIcon />{t('nav.login')}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-white border border-white/10 active:bg-white/10 transition-colors">
              <div className="relative w-5 h-4">
                <span className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${menuOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute left-0 h-0.5 w-full bg-current transition-all duration-300 ${menuOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Smooth Transition) */}
      <div className={`fixed inset-0 z-[90] md:hidden transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#0a1526]/95 backdrop-blur-md" onClick={() => setMenuOpen(false)} />
        
        {/* Panel sliding down from top */}
        <div className={`absolute top-14 left-0 right-0 bg-gradient-to-b from-[#1e3d5f] to-[#16304f] border-b border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="px-4 py-4 flex flex-col gap-2">
            {NAV_ITEMS.map(({ to, labelKey, Icon }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/5'}`}>
                  <Icon />{t(labelKey)}
                </Link>
              )
            })}
            {['moderator', 'super_admin'].includes(user?.role) && (
              <Link to="/admin" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${pathname === '/admin' ? 'bg-white/15 text-white font-semibold' : 'text-white/70 hover:bg-white/5'}`}>
                <ShieldIcon />{t('nav.admin')}
              </Link>
            )}
          </div>

          <div className="h-px bg-white/10 mx-6 my-2" />

          <div className="px-6 py-4 space-y-5">
            {/* Langs */}
            <div className="flex bg-black/20 p-1.5 rounded-xl">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 ${i18n.language === l.code ? 'bg-white/20 text-white shadow-sm' : 'text-white/40'}`}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Auth Bottom */}
            {user && (
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-white/50 truncate pr-2">{user.email}</div>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
                  <LogoutIcon />{t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}