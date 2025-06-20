'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// This component handles CORS issues with map tiles
export function TileProxyHandler() {
  const map = useMap()

  useEffect(() => {
    // Override the Leaflet TileLayer's getTileUrl method
    const originalTileLayer = L.TileLayer.prototype as any
    const originalGetTileUrl = originalTileLayer.getTileUrl
    
    // Create a proxy function to handle problematic tile URLs
    originalTileLayer.getTileUrl = function(coords: any) {
      let url = originalGetTileUrl.call(this, coords)
      
      // If this is an opentopomap URL that's causing CORS issues, use a proxy
      if (url.includes('opentopomap.org')) {
        // Replace with a CORS-friendly alternative
        // Option 1: Use OSM with a terrain style as fallback
        return `https://tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`
        
        // Option 2: Use a proxy service (if you have one set up)
        // return `/api/tile-proxy?url=${encodeURIComponent(url)}`
      }
      
      return url
    }
    
    return () => {
      // Restore original method on cleanup
      originalTileLayer.getTileUrl = originalGetTileUrl
    }
  }, [map])
  
  return null
}
