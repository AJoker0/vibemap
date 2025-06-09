'use client'

import { useState } from 'react'
import { loginUser } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await loginUser(email, password)
      login(token)
      onClose()
    } catch (err) {
      alert('Login failed')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>🔐 Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
          <button onClick={onClose}>❌ Cancel</button>
        </form>
      </div>
    </div>
  )
}
