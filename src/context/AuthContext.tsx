//src/context/AuthContext.tsx

'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'

type User = {
  id: string
  email: string
  name?: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  isValidating: boolean
  login: (token: string) => void
  loginWithGoogle: (id_token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { data: session, status } = useSession()

  // ✅ Проверяем NextAuth session
  useEffect(() => {
    if (status === 'loading') {
      setIsValidating(true)
      return
    }

    if (session?.user) {
      // Пользователь авторизован через NextAuth
      console.log('✅ NextAuth session found:', session.user)
      setUser({
        id: session.user.id || 'nextauth-user',
        email: session.user.email || '',
        name: session.user.name || '',
        avatar: session.user.image || '/user.png',
      })
      setToken('nextauth-session') // Используем специальный токен для NextAuth
      setIsValidating(false)
    } else {
      // Проверяем обычный JWT токен
      const saved = localStorage.getItem('authToken')
      if (saved) {
        console.log('🔑 Found JWT token in localStorage')
        setToken(saved)
      } else {
        console.log('👤 No auth found - user is anonymous')
        setIsValidating(false)
      }
    }
  }, [session, status])

  // ✅ Проверяем обычный JWT токен при изменении (если не NextAuth)
  useEffect(() => {
    if (token && token !== 'nextauth-session') {
      validateToken(token)
    }
  }, [token])

  // 🔍 Проверка JWT через API
  const validateToken = async (jwt: string) => {
    setIsValidating(true)
    try {
      const res = await fetch('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (!res.ok) throw new Error('Invalid token')
      const data = await res.json()
      setUser({
        id: data.userId || data.id || 'unknown',
        email: data.email || 'unknown',
        name: data.name,
        avatar: data.avatar,
      })
    } catch (err) {
      console.error('❌ Token validation failed:', err)
      logout()
    } finally {
      setIsValidating(false)
    }
  }

  // 💾 Login (email + password, или Google) — просто сет токена
  const login = (jwt: string) => {
    localStorage.setItem('authToken', jwt)
    setToken(jwt)
  }

  // 🔐 Google login handler
  const loginWithGoogle = async (id_token: string) => {
  const res = await fetch('http://localhost:5000/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token }),
  })

  const contentType = res.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text()
    throw new Error('Сервер вернул не JSON: ' + text)
  }

  const data = await res.json()

  if (data.token) {
    localStorage.setItem('authToken', data.token)
    setToken(data.token)
    setUser(data.user)
  } else {
    throw new Error('Нет токена в ответе от сервера')
  }
}

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    setIsValidating(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isValidating, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
