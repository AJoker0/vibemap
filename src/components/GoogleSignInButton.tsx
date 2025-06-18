// src/components/GoogleSignInButton.tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function GoogleSignInButton() {
  const { data: session, status } = useSession()
  const { login, token } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  console.log('🧠 Google session:', session)

  const fetchBackendJWT = async () => {
    if (session?.accessToken && !token) {
      try {
        const res = await fetch('http://localhost:5000/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tokenId: session.accessToken }),
        })

        if (!res.ok) throw new Error('Backend rejected token')

        const data = await res.json()
        console.log('🎉 Received backend JWT:', data.token)
        login(data.token)
      } catch (e) {
        console.error('❌ Failed to get backend JWT:', e)
        setError('Ошибка входа через Google')
      }
    }
  }

  fetchBackendJWT()
}, [session, token, login])


  if (status === 'loading') return <p>Загрузка...</p>

  if (session?.user) {
    return (
      <div className="signed-in-user">
        <Image
          src={session.user.image || '/user.png'}
          alt={session.user.name || 'avatar'}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="ml-2">{session.user.name}</span>
        <button className="ml-4 btn" onClick={() => signOut()}>
          🚪 Выйти
        </button>
      </div>
    )
  }

  return (
    <>
      <button className="btn" onClick={() => signIn('google')}>
        🔐 Войти через Google
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </>
  )
}
