'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import * as L from 'leaflet'

const MapTileProxyHandler = () => {
  const map = useMap()
  const tileLoadAttempts = useRef<Record<string, number>>({})
  const lastFixTime = useRef<number>(0)
  const [isPerformanceMode, setIsPerformanceMode] = useState(false)
  const markerLayer = useRef<any>(null)
  
  // Debounce function to limit how often functions are called
  const debounce = useCallback((fn: Function, delay: number) => {
    let timer: NodeJS.Timeout | null = null;
    return function(...args: any[]) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, delay);
    }
  }, [])
  
  useEffect(() => {
    if (!map) return

    // Detect device performance
    const checkPerformance = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      setIsPerformanceMode(isMobile || isLowEnd);
    };
    
    checkPerformance();

    // Optimize geolocation handling for faster "Find Me" button response
    const optimizeGeolocation = () => {
      // Pre-warm geolocation API
      if (navigator.geolocation) {
        const options = { 
          enableHighAccuracy: true,
          timeout: 5000, // Reduced timeout for faster response
          maximumAge: 20000 // Cache location for 20 seconds to improve response time
        };
        
        navigator.geolocation.getCurrentPosition(
          () => {}, // Empty success callback - just to prime the API
          () => {}, // Empty error callback
          options
        );
      }
    };
    
    // Call once on mount
    optimizeGeolocation();

    // Set up smooth panning and zooming with performance optimizations
    const enableSmoothEffects = () => {
      if (map.options) {
        if ('keyboard' in map.options) map.options.keyboard = true;
        
        // Lower animation quality on low-end devices
        if (isPerformanceMode) {
          if ('zoomAnimation' in map.options) map.options.zoomAnimation = false;
          if ('fadeAnimation' in map.options) map.options.fadeAnimation = false;
          if ('markerZoomAnimation' in map.options) map.options.markerZoomAnimation = false;
          
          // Reduce rendering complexity
          map.options.preferCanvas = true;
          map.options.renderer = new L.Canvas();
        } else {
          if ('zoomAnimation' in map.options) map.options.zoomAnimation = true;
          if ('fadeAnimation' in map.options) map.options.fadeAnimation = true;
          if ('markerZoomAnimation' in map.options) map.options.markerZoomAnimation = true;
        }
      }

      // Fix for the "Find Me" button and ensure smooth zooming
      if (!isPerformanceMode) {
        map.options.inertiaDeceleration = 2000;
        map.options.inertiaMaxSpeed = 1500;
        map.options.zoomSnap = 0.5;
        map.options.zoomDelta = 0.5;
        map.options.wheelDebounceTime = 80;
        
        // Important: fix for user marker during zoom
        map.options.markerZoomAnimation = true;
        if ('tap' in map.options) (map.options as any).tap = true;
      }

      // Prevent map from being panned outside world bounds, but don't use maxBounds here
      // as it can cause stuttering - use worldCopyJump instead
      map.setMinZoom(2);
    }
    
    enableSmoothEffects();

    // Fix for user location marker during zooming
    const stabilizeUserMarker = () => {
      // Find user marker in the DOM
      const userMarkers = document.querySelectorAll('.user-location-marker');
      if (userMarkers.length > 0) {
        userMarkers.forEach(marker => {
          // Apply hardware acceleration to the marker
          (marker as HTMLElement).style.transform = `${(marker as HTMLElement).style.transform} translateZ(0)`;
          (marker as HTMLElement).style.willChange = 'transform';
          
          // Add a class to ensure it renders on top
          marker.classList.add('high-priority-marker');
        });
      }
    };

    // Fix for tile loading issues - with debouncing to prevent excessive calls
    const fixTileLayers = debounce(() => {
      const now = Date.now();
      // Only apply fixes at most once every 500ms to avoid performance issues
      if (now - lastFixTime.current < 500) return;
      lastFixTime.current = now;
      
      // Only apply z-index fixes, avoid manipulating tiles directly
      const panes = {
        'leaflet-tile-pane': 100,
        'leaflet-overlay-pane': 400,
        'leaflet-shadow-pane': 500,
        'leaflet-marker-pane': 600,
        'leaflet-tooltip-pane': 650,
        'leaflet-popup-pane': 700,
      };
      
      Object.entries(panes).forEach(([className, zIndex]) => {
        const pane = document.querySelector(`.${className}`);
        if (pane) (pane as HTMLElement).style.zIndex = String(zIndex);
      });
      
      // Call the function to stabilize the user marker
      stabilizeUserMarker();
    }, 300);

    // Improved tile error handler - more efficient
    const handleTileError = (evt: any) => {
      const tile = evt.tile;
      const url = evt.url;
      
      // Skip processing for tiles that aren't visible
      if (!tile.parentNode) return;
      
      // Track retry attempts to avoid infinite loops
      tileLoadAttempts.current[url] = (tileLoadAttempts.current[url] || 0) + 1;
      
      // Only retry a limited number of times
      if (tileLoadAttempts.current[url] > 2) {
        // After multiple failures, use a placeholder
        tile.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1px transparent image
        return;
      }
      
      // Make tile visible with a temporary color - but don't force layout recalculation
      if (tile) {
        tile.style.visibility = 'visible';
        tile.style.backgroundColor = '#f2f2f2';
        
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          // Try alternative sources based on the current URL
          if (url.includes('openstreetmap.org')) {
            const subdomain = String.fromCharCode(97 + (tileLoadAttempts.current[url] % 3)); // a, b, c
            tile.src = url.replace(/[a-c]\.tile\.openstreetmap\.org/, `${subdomain}.tile.openstreetmap.org`);
          } else if (url.includes('cartocdn.com')) {
            const subdomain = String.fromCharCode(97 + (tileLoadAttempts.current[url] % 3)); // a, b, c
            tile.src = url.replace(/[a-c]\.basemaps/, `${subdomain}.basemaps`);
          } else {
            // Generic retry
            tile.src = url;
          }
        });
      }
    };

    // Fix for user location marker disappearing during zoom
    const handleZoomStart = () => {
      stabilizeUserMarker();
    };

    const handleZoomEnd = () => {
      // Reapply marker position after zoom animation completes
      setTimeout(stabilizeUserMarker, 50);
      setTimeout(stabilizeUserMarker, 300);  // Second call to ensure it's fixed after animations
    };

    // Handle clicks on the map for better touch device responsiveness
    const handleMapClick = () => {
      // If using touch device, make sure markers respond quickly
      if ('ontouchstart' in window) {
        stabilizeUserMarker();
      }
    };

    // Listen for location-updated events
    const handleLocationUpdated = () => {
      // After location update, ensure map tiles are properly loaded
      const centerTile = document.querySelector('.leaflet-tile-loaded');
      if (!centerTile) {
        // If no loaded tiles, try to force reload them
        map.invalidateSize();
      }
      
      // Make sure user marker is visible
      stabilizeUserMarker();
    };

    // Apply fixes when map loads - but limit event registrations
    map.once('load', fixTileLayers);
    
    // Register events specifically for fixing user marker during zoom
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', fixTileLayers);
    map.on('click', handleMapClick);
    
    // Listen for tile errors
    map.on('tileerror', handleTileError);
    
    // Custom event listeners
    window.addEventListener('location-updated', handleLocationUpdated);
    window.addEventListener('location-refreshed', handleLocationUpdated);
    
    // Cleanup on unmount
    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', fixTileLayers);
      map.off('click', handleMapClick);
      map.off('tileerror', handleTileError);
      
      window.removeEventListener('location-updated', handleLocationUpdated);
      window.removeEventListener('location-refreshed', handleLocationUpdated);
    };
  }, [map, debounce, isPerformanceMode]);

  return null;
};

export default MapTileProxyHandler;
