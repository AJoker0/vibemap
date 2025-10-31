//src/context/AuthContext.tsx

'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useSession, signOut } from 'next-auth/react'

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
  login: (token: string) => Promise<void>
  loginWithGoogle: (id_token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { data: session, status } = useSession()

  // ✅ Проверяем аутентификацию с правильным приоритетом
  useEffect(() => {
    if (status === 'loading') {
      setIsValidating(true)
      return
    }

    // 🎯 ПРИОРИТЕТ #1: JWT токен (email/password логин)
    const saved = localStorage.getItem('authToken')
    if (saved) {
      console.log('🔑 JWT token has priority - using email/password auth')
      setToken(saved)
      setIsValidating(false)
      return
    }

    // 🎯 ПРИОРИТЕТ #2: NextAuth session (только если нет JWT)
    if (session?.user) {
      console.log('✅ NextAuth session found (no JWT conflict):', session.user)
      
      // Получаем полные данные профиля через API
      const fetchNextAuthProfile = async () => {
        try {
          const response = await fetch('/api/profile')
          if (response.ok) {
            const profile = await response.json()
            setUser({
              id: profile.id || session.user.email,
              email: profile.email || session.user.email,
              name: profile.name || session.user.name,
              avatar: profile.avatar || session.user.image || '/user.png',
            })
          } else if (response.status === 404) {
            // Пользователь не найден в базе, нужно перелогиниться
            console.warn('⚠️ User not found in database. Please log in again.')
            setUser({
              id: session.user.id || 'nextauth-user',
              email: session.user.email || '',
              name: session.user.name || '',
              avatar: session.user.image || '/user.png',
            })
          } else {
            // Другая ошибка, используем данные сессии
            setUser({
              id: session.user.id || 'nextauth-user',
              email: session.user.email || '',
              name: session.user.name || '',
              avatar: session.user.image || '/user.png',
            })
          }
        } catch (error) {
          console.error('Error fetching NextAuth profile:', error)
          // Fallback к данным сессии
          setUser({
            id: session.user.id || 'nextauth-user',
            email: session.user.email || '',
            name: session.user.name || '',
            avatar: session.user.image || '/user.png',
          })
        } finally {
          // ВАЖНО: завершаем фазу валидации только после установки user,
          // иначе / страница успевает редиректнуть на /auth
          setIsValidating(false)
        }
      }
      
      setToken('nextauth-session') // Используем специальный токен для NextAuth
      fetchNextAuthProfile()
    } else {
      // Нет ни JWT, ни NextAuth - пользователь не авторизован
      console.log('� No authentication found')
      setIsValidating(false)
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

  // 💾 Login (email + password) - очищаем NextAuth и устанавливаем JWT
  const login = async (jwt: string) => {
    // Если есть активная NextAuth session - очищаем её
    if (session) {
      console.log('🧹 Clearing NextAuth session for JWT login')
      await signOut({ redirect: false })
    }
    
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

  // 🚪 Logout - очищаем ВСЕ типы аутентификации
  const logout = async () => {
    // Очищаем JWT
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
    setIsValidating(false)
    
    // Очищаем NextAuth session если есть
    if (session) {
      await signOut({ redirect: false })
    }
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
