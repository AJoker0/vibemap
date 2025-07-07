// src/app/layout.tsx

import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import '@/styles/buttons.css'
import '@/styles/country-badge.css'

import { ClientProviders } from '@/components/ClientProviders'
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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
