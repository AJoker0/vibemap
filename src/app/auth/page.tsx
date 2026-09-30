'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, Mail, MapPinned, Sparkles } from 'lucide-react'
import { GoogleLoginButton } from '@/components/GoogleLoginButton'
import { useAuth } from '@/context/AuthContext'
import { register, loginUser } from '@/lib/auth'
import styles from './auth.module.css'

type MoodPin = {
  emoji: string
  label: string
  className: string
}

const moodPins: MoodPin[] = [
  { emoji: '🌤️', label: 'soft morning', className: styles.pinOne },
  { emoji: '🎧', label: 'city rhythm', className: styles.pinTwo },
  { emoji: '🫶', label: 'together', className: styles.pinThree },
  { emoji: '🌊', label: 'clear head', className: styles.pinFour },
]

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (token) router.replace('/')
  }, [token, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = isLogin
      ? await loginUser(email, password)
      : await register(email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (!result.token) {
      setError('The map signal did not return a session. Try again.')
      setLoading(false)
      return
    }

    await login(result.token)
    router.replace('/')
  }

  const switchMode = () => {
    setIsLogin((current) => !current)
    setError('')
    setPassword('')
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.atlas} aria-label="VibeMap emotional atlas">
        <div className={styles.atlasTopline}>
          <span className={styles.brandMark}><MapPinned size={17} /></span>
          <span className={styles.brandName}>VibeMap</span>
          <span className={styles.liveTag}><i /> live atlas</span>
        </div>

        <div className={styles.atlasCopy}>
          <p className={styles.eyebrow}>A map for how it feels</p>
          <h1>Leave a little<br /><em>feeling</em> behind.</h1>
          <p className={styles.description}>
            Pin your mood to a place, follow the atmosphere around you, and find the people moving through the same kind of day.
          </p>
        </div>

        <div className={styles.mapSketch} aria-hidden="true">
          <span className={`${styles.contour} ${styles.contourOne}`} />
          <span className={`${styles.contour} ${styles.contourTwo}`} />
          <span className={`${styles.contour} ${styles.contourThree}`} />
          <span className={styles.routeLine} />
          {moodPins.map((pin) => (
            <span key={pin.label} className={`${styles.moodPin} ${pin.className}`}>
              <b>{pin.emoji}</b>
              <small>{pin.label}</small>
            </span>
          ))}
          <span className={styles.youAreHere}><i /> you are here</span>
        </div>

        <div className={styles.atlasFooter}>
          <span><Sparkles size={15} /> 24h mood trails</span>
          <span>Varna / Sofia / everywhere</span>
        </div>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.panelKicker}>{isLogin ? 'Welcome back' : 'New on the atlas'}</div>
        <h2>{isLogin ? 'Find your way in.' : 'Mark your first place.'}</h2>
        <p className={styles.panelIntro}>
          {isLogin ? 'Your map is waiting where you left it.' : 'Create a small space for the moods that follow you.'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className={styles.inputWrap}>
              <Mail size={17} aria-hidden="true" />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@somewhere.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className={styles.inputWrap}>
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder={isLogin ? 'Your secret route' : 'At least 8 characters'}
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </label>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button className={styles.primaryAction} type="submit" disabled={loading}>
            <span>{loading ? 'Plotting your route...' : isLogin ? 'Open my map' : 'Create my map'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.divider}><span>or continue with</span></div>
        <GoogleLoginButton />

        <button className={styles.switchMode} type="button" onClick={switchMode}>
          {isLogin ? 'New here? Create an account' : 'Already have a map? Sign in'}
        </button>

        <p className={styles.privacyNote}>By entering VibeMap, you agree to keep the map kind.</p>
      </section>
    </main>
  )
}
