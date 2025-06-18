//src/app/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { useSession } from 'next-auth/react'
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, token } = useAuth() // <-- добавляем token
  const router = useRouter()
  const { data: session, status } = useSession()

  // ✅ Перенаправление, если вошёл через Google
  useEffect(() => {
    if (status === 'authenticated' && !token) {
      // Ждём, пока Google accessToken придёт
      console.log('✅ Вошёл через Google, но нет backend токена')
    }
    if (status === 'authenticated' && token) {
      router.push('/')
    }
  }, [status, token, router])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await loginUser(email, password)
      login(token)
      router.push('/')
    } catch {
      alert('Login failed')
    }
  }

  // Пока грузится Google сессия
  if (status === 'loading') {
    return <div className="login-container">Loading...</div>
  }

  // После входа ничего не показываем (ждём редирект)
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="login-container">
      <h2 className="login-title">🔐 Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn">
          Sign in
        </button>
      </form>

      <div className="divider">or</div>

      <GoogleSignInButton />
    </div>
  )
}
