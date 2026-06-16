import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import './App.css'

const SESSION_KEY = 'crm_session'
const SESSION_TTL = 8 * 60 * 60 * 1000

function sessionValid() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const { expiresAt } = JSON.parse(raw)
    return Date.now() < expiresAt
  } catch {
    return false
  }
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ expiresAt: Date.now() + SESSION_TTL }))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}

function App() {
  const [login, setLogin]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [toast, setToast]           = useState(null)
  const [loading, setLoading]       = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(sessionValid)

  useEffect(() => {
    if (!isLoggedIn) return
    const timer = setInterval(() => {
      if (!sessionValid()) logout()
    }, 60_000)
    return () => clearInterval(timer)
  }, [isLoggedIn])

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function logout(showMsg = false) {
    clearSession()
    setIsLoggedIn(false)
    setLogin('')
    setPassword('')
    if (showMsg) showToast('Вы вышли из системы', 'success')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (login === 'admin' && password === 'admin') {
        saveSession()
        setIsLoggedIn(true)
      } else {
        setError('Неверный логин или пароль')
        setLoading(false)
      }
    }, 600)
  }

  const handleLogout = () => logout(true)

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <div className="login-page">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="login-card">

        <div className="login-logo">
          <span className="login-logo-name">Miestilo</span>
          <span className="login-logo-sub">CRM Panel</span>
        </div>

        <h1 className="login-title">Вход в систему</h1>
        <p className="login-subtitle">Введите данные для доступа к панели</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login">Логин</label>
            <input
              id="login"
              type="text"
              placeholder="admin"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="login-footer">
          Miestilo CRM &nbsp;·&nbsp; только для сотрудников
        </div>
      </div>
    </div>
  )
}

export default App
