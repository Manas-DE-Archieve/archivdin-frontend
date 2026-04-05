import { useEffect, useState } from 'react'

/**
 * Modern confirmation dialog — replaces window.confirm()
 *
 * Props:
 *   open        boolean
 *   title       string
 *   message     string
 *   confirmText string (default "Удалить")
 *   cancelText  string (default "Отмена")
 *   variant     "danger" | "warning" (default "danger")
 *   onConfirm   () => void
 *   onCancel    () => void
 */
export default function ConfirmDialog({
  open,
  title = 'Вы уверены?',
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLeaving(false)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') handleCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const handleCancel = () => {
    setLeaving(true)
    setVisible(false)
    setTimeout(() => onCancel?.(), 200)
  }

  const handleConfirm = () => {
    setLeaving(true)
    setVisible(false)
    setTimeout(() => onConfirm?.(), 200)
  }

  if (!open && !leaving) return null

  const isDanger = variant === 'danger'

  const confirmStyle = {
    padding: '9px 20px',
    borderRadius: 10,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
    transition: 'all 0.15s ease',
    background: isDanger
      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
      : 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
    boxShadow: isDanger
      ? '0 2px 8px rgba(239,68,68,0.3)'
      : '0 2px 8px rgba(245,158,11,0.3)',
  }

  const iconBg = isDanger ? '#fef2f2' : '#fffbeb'
  const iconColor = isDanger ? '#ef4444' : '#f59e0b'

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: `rgba(10, 25, 45, ${visible ? 0.45 : 0})`,
        backdropFilter: `blur(${visible ? 4 : 0}px)`,
        transition: 'background 0.2s ease, backdrop-filter 0.2s ease',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 18,
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.22s cubic-bezier(0.34,1.4,0.64,1), opacity 0.18s ease',
      }}>
        {/* Icon + Title */}
        <div style={{ padding: '28px 28px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: iconBg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isDanger ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L16.5 15H1.5L9 2z" stroke={iconColor} strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 8v3M9 13v.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke={iconColor} strokeWidth="1.5"/>
                <path d="M9 6v4M9 12v.5" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div style={{ flex: 1, paddingTop: 2 }}>
            <h3 style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: '#1a2332',
              fontFamily: '"Playfair Display", serif',
            }}>
              {title}
            </h3>
            {message && (
              <p style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: '#64748b',
                lineHeight: 1.5,
                fontFamily: 'Manrope, sans-serif',
              }}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '20px 28px 24px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f1f5f9' }}
            onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={confirmStyle}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.filter = 'brightness(1.05)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.filter = 'none' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}