// src/app/page.tsx

'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/api'

// ⛔ SSR disabled for Leaflet map
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
})

export default function HomePage() {
  const router = useRouter()
  const { user, token, isValidating } = useAuth()

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

  // 🚦 Единое правило: если пользователь не авторизован (нет JWT и нет NextAuth),
  // мягко перенаправляем на красивую страницу /auth. Учитываем состояние проверки,
  // чтобы избежать мигания контента при старте.
  useEffect(() => {
    if (isValidating) return
    if (!user) {
      router.replace('/auth')
    }
  }, [user, isValidating, router])

  // Во время проверки или мгновенно после редиректа ничего не рендерим
  if (isValidating || !user) return null

  return <LeafletMap />
}
