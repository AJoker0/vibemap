//src/app/auth/page.tsx

'use client'

import { GoogleLoginButton } from '@/components/GoogleLoginButton'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register, loginUser } from '@/lib/auth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = isLogin
        ? await loginUser(email, password)
        : await register(email, password)

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.token) {
        login(result.token)
        router.push('/')
      } else {
        setError('Something went wrong 😢')
      }
    } catch (err) {
      setError('Unexpected error 😵')
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) }
          50% { transform: translateY(-20px) rotate(5deg) }
        }
        
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1) }
          50% { transform: translateY(-30px) scale(1.1) }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(60px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        
        @keyframes shimmer {
          0% { background-position: -300% 0 }
          100% { background-position: 300% 0 }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) }
          40% { transform: translateY(-10px) }
          60% { transform: translateY(-5px) }
        }
        
        @keyframes textGlow {
          0% { filter: brightness(1) }
          100% { filter: brightness(1.2) }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          25% { transform: translateX(-5px) }
          75% { transform: translateX(5px) }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.8 }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // ✅ Разделили background на отдельные свойства
        backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)`,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        padding: '20px',
        overflow: 'hidden',
        margin: 0,
        boxSizing: 'border-box'
      }}>
        {/* Animated background particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // ✅ Разделили background на отдельные свойства
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          animation: 'float 6s ease-in-out infinite'
        }} />
        
        {/* Floating orbs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'floatOrb 4s ease-in-out infinite',
          backdropFilter: 'blur(10px)'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '15%',
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          animation: 'floatOrb 3s ease-in-out infinite reverse',
          backdropFilter: 'blur(8px)'
        }} />

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: `
            0 32px 64px rgba(0,0,0,0.15),
            0 16px 32px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.9)
          `,
          width: '100%',
          maxWidth: '420px',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideInUp 0.8s ease-out',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          {/* Card glow effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            // ✅ Разделили background на отдельные свойства
            backgroundImage: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c)',
            backgroundSize: '300% 100%',
            animation: 'shimmer 3s ease-in-out infinite'
          }} />

          <div style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
              animation: 'bounce 2s ease-in-out infinite'
            }}>
              {isLogin ? '🔐' : '✨'}
            </div>
            
            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              backgroundImage: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem',
              animation: 'textGlow 2s ease-in-out infinite alternate',
              margin: '0 0 0.5rem 0'
            }}>
              {isLogin ? 'Welcome Back!' : 'Join VibeMap'}
            </h1>
            
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              opacity: 0.8,
              margin: 0
            }}>
              {isLogin ? 'Ready to explore the world?' : 'Start your adventure today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.2rem',
                color: '#667eea',
                zIndex: 1
              }}>
                📧
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '16px 16px 16px 50px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '16px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1.2rem',
                color: '#667eea',
                zIndex: 1
              }}>
                🔒
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '16px 16px 16px 50px',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '16px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)'
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <div style={{
                color: '#ef4444',
                fontSize: '14px',
                textAlign: 'center',
                backgroundImage: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #fecaca',
                animation: 'shake 0.5s ease-in-out'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '18px',
                // ✅ Разделили background на отдельные свойства
                backgroundImage: loading 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
                backgroundSize: '200% 100%',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                animation: loading ? 'pulse 1.5s ease-in-out infinite' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)'
                  e.currentTarget.style.backgroundPosition = '100% 0'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)'
                  e.currentTarget.style.backgroundPosition = '0% 0'
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  Processing Magic...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isLogin ? '🚀 Launch In' : '🌟 Create Magic'}
                </span>
                
              )}
              
            </button>
            <GoogleLoginButton onLogin={loginWithGoogle} />
          </form>

          <div style={{ 
            textAlign: 'center', 
            margin: '2rem 0',
            position: 'relative'
          }}>
            <div style={{ 
              height: '1px', 
              backgroundImage: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', 
              margin: '0 auto', 
              width: '100%' 
            }}></div>
            <span style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              padding: '0 1.5rem', 
              color: '#64748b', 
              fontSize: '14px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(10px)'
            }}>
              or
            </span>
          </div>

          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '16px',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.15)'
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {isLogin ? "🌟 Don't have an account? Join the adventure!" : "🔐 Already exploring? Welcome back!"}
          </button>
        </div>
      </div>
    </>
  )
}