// src/app/page.tsx

'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import LoginModal from '@/components/auth/LoginModal'
import RegisterModal from '@/components/auth/RegisterModal'
import { getProfile } from '@/lib/api'

// ⛔ SSR disabled for Leaflet map
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
})

export default function HomePage() {
  const { user, token } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
          <div className="text-6xl mb-4">🌍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to VibeMap</h1>
          <p className="text-gray-600 mb-6">Share your mood with the world</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 transform hover:scale-105"
            >
              🚀 Launch In
            </button>
            
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition duration-300 transform hover:scale-105"
            >
              ✨ Join the Adventure
            </button>
          </div>
        </div>

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
        
        {showRegisterModal && (
          <RegisterModal onClose={() => setShowRegisterModal(false)} />
        )}
      </div>
    )
  }

  return <LeafletMap />
}
