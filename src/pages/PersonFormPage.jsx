import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import DuplicateWarning from '../components/DuplicateWarning'

const REGIONS = [
  'Чуйская область', 'Иссык-Кульская область', 'Нарынская область',
  'Джалал-Абадская область', 'Ошская область', 'Баткенская область', 'Таласская область',
]

const EMPTY = {
  full_name: '', birth_year: '', death_year: '', region: '', district: '',
  occupation: '', charge: '', arrest_date: '', sentence: '', sentence_date: '',
  rehabilitation_date: '', biography: '', source: '',
}

// 1. ВЫНЕСЛИ КОМПОНЕНТ ПОЛЯ ВВОДА НАРУЖУ
const FormField = ({ label, type = 'text', rows, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
    {rows ? (
      <textarea className="input" rows={rows} value={value || ''} onChange={onChange} />
    ) : (
      <input className="input" type={type} value={value || ''} onChange={onChange} />
    )}
  </div>
)

export default function PersonFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [duplicates, setDuplicates] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isEdit) {
      personsApi.get(id).then(({ data }) => {
        setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
      })
    }
  }, [id, isEdit])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAutoExtract = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtracting(true)
    setError('')
    try {
      const { data } = await personsApi.extractFromDocument(file)

      setForm(prev => ({
        ...prev,
        full_name: data.full_name || prev.full_name,
        birth_year: data.birth_year || prev.birth_year,
        death_year: data.death_year || prev.death_year,
        region: data.region || prev.region,
        district: data.district || prev.district,
        occupation: data.occupation || prev.occupation,
        charge: data.charge || prev.charge,
        arrest_date: data.arrest_date || prev.arrest_date,
        sentence: data.sentence || prev.sentence,
        sentence_date: data.sentence_date || prev.sentence_date,
        rehabilitation_date: data.rehabilitation_date || prev.rehabilitation_date,
        biography: data.biography || prev.biography,
        source: file.name
      }))
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при распознавании документа')
    } finally {
      setExtracting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const submit = async (force = false) => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, force }
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })

      let res
      if (isEdit) {
        res = await personsApi.update(id, payload)
      } else {
        res = await personsApi.create(payload)
      }

      if (res.data.duplicates_found) {
        setDuplicates(res.data.similar_persons)
        setLoading(false)
        return
      }
      navigate(`/persons/${res.data.id}`)
    } catch (e) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {duplicates && (
        <DuplicateWarning
          persons={duplicates}
          onConfirm={() => { setDuplicates(null); submit(true) }}
          onCancel={() => setDuplicates(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-stone-800">
          {isEdit ? t('person.edit') : t('person.add')}
        </h1>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAutoExtract}
            className="hidden"
            accept=".pdf,.txt,.md,image/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            className="btn-primary !bg-indigo-600 hover:!bg-indigo-700 !shadow-md transition-all"
          >
            {extracting ? '⏳ Читаю документ...' : '🪄 Заполнить из скана'}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        {extracting && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-xl border border-indigo-100 flex items-center gap-3">
              <span className="text-2xl animate-spin">⚙️</span>
              <div className="text-sm font-medium text-indigo-800">
                <p>ИИ изучает документ...</p>
                <p className="text-xs text-indigo-500 font-normal">Распознавание текста и поиск данных</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">{t('person.name')} *</label>
          <input className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>

        {/* 2. ИСПОЛЬЗУЕМ ВНЕШНИЙ КОМПОНЕНТ FormField */}
        <div className="grid grid-cols-2 gap-4">
          <FormField value={form.birth_year} onChange={set('birth_year')} label={t('person.birthYear')} type="number" />
          <FormField value={form.death_year} onChange={set('death_year')} label={t('person.deathYear')} type="number" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('person.region')}</label>
            <select className="input" value={form.region} onChange={set('region')}>
              <option value="">—</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <FormField value={form.district} onChange={set('district')} label={t('person.district')} />
        </div>

        <FormField value={form.occupation} onChange={set('occupation')} label={t('person.occupation')} />
        <FormField value={form.charge} onChange={set('charge')} label={t('person.charge')} />

        <div className="grid grid-cols-2 gap-4">
          <FormField value={form.arrest_date} onChange={set('arrest_date')} label={t('person.arrestDate')} type="date" />
          <FormField value={form.sentence_date} onChange={set('sentence_date')} label={t('person.sentenceDate')} type="date" />
        </div>

        <FormField value={form.sentence} onChange={set('sentence')} label={t('person.sentence')} />
        <FormField value={form.rehabilitation_date} onChange={set('rehabilitation_date')} label={t('person.rehabilitationDate')} type="date" />
        <FormField value={form.biography} onChange={set('biography')} label={t('person.biography')} rows={5} />
        <FormField value={form.source} onChange={set('source')} label={t('person.source')} />

        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">
            {t('person.cancel')}
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={loading || !form.full_name}
            className="btn-primary flex-1"
          >
            {loading ? t('common.loading') : t('person.save')}
          </button>
        </div>
      </div>
    </div>
  )
}