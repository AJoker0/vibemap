'use client'

import { useEffect } from 'react'

export function GoogleLoginButton({ onLogin }: { onLogin: (id_token: string) => void }) {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (response: any) => onLogin(response.credential),
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-btn')!,
        { theme: 'outline', size: 'large' }
      )
    }
  }, [])

  return <div id="google-btn" />
}
