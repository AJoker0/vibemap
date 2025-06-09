// src/app/page.tsx

'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import AuthButtons from '../components/AuthButtons'
import { getProfile } from '@/lib/api'

// ⛔ SSR disabled for Leaflet map
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
})

export default function HomePage() {
  const { user, token } = useAuth()

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const data = await getProfile(token)
        console.log('✅ Профиль загружен:', data)
      } catch (err) {
        console.error('⚠️ Ошибка загрузки профиля:', err)
      }
    }
    load()
  }, [token])

  if (!user) {
    return <AuthButtons />
  }

  return <LeafletMap />
}
