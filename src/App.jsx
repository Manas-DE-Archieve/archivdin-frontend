import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import HomePage from './pages/HomePage'
import PersonPage from './pages/PersonPage'
import ChatPage from './pages/ChatPage'
import DocumentsPage from './pages/DocumentsPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import SetupPage from './pages/SetupPage'

function ProtectedRoute({ children, roles, onOpenLogin }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e8eef5', borderTopColor: '#2980b9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Загрузка...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!user) {
    if (onOpenLogin) { onOpenLogin(); return <Navigate to="/" replace /> }
    return <Navigate to="/login" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navbar onOpenLogin={() => setLoginOpen(true)} />
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/persons/:id" element={<PersonPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/admin" element={
            <ProtectedRoute roles={['moderator', 'super_admin']} onOpenLogin={() => setLoginOpen(true)}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}