import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthButtons() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`http://localhost:5000/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data: { token?: string; error?: string } = {}

      try {
        data = await res.json()
      } catch (jsonErr) {
        throw new Error(`❌ Invalid JSON from server: ${res.status}`)
      }

      if (!res.ok) throw new Error(data.error || 'Ошибка')
      if (!data.token) throw new Error('❌ No token returned')

      login(data.token)
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 8 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
