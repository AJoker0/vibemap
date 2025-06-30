'use client'

import { useMap } from 'react-leaflet'
import { validateCoordinates } from '@/lib/geolocationSafety'
import { useState, useEffect } from 'react'

interface MapControlsProps {
  userLocation: [number, number] | null
  onCenterComplete?: () => void
  showFindMe: boolean
}

/**
 * MapControls component that must be placed inside the MapContainer
 * to properly access the Leaflet map context.
 */
export default function MapControls({
  userLocation,
  onCenterComplete,
  showFindMe,
}: MapControlsProps) {
  const map = useMap() // This hook must be used inside MapContainer
  const [busy, setBusy] = useState(false)
  const centerToUser = () => {
    if (!userLocation || busy) return
    setBusy(true)

    // Try to get a fresh location from the browser
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const freshCoords: [number, number] = [
              position.coords.latitude,
              position.coords.longitude,
            ]
            if (validateCoordinates(freshCoords)) {
              console.log('📍 Got fresh coordinates:', freshCoords)
              // Store the latest coordinates
              localStorage.setItem(
                'user-last-location',
                JSON.stringify(freshCoords)
              )
              localStorage.setItem(
                'user-location-timestamp',
                Date.now().toString()
              )

              // Special check for Terranova da Sibari region
              const targetCoords = freshCoords

              // If we're in Italy specifically in Terranova da Sibari area (39.65, 16.33)
              const [lat, lng] = freshCoords
              const isNearTerranoDaSibari =
                Math.abs(lat - 39.65) < 0.5 && Math.abs(lng - 16.33) < 0.5

              if (isNearTerranoDaSibari) {
                console.log(
                  '🇮🇹 Detected Terranova da Sibari, ensuring precise coordinates'
                )
                // Use more precise coordinates if needed
              }

              // Fly to the coordinates with animation
              map.flyTo(targetCoords, 15, {
                animate: true,
                duration: 1,
              })

              // Dispatch event
              const event = new CustomEvent('location-refreshed', {
                detail: { coords: targetCoords },
              })
              window.dispatchEvent(event)

              // Release busy state and notify parent
              setTimeout(() => {
                setBusy(false)
                if (onCenterComplete) onCenterComplete()
              }, 1000)
            } else {
              // Fall back to stored location
              fallbackToStoredLocation()
            }
          },
          (error) => {
            console.error('❌ Error getting current position:', error)
            // Fall back to stored location
            fallbackToStoredLocation()
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        )
      } catch (e) {
        console.error('❌ Exception in geolocation:', e)
        fallbackToStoredLocation()
      }
    } else {
      // No geolocation API, use the stored location
      fallbackToStoredLocation()
    }
  }

  // Helper function to use the stored location when fresh geolocation fails
  const fallbackToStoredLocation = () => {
    // First check if userLocation exists and validate the stored coordinates
    if (!userLocation || !validateCoordinates(userLocation)) {
      console.log('❌ No valid user location available for fallback')
      setBusy(false)
      return
    }

    const validCoords = userLocation

    // Special check for Terranova da Sibari region
    const targetCoords = validCoords

    // If we're in Italy specifically in Terranova da Sibari area (39.65, 16.33)
    const [lat, lng] = validCoords
    const isNearTerranoDaSibari =
      Math.abs(lat - 39.65) < 0.5 && Math.abs(lng - 16.33) < 0.5

    if (isNearTerranoDaSibari) {
      console.log(
        '🇮🇹 Detected Terranova da Sibari, ensuring precise coordinates'
      )
      // Use more precise coordinates if needed
    }

    // Use setView instead of flyTo for better performance
    map.setView(targetCoords, 15, {
      animate: false, // Disable animation for better performance
      duration: 0,
      noMoveStart: true,
    })

    // Dispatch event to ensure all components know about coordinate update
    const event = new CustomEvent('location-refreshed', {
      detail: { coords: targetCoords, isFallback: true },
    })
    window.dispatchEvent(event)

    // Show notification to user
    const mapContainer = document.querySelector('.leaflet-container')
    if (mapContainer) {
      const notification = document.createElement('div')
      notification.className = 'geo-notification'
      notification.textContent =
        'Using saved location. Could not get your current position.'
      mapContainer.appendChild(notification)
      setTimeout(() => notification.remove(), 3000)
    }

    // Release busy state and notify parent
    setTimeout(() => {
      setBusy(false)
      if (onCenterComplete) onCenterComplete()
    }, 1000)
  }

  // Add keyboard shortcut (F key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f') centerToUser()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [userLocation])

  // Only render the button when showFindMe is true
  if (!showFindMe) return null

  return (
    <div className="map-find-me-control">
      <button
        className={`button find-me ${busy ? 'busy' : ''}`}
        onClick={centerToUser}
        disabled={busy || !userLocation}
      >
        <span className="icon">{busy ? '⏳' : '📍'}</span>
        Find Me
      </button>
    </div>
  )
}
