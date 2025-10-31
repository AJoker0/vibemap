// src/components/map/GlobalVibesModal.tsx - Модальное окно с глобальной статистикой вайбов по странам

'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type CountryStat = {
  country: string
  total: number
  topEmoji: { emoji: string; count: number }
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function GlobalVibesModal({ isOpen, onClose }: Props) {
  const { token } = useAuth()
  const [items, setItems] = useState<CountryStat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchGlobalVibes()
    }
  }, [isOpen])

  const fetchGlobalVibes = async () => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    
    try {
      let response
      
      if (token === 'nextauth-session') {
        // Для NextAuth пользователей
        response = await fetch('/api/global-vibes')
      } else {
        // Для JWT пользователей
        response = await fetch('http://localhost:5000/global-vibes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch global vibes')
      }
      
      const data = await response.json()
      // Нормализуем возможные ответы разных API
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data.countries)
          ? data.countries
          : []

      const normalized: CountryStat[] = raw.map((row: any) => {
        // Вариант Next.js API: { country, totalPeople, topVibe: {emoji,count} }
        if (row.topVibe && (row.totalPeople || row.total)) {
          return {
            country: row.country,
            total: row.totalPeople ?? row.total,
            topEmoji: { emoji: row.topVibe.emoji, count: row.topVibe.count },
          }
        }
        // Вариант Express (если отличается) или fallback
        if (row.country && row.vibes && Array.isArray(row.vibes) && row.vibes.length) {
          const top = [...row.vibes].sort((a: any, b: any) => b.count - a.count)[0]
          const total = row.vibes.reduce((s: number, v: any) => s + (v.count || 0), 0)
          return { country: row.country, total, topEmoji: { emoji: top.emoji, count: top.count } }
        }
        // Самый простой кейс: плоская запись
        return { country: row.country ?? 'Unknown', total: row.count ?? 0, topEmoji: { emoji: row.emoji ?? '❓', count: row.count ?? 0 } }
      })

      setItems(normalized)
    } catch (err) {
      console.error('❌ Error fetching global vibes:', err)
      setError('Не удалось загрузить глобальную статистику')
    } finally {
      setLoading(false)
    }
  }

  // Автообновление после добавления визита/вайба
  useEffect(() => {
    const handler = () => fetchGlobalVibes()
    window.addEventListener('visitAdded', handler)
    return () => window.removeEventListener('visitAdded', handler)
  }, [])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content global-vibes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌍 Global Vibes - последние 24 часа</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Загружаем глобальную статистику...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={fetchGlobalVibes} className="retry-button">
                Попробовать снова
              </button>
            </div>
          )}
          
          {!loading && !error && items.length === 0 && (
            <div className="empty-state">
              <p>🤔 Пока нет активных вайбов в последние 24 часа</p>
              <p>Будь первым, кто поделится настроением!</p>
            </div>
          )}
          
          {!loading && !error && items.length > 0 && (
            <div className="country-vibes-grid">
              {items.map((c) => (
                <div key={c.country} className="country-vibe-card">
                  <div className="country-header">
                    <span className="country-name">{c.country}</span>
                    <span className="vibe-count">Всего: {c.total}</span>
                  </div>
                  <div className="vibe-display">
                    <span className="vibe-emoji">{c.topEmoji.emoji}</span>
                  </div>
                  <div className="fun-message">
                    Страна: <b>{c.country}</b> • Большое количество эмоции: <span style={{fontSize:'1.1rem'}}>{c.topEmoji.emoji}</span> <b>{c.topEmoji.count}</b>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        
        .global-vibes-modal {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 90vw;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: white;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          max-height: calc(80vh - 80px);
        }
        
        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 40px 20px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .retry-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 16px;
          transition: background-color 0.2s;
        }
        
        .retry-button:hover {
          background: #5a67d8;
        }
        
        .country-vibes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .country-vibe-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }
        
        .country-vibe-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }
        
        .country-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .country-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 1.1rem;
        }
        
        .vibe-count {
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .vibe-display {
          text-align: center;
          margin: 16px 0;
        }
        
        .vibe-emoji {
          font-size: 3rem;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .fun-message {
          background: rgba(102, 126, 234, 0.1);
          padding: 12px;
          border-radius: 8px;
          font-style: italic;
          color: #4c51bf;
          text-align: center;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        @media (max-width: 640px) {
          .global-vibes-modal {
            width: 95vw;
            margin: 20px;
          }
          
          .country-vibes-grid {
            grid-template-columns: 1fr;
          }
          
          .modal-header {
            padding: 16px;
          }
          
          .modal-header h2 {
            font-size: 1.25rem;
          }
          
          .modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  )
}
