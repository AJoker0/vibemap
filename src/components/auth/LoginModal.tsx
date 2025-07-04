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
        login(res.token)
        onClose()
      } else {
        alert(res.error || 'Login failed')
      }
    } catch {
      alert('Login failed')
    }
  }

  // ✅ Исправленная функция с правильными логами
  const handleGoogleLogin = async (id_token: string) => {
    console.log('🔥 Sending Google token to server...')
    console.log('🎯 Token received:', id_token.substring(0, 50) + '...')
    
    try {
      const res = await fetch('http://localhost:5000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token }),
      })

      console.log('📥 Server response status:', res.status)
      
      if (!res.ok) {
        console.error('❌ Server response not OK:', res.status, res.statusText)
        const errorText = await res.text()
        console.error('❌ Error response:', errorText)
        alert(`Google login failed: ${res.status} ${res.statusText}`)
        return
      }

      const data = await res.json()
      console.log('📦 Server response data:', data)
      
      if (data.token) {
        console.log('✅ Login successful, saving token...')
        login(data.token)
        onClose()
      } else {
        console.error('❌ Login failed:', data.error)
        alert(data.error || 'Google login failed')
      }
    } catch (err) {
      console.error('❌ Network error:', err)
      alert('Google login network error')
    }
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