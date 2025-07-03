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
  isValidating: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

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
    if (!token) {
      logout()
      return
    }

    setIsValidating(true)
    
    try {
      const res = await fetch('http://localhost:5000/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Invalid token')
      }

      const data = await res.json()
      setUser({
        id: data.userId || data.id || 'unknown',
        email: data.email || 'anonymous',
      })
    } catch (err) {
      console.error('❌ Token validation failed:', err)
      logout()
    } finally {
      setIsValidating(false)
    }
  }

  const login = (newToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', newToken)
    }
    setToken(newToken)
  }

  // ✅ Logout без router - просто очищаем состояние
  const logout = () => {
    setUser(null)
    setToken(null)
    setIsValidating(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isValidating, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}