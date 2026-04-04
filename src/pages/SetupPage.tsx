import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setupApi } from '../api'

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export default function SetupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) return setError('Заполните все поля')
    if (password !== confirm) return setError('Пароли не совпадают')
    if (password.length < 8) return setError('Пароль минимум 8 символов')

    setLoading(true)
    try {
      await setupApi.setupSuperAdmin(email, password)
      setSuccess(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Ошибка создания'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f4fd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #1e3a5f, #2980b9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(41,128,185,0.3)',
          }}>
            <ShieldIcon />
          </div>
          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 26, fontWeight: 700,
            color: '#1a2332', margin: '0 0 8px',
          }}>
            Первичная настройка
          </h1>
          <p style={{ color: '#7d95ab', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Создание учётной записи Super Admin.<br />
            Этот endpoint доступен только один раз.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: '1px solid #e8eef5',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          padding: 32,
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ fontFamily: '"Playfair Display", serif', color: '#1a7f55', margin: '0 0 8px' }}>
                Super Admin создан!
              </h3>
              <p style={{ color: '#7d95ab', fontSize: 13 }}>
                Перенаправление на главную...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7d95ab', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7d95ab', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  className="input"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7d95ab', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  Подтвердить пароль
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  className="input"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {error && (
                <div style={{
                  background: '#fff1f2', border: '1px solid #fecdd3',
                  borderRadius: 10, padding: '10px 14px',
                  color: '#9f1239', fontSize: 13,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '13px 20px', fontSize: 14 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Создание...
                  </span>
                ) : (
                  '🔐 Создать Super Admin'
                )}
              </button>

              <div style={{
                background: '#fffbeb', border: '1px solid #fde8a0',
                borderRadius: 10, padding: '10px 14px',
                color: '#92600a', fontSize: 12, lineHeight: 1.5,
              }}>
                ⚠️ <strong>Безопасность:</strong> После создания этот endpoint автоматически блокируется. Сохраните пароль в надёжном месте.
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}