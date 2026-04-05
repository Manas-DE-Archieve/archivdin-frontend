import { useEffect, useRef } from 'react'

/**
 * ConfirmDialog — заменяет window.confirm()
 * Без backdropFilter blur (причина лагов)
 * Без внутреннего leaving-state (причина второго неоткрытия)
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
  const overlayRef = useRef(null)
  const panelRef = useRef(null)

  // Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  // CSS-анимация через class — не через state, нет race condition
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return
    if (open) {
      overlayRef.current.style.opacity = '0'
      panelRef.current.style.transform = 'translateY(14px) scale(0.96)'
      panelRef.current.style.opacity = '0'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!overlayRef.current || !panelRef.current) return
          overlayRef.current.style.transition = 'opacity 0.18s ease'
          overlayRef.current.style.opacity = '1'
          panelRef.current.style.transition = 'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), opacity 0.16s ease'
          panelRef.current.style.transform = 'translateY(0) scale(1)'
          panelRef.current.style.opacity = '1'
        })
      })
    }
  }, [open])

  if (!open) return null

  const isDanger = variant === 'danger'
  const iconBg    = isDanger ? '#fef2f2' : '#fffbeb'
  const iconColor = isDanger ? '#ef4444' : '#f59e0b'
  const btnBg     = isDanger
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : 'linear-gradient(135deg, #f59e0b, #d97706)'
  const btnShadow = isDanger
    ? '0 2px 8px rgba(239,68,68,0.3)'
    : '0 2px 8px rgba(245,158,11,0.3)'

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        // Без backdropFilter blur — главная причина лагов
        backgroundColor: 'rgba(5, 18, 35, 0.72)',
      }}
    >
      <div
        ref={panelRef}
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        {/* Icon + Title */}
        <div style={{ padding: '28px 28px 0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              margin: 0, fontSize: 15, fontWeight: 700, color: '#1a2332',
              fontFamily: '"Playfair Display", serif',
            }}>
              {title}
            </h3>
            {message && (
              <p style={{
                margin: '6px 0 0', fontSize: 13, color: '#64748b',
                lineHeight: 1.5, fontFamily: 'Manrope, sans-serif',
              }}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, padding: '20px 28px 24px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 20px', borderRadius: 10,
              border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: 13, fontWeight: 600, color: '#64748b',
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: btnBg, boxShadow: btnShadow,
              fontSize: 13, fontWeight: 600, color: '#fff',
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.07)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}