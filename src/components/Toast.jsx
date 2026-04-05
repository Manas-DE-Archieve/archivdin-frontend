import { useState, useCallback, useEffect, useRef } from 'react'

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#22c55e" fillOpacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
      <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#ef4444" fillOpacity=".12" stroke="#ef4444" strokeWidth="1.5"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#3b82f6" fillOpacity=".12" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M8 7v4M8 5v.5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const STYLES = {
  success: { border: '#bbf7d0', bg: '#f0fdf4', text: '#15803d' },
  error:   { border: '#fecaca', bg: '#fff5f5', text: '#dc2626' },
  info:    { border: '#bfdbfe', bg: '#eff6ff', text: '#1d4ed8' },
}

function ToastItem({ id, type = 'info', message, onRemove }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Enter
    requestAnimationFrame(() => setVisible(true))
    // Auto-dismiss
    const t = setTimeout(() => dismiss(), 3800)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setLeaving(true)
    setTimeout(() => onRemove(id), 280)
  }

  const s = STYLES[type] || STYLES.info

  return (
    <div
      onClick={dismiss}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 14px',
        borderRadius: 12,
        border: `1px solid ${s.border}`,
        background: s.bg,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        userSelect: 'none',
        minWidth: 240,
        maxWidth: 360,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(32px) scale(0.96)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <span style={{ flexShrink: 0 }}>{ICONS[type]}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: s.text, lineHeight: 1.4, flex: 1 }}>
        {message}
      </span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// Singleton emitter — no context needed
let _emit = null
export const toast = {
  success: (msg) => _emit?.('success', msg),
  error:   (msg) => _emit?.('error', msg),
  info:    (msg) => _emit?.('info', msg),
}

export function ToastContainer() {
  const [items, setItems] = useState([])
  const idRef = useRef(0)

  useEffect(() => {
    _emit = (type, message) => {
      const id = ++idRef.current
      setItems(prev => [...prev, { id, type, message }])
    }
    return () => { _emit = null }
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {items.map(item => (
        <div key={item.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem {...item} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}