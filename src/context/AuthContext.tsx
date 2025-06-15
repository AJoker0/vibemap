//src/context/AuthContext.tsx

'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type User = {
  id: string
  email: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // ✅ Получаем токен из localStorage безопасно
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken')
      // 💡 Убедимся, что это валидный JWT по формату
      if (
        storedToken &&
        typeof storedToken === 'string' &&
        storedToken.split('.').length === 3
      ) {
        setToken(storedToken)
      } else {
        localStorage.removeItem('authToken') // 🧹 чистим мусор
      }
    }
  }, [])

  // ✅ Проверяем токен при изменении
  useEffect(() => {
    const validate = async () => {
      if (!token) return

      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error('Invalid token')

        const data = await res.json()

        setUser({
          id: data.userId || data.id || 'unknown',
          email: data.email || 'anonymous',
        })
      } catch (err) {
        console.error('❌ Token validation failed:', err)
        logout()
      }
    }

    validate()
  }, [token])

  // ✅ Установка токена при входе
  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken)
    setToken(newToken)
  }

  // ✅ Удаление токена и состояния
  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ✅ Безопасный хук
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
