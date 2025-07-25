// src/components/auth/LoginModal.tsx

'use client'

import { useState } from 'react'
import { loginUser } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'
import { GoogleLoginButton } from '@/components/GoogleLoginButton'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await loginUser(email, password)

      if (res.token) {
        await login(res.token)
        onClose()
      } else {
        alert(res.error || 'Login failed')
      }
    } catch {
      alert('Login failed')
    }
  }

  const handleGoogleLogin = () => {
    console.log('🎯 Google login clicked - using NextAuth')
    // NextAuth обработает все сам
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="text-2xl font-bold text-center mb-4">🔐 Welcome Back!</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Ready to explore the world?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="📧 Enter your email"
          />
          <input
            className="input"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="🔒 Enter your password"
          />
          <button type="submit" className="btn-primary">🚀 Launch In</button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            ❌ Cancel
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-sm text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex justify-center">
          <GoogleLoginButton onLogin={handleGoogleLogin} />
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm">🌟 Don't have an account?</span>{' '}
          <a href="/auth/register" className="text-blue-600 font-bold hover:underline">
            Join the adventure!
          </a>
        </div>
      </div>
    </div>
  )
}