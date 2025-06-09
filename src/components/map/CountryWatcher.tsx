// src/components/map/CountryWatcher.tsx
'use client'

import { useMapEvents } from 'react-leaflet'
import { useEffect } from 'react'

export function CountryWatcher({
  onMove,
}: {
  onMove: (coords: [number, number]) => void
}) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter()
      onMove([center.lat, center.lng])
    },
  })

  return null
}
