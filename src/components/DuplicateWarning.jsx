import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function DuplicateWarning({ persons, documents, mode = 'person', action = 'warn', message, onConfirm, onCancel }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = mode === 'document' ? documents : persons
  const isBlocked = action === 'block'

  const handleDocClick = (id) => {
    onCancel()
    navigate(`/documents?view=${id}`)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      // zIndex 200: выше Navbar/sidebar, без backdrop-filter blur
      style={{ zIndex: 200, backgroundColor: 'rgba(5, 18, 35, 0.78)' }}
    >
      <div
        className="card max-w-lg w-full p-7 shadow-card-lg"
        style={{ animation: 'modalSlideUp 0.18s ease', willChange: 'transform, opacity' }}
      >
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ring-1 ${
              isBlocked ? 'bg-red-50 ring-red-300' : 'bg-amber-50 ring-amber-200'
            }`}>
              {isBlocked ? '🚫' : '⚠'}
            </div>
            <h2 className="font-serif text-xl font-semibold text-slate-800">
              {mode === 'document'
                ? (isBlocked ? 'Загрузка запрещена' : 'Найдены похожие документы')
                : t('duplicate.title')}
            </h2>
          </div>
          <p className={`text-sm leading-relaxed ${isBlocked ? 'text-red-600' : 'text-slate-500'}`}>
            {message || (mode === 'document'
              ? (isBlocked
                  ? 'Документ слишком похож на уже существующий. Загрузка невозможна.'
                  : 'Найдены похожие документы. Нажмите на документ для просмотра или загрузите всё равно.')
              : t('duplicate.subtitle'))}
          </p>
        </div>

        <div className="divider-navy mb-4" />

        {items && items.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-5">
            {items.map(item => {
              const pct = Math.round(item.similarity_score * 100)
              const scoreColor = pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-slate-500'
              return (
                <div
                  key={item.id}
                  onClick={mode === 'document' ? () => handleDocClick(item.id) : undefined}
                  className={`flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 border transition-all ${
                    mode === 'document'
                      ? 'cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {mode === 'document' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">📄</span>
                        <p className="font-medium text-sm text-slate-800 truncate">{item.filename}</p>
                        <span className="text-[10px] text-indigo-400 shrink-0">↗ открыть</span>
                      </div>
                    ) : (
                      <>
                        <p className="font-serif font-semibold text-sm text-slate-800">{item.full_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.birth_year && `${item.birth_year} · `}{item.region}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t('duplicate.match')}</p>
                    <p className={`text-sm font-bold ${scoreColor}`}>{pct}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={onCancel} className="btn-outline flex-1">
            {isBlocked ? 'Закрыть' : t('duplicate.cancel')}
          </button>
          {!isBlocked && (
            <button onClick={onConfirm} className="btn-primary flex-1 justify-center">
              {t('duplicate.confirm')}
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes modalSlideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}