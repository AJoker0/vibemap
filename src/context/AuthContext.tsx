// src/context/AuthContext.tsx

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

  // 🛂 Initialize token from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken')
      if (savedToken) {
        setToken(savedToken)
      }
    }
  }, [])

  // 🛂 Token changes → validate it
  useEffect(() => {
    if (token) {
      validateToken(token)
    }
  }, [token])

  const validateToken = async (token: string) => {
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

  const login = (newToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', newToken)
    }
    setToken(newToken) // ✅ validate произойдёт в useEffect
  }

  // Найдите функцию logout и измените роутинг:

const logout = () => {
  setToken(null)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
    window.location.href = '/auth'  // Должно быть /auth
  }
}

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 🧪 Safe Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
