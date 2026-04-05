/**
 * VerifiedBadge
 *
 * Для ЛЮДЕЙ (persons):
 *   verifiedBy='ai'    → "Верифицирован ИИ"   (синяя звезда)
 *   verifiedBy='human' → "Верифицирован"       (синий чекмарк)
 *   status='pending'   → "На проверке"
 *   status='rejected'  → "Отклонён"
 *
 * Для ДОКУМЕНТОВ (documents) — используется similarityScore:
 *   verified + score < 0.50 (или null) → "Верифицирован ИИ"
 *   verified + score ≥ 0.50            → "Верифицирован"
 *   pending / rejected / auto_rejected → соответствующие бейджи
 */
export default function VerifiedBadge({
  status,
  similarityScore = null,
  verifiedBy = null,       // 'ai' | 'human' | null  (только для persons)
  size = 'sm',
  showLabel = true,
}) {
  // --- Определяем тип бейджа ---
  let type = null

  if (status === 'verified') {
    if (verifiedBy === 'ai') {
      type = 'ai'
    } else if (verifiedBy === 'human') {
      type = 'human'
    } else {
      // Для документов (verifiedBy не передаётся) — по similarityScore
      type = (similarityScore === null || similarityScore < 0.50) ? 'ai' : 'human'
    }
  } else if (status === 'pending') {
    type = 'pending'
  } else if (status === 'rejected') {
    type = 'rejected'
  } else if (status === 'auto_rejected') {
    type = 'auto_rejected'
  }

  const CONFIGS = {
    ai: {
      bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8',
      label: 'Верифицирован ИИ',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
        </svg>
      ),
    },
    human: {
      bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8',
      label: 'Верифицирован',
      icon: (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill="#1d4ed8"/>
          <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    pending: {
      bg: '#fffbeb', border: '#fde68a', color: '#92400e',
      label: 'На проверке',
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
        </svg>
      ),
    },
    rejected: {
      bg: '#fff1f2', border: '#fecdd3', color: '#9f1239',
      label: 'Отклонён',
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      ),
    },
    auto_rejected: {
      bg: '#fef2f2', border: '#fecaca', color: '#7f1d1d',
      label: 'Авто-отклонён',
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  }

  const cfg = CONFIGS[type]
  if (!cfg) return null

  const pad  = size === 'md' ? '4px 11px' : '2px 8px'
  const font = size === 'md' ? 12 : 11

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: pad, borderRadius: 20, fontSize: font, fontWeight: 600,
      fontFamily: 'Manrope, sans-serif',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {cfg.icon}
      {showLabel && cfg.label}
    </span>
  )
}