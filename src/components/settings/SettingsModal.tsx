'use client'

import { useEffect, useState } from 'react'
import './settings-modal.css'
import { getProfile, updateProfile } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

type Profile = {
  name: string
  avatar: string
  birthday?: string
  username?: string
  notifications?: boolean
}

type Props = {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    avatar: '/user.png',
    birthday: '',
    username: '',
    notifications: false,
  })

  const [toastVisible, setToastVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [notifications, setNotifications] = useState(false)
  const [birthday, setBirthday] = useState('')
  const [showUsernameHint, setShowUsernameHint] = useState(false)

  const { token, logout } = useAuth()

  const handleLogout = async () => {
    // Используем единый logout из контекста: очищает JWT и NextAuth
    await logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      const data = await getProfile(token)

      setProfile(data)
      setUsername(data.username || '')
      setOriginalUsername(data.username || '')
      setNotifications(data.notifications ?? false)
      setBirthday(data.birthday || '1995-08-07')
      
      // 🔔 Показываем подсказку для дефолтного username
      if (data.isDefaultUsername || data.username?.includes('_')) {
        setShowUsernameHint(true)
      }
    }
    fetchData()
  }, [token])

  const checkUsername = async () => {
    if (!token) return false

    // 🔍 Проверка на пустое поле
    if (!username || username.trim() === '') {
      setUsernameError('⚠️ Username не может быть пустым')
      return false
    }

    // 🔍 Проверка на минимальную длину
    if (username.trim().length < 3) {
      setUsernameError('⚠️ Username должен содержать минимум 3 символа')
      return false
    }

    // 🔍 Проверка на недопустимые символы
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('⚠️ Разрешены только буквы, цифры и _')
      return false
    }

    if (username === originalUsername) {
      setUsernameError('')
      return true
    }

    // 🔍 Проверяем доступность для ВСЕХ пользователей через универсальный API
    try {
      let res
      if (token === 'nextauth-session') {
        // Для NextAuth пользователей используем Next.js API роут
        res = await fetch('/api/check-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        })
      } else {
        // Для JWT пользователей используем Express сервер
        res = await fetch(
          `http://localhost:5000/check-username?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      }
      
      if (!res.ok) {
        // Вместо throw делаем предупреждение
        console.warn('⚠️ Не удалось проверить доступность username:', res.status)
        setUsernameError('⚠️ Не удалось проверить доступность. Попробуйте позже')
        return false
      }
      const data = await res.json()
      if (data.taken) {
        setUsernameError('❌ Username уже занят')
        return false
      }
      setUsernameError('')
      return true
    } catch (err) {
      console.warn('⚠️ Username check failed:', err)
      setUsernameError('⚠️ Не удалось проверить username. Можете сохранить как есть')
      return false
    }
  }

  const handleSave = async () => {
    if (!token) return
    
    // 🔍 Проверяем валидность username перед сохранением
    if (!username || username.trim() === '') {
      setUsernameError('⚠️ Username не может быть пустым')
      return
    }
    
    if (usernameError) return
    
    const isValid = await checkUsername()
    if (!isValid) return

    try {
      await updateProfile(
        { ...profile, birthday, username: username.trim(), notifications },
        token
      )
      setToastVisible(true)
      setOriginalUsername(username.trim())
      setTimeout(() => setToastVisible(false), 3000)
    } catch (err: any) {
      console.error('❌ Failed to save:', err)
      
      // 🎯 Обрабатываем ошибку занятого username
      if (err.message.includes('уже занят') || err.message.includes('занят')) {
        setUsernameError('❌ Username уже занят. Выберите другой')
      } else {
        setUsernameError('❌ Не удалось сохранить. Попробуйте позже')
      }
    }
  }

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="settings-title">⚙️ SETTINGS</h2>

        <section>
          <h3 className="section-title">PROFILE</h3>
          <div className="row">
            <span>Picture</span>
            <Image
              src={profile.avatar}
              alt="avatar"
              className="avatar"
              width={100}
              height={100}
            />
          </div>
          <div className="row">
            <span>Name</span>
            <span className="dimmed">{profile.name}</span>
          </div>
          <div className="row column">
            <label>Username</label>
            <input
              type="text"
              className={`input-text ${usernameError ? 'error' : ''}`}
              value={username}
              placeholder="your_unique_username"
              onChange={(e) => {
                const value = e.target.value
                setUsername(value)
                setShowUsernameHint(false) // Скрываем подсказку при редактировании
                
                // 🔍 Валидация в реальном времени
                if (value.trim() === '') {
                  setUsernameError('')
                } else if (value.length < 3) {
                  setUsernameError('⚠️ Минимум 3 символа')
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                  setUsernameError('⚠️ Только буквы, цифры и _')
                } else {
                  setUsernameError('')
                }
              }}
              onBlur={checkUsername}
            />
            {usernameError && (
              <span 
                className={`error-text ${usernameError.includes('⚠️') ? 'warning' : 'error'}`}
                style={{
                  color: usernameError.includes('⚠️') ? '#f59e0b' : '#ef4444'
                }}
              >
                {usernameError}
              </span>
            )}
            {showUsernameHint && (
              <div className="username-hint">
                💡 <strong>Совет:</strong> Измените username на уникальный! 
                Друзья смогут найти вас по нему 🔍
              </div>
            )}
          </div>

          <div className="row">
            <span>Birthday</span>
            <input
              type="date"
              className="input-date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          <div className="row">
            <span>Friends</span>
            <span className="dimmed">1</span>
          </div>
          <div className="row">
            <span>Blocked users</span>
            <span className="dimmed">0</span>
          </div>
        </section>

        <section>
          <h3 className="section-title">PREFERENCES</h3>
          <div className="row">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => {
                setNotifications(e.target.checked)
                if (e.target.checked && Notification.permission !== 'granted') {
                  Notification.requestPermission()
                }
              }}
            />
          </div>
        </section>

        <div className="save-wrapper">
          <button
            className="save-settings-btn"
            onClick={handleSave}
            disabled={!!usernameError}
          >
            💾 Save
          </button>

          <button className="logout-btn" onClick={handleLogout} type="button">
            🚪 Logout
          </button>
        </div>
      </div>

      {toastVisible && (
        <div className="toast-popup">
          <span className="toast-icon">🎉</span>
          <span>Saved successfully!</span>
        </div>
      )}
    </div>
  )
}
