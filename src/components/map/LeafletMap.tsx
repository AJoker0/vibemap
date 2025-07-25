'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import Supercluster from 'supercluster'
import type { Feature, Point } from 'geojson'
import L from 'leaflet'
import '@/styles/buttons.css'
import { VibeSelector } from './VibeSelector'
import './vibe-selector.css'
import { MapLayerSelector } from './MapLayerSelector'
import { CountryBadge } from './CountryBadge'
import { SettingsModal } from '../settings/SettingsModal'
import { ProfileModal } from '../profile/ProfileModal'
import { getFriends, getCityFromCoords } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type Friend = {
  name: string
  avatar: string
  mutual?: boolean
  daysAgo?: number
}

type City = {
  name: string
  places: number
}

type PointData = {
  id: number
  lat: number
  lng: number
  title: string
}

type PointProperties = {
  cluster: false
  pointId: number
  title: string
}

type ClusterProperties = {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated?: string | number
}

type ClusterOrPoint = Feature<Point, PointProperties | ClusterProperties>

const defaultPoints: PointData[] = [
  { id: 1, lat: 42.6977, lng: 23.3219, title: 'Sofia Center' },
  { id: 2, lat: 42.6988, lng: 23.322, title: 'Sofia North' },
]

// 🎨 Динамическая функция для создания иконки пользователя
const createUserIcon = (isDarkTheme: boolean) => {
  const shadowStyle = isDarkTheme
    ? `
      filter: 
        drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))
        drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))
        drop-shadow(0 0 24px rgba(255, 255, 255, 0.3));
      border: 3px solid rgba(255, 255, 255, 0.9);
      box-shadow: 
        0 0 12px rgba(255, 255, 255, 0.7),
        0 0 24px rgba(255, 255, 255, 0.4),
        0 0 36px rgba(255, 255, 255, 0.2);
    `
    : `` // ✅ Полностью убрали все эффекты для светлых тем

  return new L.DivIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: url('/user-map-location.png') center/cover;
        border-radius: 50%;
        position: relative;
        ${shadowStyle}
        transition: all 0.3s ease;
        animation: userPulse 2s infinite;
      "></div>
      <style>
        @keyframes userPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    className: 'user-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  })
}

function Clusters({ points }: { points: PointData[] }) {
  const map = useMap()
  const [clusters, setClusters] = useState<ClusterOrPoint[]>([])
  const [supercluster, setSupercluster] =
    useState<Supercluster<PointProperties> | null>(null)

  useEffect(() => {
    const index = new Supercluster<PointProperties>({ radius: 60, maxZoom: 17 })
    const geoPoints = points.map((point) => ({
      type: 'Feature' as const,
      properties: {
        cluster: false as const,
        pointId: point.id,
        title: point.title,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [point.lng, point.lat],
      },
    }))
    index.load(geoPoints)
    setSupercluster(index)
  }, [points])

  useEffect(() => {
    if (!supercluster || !map) return
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]
    const newClusters = supercluster.getClusters(bbox, Math.round(zoom))
    setClusters(newClusters as ClusterOrPoint[])
  }, [map, supercluster])

  return (
    <>
      {clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates
        const props = cluster.properties
        return 'cluster' in props && props.cluster ? (
          <Marker
            key={`cluster-${props.cluster_id}`}
            position={[lat, lng]}
            eventHandlers={{
              click: () => {
                if (supercluster) {
                  const zoom = supercluster.getClusterExpansionZoom(
                    props.cluster_id
                  )
                  map.setView([lat, lng], zoom)
                }
              },
            }}
          >
            <Popup>Cluster of {props.point_count} points</Popup>
          </Marker>
        ) : (
          <Marker key={`point-${props.pointId}`} position={[lat, lng]}>
            <Popup>{props.title}</Popup>
          </Marker>
        )
      })}
    </>
  )
}

function MapWatcher({
  userLocation,
  onMoveAway,
}: {
  userLocation: [number, number] | null
  onMoveAway: () => void
}) {
  useMapEvents({
    moveend: (e) => {
      if (!userLocation) return
      const center = e.target.getCenter()
      const dist = Math.sqrt(
        Math.pow(center.lat - userLocation[0], 2) +
          Math.pow(center.lng - userLocation[1], 2)
      )
      if (dist > 0.005) {
        onMoveAway()
      }
    },
  })
  return null
}

export default function LeafletMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  )
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [showFindMe, setShowFindMe] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState('standard')
  const [isLayerSelectorOpen, setIsLayerSelectorOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [userFriends, setUserFriends] = useState<Friend[]>([])
  const [visitedCities, setVisitedCities] = useState<City[]>([])
  const { token } = useAuth()

  // 🎨 Определяем темную тему
  const isDarkTheme = selectedLayer === 'dark' || selectedLayer === 'satellite'

  // 🎯 Создаем иконку с учетом темы
  const userIcon = createUserIcon(isDarkTheme)

  const openSettings = () => {
    setProfileOpen(false)
    setIsLayerSelectorOpen(false)
    setSettingsOpen(true)
  }

  const openProfile = () => {
    setSettingsOpen(false)
    setIsLayerSelectorOpen(false)
    setProfileOpen(prev => !prev)
  }

  const openLayerSelector = () => {
    setSettingsOpen(false)
    setProfileOpen(false)
    setIsLayerSelectorOpen(prev => !prev)
  }

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc: [number, number] = [coords.latitude, coords.longitude]
        setUserLocation(loc)
      },
      (_err) => {}
    )
  }, [])

  useEffect(() => {
    requestGeolocation()
  }, [requestGeolocation])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return
        const friends = await getFriends(token)
        
        // Загружаем визиты для всех авторизованных пользователей
        let visits = []
        if (token === 'nextauth-session') {
          // Для NextAuth пользователей используем Next.js API роут
          const visitsRes = await fetch('/api/visits')
          if (visitsRes.ok) {
            visits = await visitsRes.json()
          }
        } else {
          // Для JWT пользователей используем Express сервер
          const visitsRes = await fetch('http://localhost:5000/visits', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (visitsRes.ok) {
            visits = await visitsRes.json()
          }
        }
        
        const cityCounts: Record<string, number> = {}
        visits.forEach((v: { city: string }) => {
          cityCounts[v.city] = (cityCounts[v.city] || 0) + 1
        })
        const cities = Object.entries(cityCounts).map(([name, places]) => ({
          name,
          places,
        }))
        setUserFriends(friends)
        setVisitedCities(cities)
      } catch (error) {
        console.error('💥 Ошибка при загрузке данных:', error)
      }
    }
    if (token) fetchData()
  }, [token])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setSettingsOpen(false)
        setIsOpen(false)
        setIsLayerSelectorOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const centerMapToUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView(userLocation, 16)
      setShowFindMe(false)
    }
  }

  if (!userLocation) {
    return (
      <div className="geo-loader-screen">
        <div className="geo-loader-card">
          <div className="geo-icon">📡</div>
          <div className="geo-text">Getting geolocation...</div>
          <div className="geo-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {userLocation && <CountryBadge coords={userLocation} />}
      <div className="top-right-ui">
        <button
          className="profile-button"
          onClick={openProfile}
        >
          👤
        </button>
        <button
          className="settings-button"
          onClick={openSettings}
        >
          ⚙️
        </button>
        <div className="layer-switch-wrapper">
          <button
            onClick={openLayerSelector}
            className={`map-style-toggle ${isLayerSelectorOpen ? 'no-shadow' : ''}`}
          >
            🌐
          </button>
          {isLayerSelectorOpen && (
            <div className="map-style-popup">
              <MapLayerSelector
                layers={[
                  { id: 'standard', name: 'Standard', icon: '🗺️' },
                  { id: 'satellite', name: 'Satellite', icon: '🛰️' },
                  { id: 'relief', name: 'Relief', icon: '🏔️' },
                  { id: 'dark', name: 'Dark', icon: '🟣' },
                  { id: 'light', name: 'Light', icon: '🟡' },
                ]}
                current={selectedLayer}
                onSelect={(id) => {
                  setSelectedLayer(id)
                  setIsLayerSelectorOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          friends={userFriends}
          cities={visitedCities}
        />
      )}
      <MapContainer
        center={userLocation}
        zoom={13}
        scrollWheelZoom
        attributionControl={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        ref={(ref) => {
          if (ref && !mapRef.current) {
            mapRef.current = ref
          }
        }}
      >
        <TileLayer
          attribution=""
          url={
            selectedLayer === 'standard'
              ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              : selectedLayer === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : selectedLayer === 'relief'
                  ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
                  : selectedLayer === 'dark'
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
        />

        <Marker position={userLocation} icon={userIcon}>
          <Popup>🧍 You are here!</Popup>
        </Marker>

        {selectedEmoji && (
  <Marker
    position={userLocation}
    icon={
      new L.DivIcon({
        html: `<div style="font-size: 26px; transform: translateY(-35px); ${
          isDarkTheme 
            ? 'filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.4));' 
            : '' // ✅ Убрали тень для светлых тем
        }">${selectedEmoji}</div>`,
        className: 'emoji-overlay',
        iconSize: [0, 0],
      })
    }
    interactive={false}
  />
)}

        <Clusters points={defaultPoints} />
        <MapWatcher
          userLocation={userLocation}
          onMoveAway={() => setShowFindMe(true)}
        />
      </MapContainer>
      {!showFindMe ? (
        <>
          <button className="button vibe" onClick={() => setIsOpen(!isOpen)}>
            <span className="icon">🎭</span>
            My Vibe
          </button>
          {isOpen && (
            <VibeSelector
              onSelect={async (emoji: string) => {
                setSelectedEmoji(emoji)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('user-mood', emoji)
                }
                if (userLocation) {
                  const city = await getCityFromCoords(
                    userLocation[0],
                    userLocation[1]
                  )
                  
                  // Сохраняем визит для всех авторизованных пользователей
                  if (token) {
                    try {
                      if (token === 'nextauth-session') {
                        // Для NextAuth пользователей используем Next.js API роут
                        await fetch('/api/visits', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            lat: userLocation[0],
                            lng: userLocation[1],
                            city,
                            timestamp: new Date().toISOString(),
                            emoji,
                          }),
                        })
                        console.log('✅ NextAuth user visit saved successfully')
                      } else {
                        // Для JWT пользователей используем Express сервер
                        await fetch('http://localhost:5000/visits', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            lat: userLocation[0],
                            lng: userLocation[1],
                            city,
                            timestamp: new Date().toISOString(),
                            emoji,
                          }),
                        })
                        console.log('✅ JWT user visit saved successfully')
                      }
                    } catch (error) {
                      console.log('⚠️ Could not save visit to server:', error)
                    }
                  } else {
                    console.log('⚠️ No authentication token - visit not saved')
                  }
                }
                setIsOpen(false)
              }}
              onClose={() => setIsOpen(false)}
            />
          )}
        </>
      ) : (
        <button className="button find-me" onClick={centerMapToUser}>
          <span className="icon">📍</span>
          Find Me
        </button>
      )}
    </div>
  )
}