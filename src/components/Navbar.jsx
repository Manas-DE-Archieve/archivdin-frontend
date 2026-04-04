import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const LANGS = [
  { code: 'ru', label: 'РУС' },
  { code: 'ky', label: 'КЫР' },
  { code: 'en', label: 'ENG' },
]

const ArchiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="5" rx="2"/>
    <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/>
    <path d="M10 13h4"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const DocsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const LoginIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const NAV_ITEMS = [
  { to: '/',          labelKey: 'nav.home',      Icon: ArchiveIcon },
  { to: '/chat',      labelKey: 'nav.chat',      Icon: ChatIcon },
  { to: '/documents', labelKey: 'nav.documents', Icon: DocsIcon },
]

export default function Navbar({ onOpenLogin }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  return (
    <nav className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #16304f 100%)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 no-underline mr-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
               style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            📜
          </div>
          <div className="leading-tight">
            <div className="text-white font-serif font-bold text-sm tracking-wide">Архивдин Үнү</div>
            <div className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
              {t('app.subtitle')}
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-7 shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(({ to, labelKey, Icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-150"
                style={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}}
              >
                <Icon />
                {t(labelKey)}
              </Link>
            )
          })}

          {['moderator', 'super_admin'].includes(user?.role) && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all duration-150"
              style={{
                color: pathname === '/admin' ? '#fff' : 'rgba(255,255,255,0.6)',
                background: pathname === '/admin' ? 'rgba(255,255,255,0.15)' : 'transparent',
              }}
              onMouseEnter={e => { if (pathname !== '/admin') { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}}
              onMouseLeave={e => { if (pathname !== '/admin') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}}
            >
              <ShieldIcon />
              {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-0.5 rounded-lg p-1" style={{ background: 'rgba(0,0,0,0.25)' }}>
          {LANGS.map(l => {
            const active = i18n.language === l.code
            return (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                className="px-2.5 py-1 rounded-md border-0 cursor-pointer font-bold tracking-widest transition-all duration-150"
                style={{
                  fontSize: 10,
                  background: active ? 'rgba(255,255,255,0.22)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {l.label}
              </button>
            )
          })}
        </div>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:block text-xs truncate max-w-32" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {user.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer border transition-all duration-150"
              style={{
                background: 'transparent',
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              <LogoutIcon />
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #3b9edb, #2980b9)',
              boxShadow: '0 2px 8px rgba(41,128,185,0.4)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(41,128,185,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(41,128,185,0.4)' }}
          >
            <LoginIcon />
            {t('nav.login')}
          </button>
        )}
      </div>
    </nav>
  )
}