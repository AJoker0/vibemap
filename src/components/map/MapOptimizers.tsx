'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// This component handles tile loading optimization
export function MapTileProxyHandler() {
  const map = useMap()

  useEffect(() => {
    // Set up tile loading queue management
    let tileQueue: string[] = []
    const maxConcurrentTiles = 6 // Limit concurrent requests for smoother loading
    let activeTileLoads = 0

    // Override the Leaflet TileLayer's _tileOnLoad method
    const originalPrototype = (L.TileLayer.prototype as any)
    const originalCreateTile = originalPrototype.createTile

    // Create a tile loading queue
    originalPrototype.createTile = function (coords: any, done: Function) {
      const key = `${coords.x}:${coords.y}:${coords.z}`
      
      // Process queue for smoother loading
      const processTileQueue = () => {
        if (tileQueue.length > 0 && activeTileLoads < maxConcurrentTiles) {
          const nextTile = tileQueue.shift()
          if (nextTile) {
            activeTileLoads++
            // Allow next tile to load
          }
        }
      }

      // If we're already loading too many tiles, queue this one
      if (activeTileLoads >= maxConcurrentTiles) {
        tileQueue.push(key)
        
        return originalCreateTile.call(this, coords, (err: Error, tile: any) => {
          activeTileLoads--
          processTileQueue()
          done(err, tile)
        })
      }
      
      // Otherwise load immediately
      activeTileLoads++
      return originalCreateTile.call(this, coords, (err: Error, tile: any) => {
        activeTileLoads--
        processTileQueue()
        done(err, tile)
      })
    }

    // Clean up tile cache occasionally to prevent memory issues
    const cleanupTileCache = () => {
      // Check if browser is low on memory (indirect indicators)
      const performance = window.performance as any
      if (performance && performance.memory && performance.memory.usedJSHeapSize > 
          performance.memory.jsHeapSizeLimit * 0.7) {
        // Clear tile cache when memory pressure is high
        L.DomUtil.removeClass(document.body, 'leaflet-tile-loaded')
        
        // Force garbage collection hint
        tileQueue = []
        
        console.log('📊 Cleared tile cache due to memory pressure')
      }
    }
    
    const memoryInterval = setInterval(cleanupTileCache, 60000) // Check every minute
    
    return () => {
      clearInterval(memoryInterval)
    }
  }, [map])

  return null
}

// This component fixes marker position during animations
export function LocationMarkerFix() {
  const map = useMap()
  
  useEffect(() => {
    // Fix marker rendering during animations
    const fixMarkerRendering = () => {
      // Find all user location markers
      const markers = document.querySelectorAll('.user-location-marker') as NodeListOf<HTMLElement>
      
      markers.forEach(marker => {
        // Apply hardware acceleration
        marker.style.transform = 'translate3d(0,0,0)'
        marker.style.backfaceVisibility = 'hidden'
        marker.style.willChange = 'transform'
        
        // Prevent flickering during animations
        marker.style.transformStyle = 'preserve-3d'
        
        // Force higher z-index to keep marker on top
        marker.style.zIndex = '1000'
        
        // Add important flag to ensure styles are applied
        marker.setAttribute('style', marker.getAttribute('style') + ' !important')
        
        // Fix position during zoom
        if (marker.parentElement) {
          marker.parentElement.style.transform = 'none'
          marker.parentElement.style.transformOrigin = 'center'
          marker.parentElement.style.zIndex = '1000'
        }
      })
    }
    
    // Apply immediately and whenever the map moves or zooms
    fixMarkerRendering()
    
    // Use both start and end events to ensure marker stays fixed
    const events = ['move', 'zoom', 'movestart', 'moveend', 'zoomstart', 'zoomend', 'viewreset']
    
    events.forEach(event => {
      map.on(event, fixMarkerRendering)
    })
    
    // Apply fix on window resize too
    window.addEventListener('resize', fixMarkerRendering)
    
    // Run a continuous fix for a short period after map interactions
    let fixInterval: number | null = null
    
    const startContinuousFix = () => {
      if (fixInterval) clearInterval(fixInterval)
      
      // Apply fix multiple times over 2 seconds after interaction
      fixInterval = window.setInterval(() => {
        fixMarkerRendering()
      }, 100) as unknown as number
      
      // Stop after 2 seconds
      setTimeout(() => {
        if (fixInterval) {
          clearInterval(fixInterval)
          fixInterval = null
        }
      }, 2000)
    }
    
    events.forEach(event => {
      map.on(event, startContinuousFix)
    })
    
    return () => {
      events.forEach(event => {
        map.off(event, fixMarkerRendering)
        map.off(event, startContinuousFix)
      })
      
      window.removeEventListener('resize', fixMarkerRendering)
      
      if (fixInterval) clearInterval(fixInterval)
    }
  }, [map])
  
  return null
}

// This component optimizes "Find Me" button behavior
export function FindMeOptimizer() {
  useEffect(() => {
    // Optimize animations for Find Me button
    const optimizeButton = () => {
      const button = document.querySelector('.button.find-me') as HTMLElement
      if (button) {
        button.style.transform = 'translate3d(0,0,0)'
        button.style.willChange = 'transform, opacity'
        button.style.transition = 'transform 0.2s ease-out, opacity 0.3s ease-out'
      }
    }
    
    optimizeButton()
    
    // Re-apply optimization when button gets added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          optimizeButton()
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => observer.disconnect()
  }, [])
  
  return null
}
