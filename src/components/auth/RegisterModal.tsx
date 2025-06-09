//src/components/auth/RegisterModal.tsx

'use client'

import { useState } from 'react'
import { register } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext'

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await register(email, password)
      login(token)
      onClose()
    } catch {
      alert('Register failed')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>🆕 Register</h2>
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
          <button type="submit">Register</button>
          <button onClick={onClose}>❌ Cancel</button>
        </form>
      </div>
    </div>
  )
}
