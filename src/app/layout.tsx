// src/app/layout.tsx

import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/buttons.css'
import '@/styles/country-badge.css'

import { AuthProvider } from '@/context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vibe Map',
  description: 'Explore and express emotions on the map',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId="72145842778-lq7dbd664294m4861e1vj5sc9qekep74.apps.googleusercontent.com">
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
