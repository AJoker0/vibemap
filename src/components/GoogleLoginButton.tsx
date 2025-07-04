'use client'

import { useEffect } from 'react'

interface GoogleLoginButtonProps {
  onLogin: (id_token: string) => void
}

export function GoogleLoginButton({ onLogin }: GoogleLoginButtonProps) {
  useEffect(() => {
    // Загружаем Google SDK
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: (response: any) => {
            console.log('Google login success:', response)
            console.log('🔥 Sending token to parent component...')
            onLogin(response.credential)
          },
        })

        // Исправляем TypeScript ошибку
        const buttonElement = document.getElementById('google-login-button')
        if (buttonElement) {
          window.google.accounts.id.renderButton(
            buttonElement,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
            }
          )
        }
      }
    }

    return () => {
      // Проверяем что script существует перед удалением
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [onLogin])

  return (
    <div>
      <div id="google-login-button"></div>
    </div>
  )
}