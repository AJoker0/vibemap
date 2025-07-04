// src/app/layout.tsx
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/buttons.css'
import '@/styles/country-badge.css'

import { AuthProvider } from '@/context/AuthContext'
import Script from 'next/script'
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
      <head>
        {/* Google OAuth script */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
          async
          defer
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
