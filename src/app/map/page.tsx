'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false, // <-- обязательно для Leaflet!
})

export default function MapPage() {
  return <MapView />
}
