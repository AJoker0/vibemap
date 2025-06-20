'use client'

import { useEffect } from 'react'
import { useMapEvents, useMap } from 'react-leaflet'
import { validateCoordinates, cleanInvalidLocationData } from '@/lib/geolocationSafety'

/**
 * Enhanced user location handling component that fixes issues with:
 * 1. User marker disappearing during zoom
 * 2. Making "Find Me" button more responsive
 * 3. Preventing map issues during geolocation updates
 * 4. Fixes coordinate swapping issues
 */
const LocationMarkerFix = () => {
  const map = useMap();
  
  // When map is ready, apply fixes
  useEffect(() => {
    if (!map) return;
    
    // EMERGENCY FIX: Make sure all user location data is correct
    const validateUserLocationData = () => {
      try {
        const savedLocation = localStorage.getItem('user-last-location');
        if (savedLocation) {
          const coords = JSON.parse(savedLocation);
          
          if (!validateCoordinates(coords)) {
            console.error('❌ Invalid coordinates in localStorage, clearing');
            localStorage.removeItem('user-last-location');
            return false;
          }
          return true;
        }
        return false;
      } catch (e) {
        console.error('Error validating user location:', e);
        localStorage.removeItem('user-last-location');
        return false;
      }
    };
    
    // Force refresh coordinates if needed
    const forceRefreshCoordinates = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const freshCoords = [latitude, longitude];
            
            if (validateCoordinates(freshCoords)) {
              console.log('🔄 Force refreshed coordinates:', freshCoords);
              localStorage.setItem('user-last-location', JSON.stringify(freshCoords));
              
              // Dispatch a custom event that LeafletMap component can listen for
              const refreshEvent = new CustomEvent('location-refreshed', {
                detail: { coords: freshCoords }
              });
              window.dispatchEvent(refreshEvent);
            } else {
              console.error('❌ Received invalid coordinates during refresh:', freshCoords);
            }
          },
          (error) => console.error('Failed to refresh coordinates:', error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    };
    
    // Add fix for marker layers
    const fixMarkerLayers = () => {
      // Ensure proper z-index for map elements
      const markerPane = map.getPane('markerPane');
      const popupPane = map.getPane('popupPane');
      const tooltipPane = map.getPane('tooltipPane');
      
      if (markerPane) markerPane.style.zIndex = '600';
      if (popupPane) popupPane.style.zIndex = '700';
      if (tooltipPane) tooltipPane.style.zIndex = '650';
      
      // Monitor for marker elements and optimize them
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const markers = document.querySelectorAll('.user-location-marker');
            markers.forEach(marker => {
              // Apply hardware acceleration and ensure proper z-index
              (marker as HTMLElement).style.transform = 'translateZ(0)';
              (marker as HTMLElement).style.willChange = 'transform';
              (marker as HTMLElement).style.zIndex = '1000';
            });
          }
        });
      });
      
      // Watch the marker pane for changes
      if (markerPane) {
        observer.observe(markerPane, { childList: true, subtree: true });
      }
    };
    
    // Listen for location update events
    const handleLocationUpdated = (event: CustomEvent) => {
      if (map && event.detail && event.detail.location) {
        const location = event.detail.location;
        
        if (validateCoordinates(location)) {
          // If it was triggered by Find Me button, fly to location
          if (event.detail.fromButton) {
            console.log('✅ Flying to new location from button click:', location);
            map.flyTo(location, 15, {
              animate: true,
              duration: 1
            });
          }
        }
      }
    };
    
    // Run our fixes
    const validLocation = validateUserLocationData();
    fixMarkerLayers();
    
    // Set a timeout to force refresh coordinates if needed
    const refreshTimeout = setTimeout(() => {
      const userMarkers = document.querySelectorAll('.user-location-marker');
      if (userMarkers.length === 0 || !validLocation) {
        console.log('⚠️ No user marker found or invalid location, forcing coordinate refresh');
        forceRefreshCoordinates();
      }
    }, 2000);
    
    // Add listener for location update events
    window.addEventListener('location-updated', handleLocationUpdated as EventListener);
    window.addEventListener('location-refreshed', handleLocationUpdated as EventListener);
    
    // Clean up
    return () => {
      clearTimeout(refreshTimeout);
      window.removeEventListener('location-updated', handleLocationUpdated as EventListener);
      window.removeEventListener('location-refreshed', handleLocationUpdated as EventListener);
    };
  }, [map]);
  
  // Monitor map events to keep marker stable
  useMapEvents({
    zoomstart: () => {
      // Before zoom, ensure user marker stays on top and has hardware acceleration
      const markers = document.querySelectorAll('.user-location-marker');
      markers.forEach(marker => {
        (marker as HTMLElement).style.zIndex = '1000';
        (marker as HTMLElement).style.transform = 'translateZ(0)';
      });
    },
    zoomend: () => {
      // After zoom, ensure user marker stays on top
      setTimeout(() => {
        const markers = document.querySelectorAll('.user-location-marker');
        markers.forEach(marker => {
          (marker as HTMLElement).style.zIndex = '1000';
          (marker as HTMLElement).classList.add('high-priority-marker');
        });
      }, 100);
    },
    moveend: () => {
      // After move, ensure user marker stays on top
      setTimeout(() => {
        const markers = document.querySelectorAll('.user-location-marker');
        markers.forEach(marker => {
          (marker as HTMLElement).style.zIndex = '1000';
        });
      }, 100);
    }
  });
  
  return null;
};

export default LocationMarkerFix;
