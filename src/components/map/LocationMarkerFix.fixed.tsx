'use client'

import { useEffect } from 'react'
import { useMapEvents, useMap } from 'react-leaflet'

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
          
          // If coordinates are not an array with two numeric elements, clear it
          if (!Array.isArray(coords) || coords.length !== 2 || 
              typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
            console.error('❌ Invalid coordinates in localStorage, clearing');
            localStorage.removeItem('user-last-location');
          }
          
          // If latitude is outside valid range (-90 to 90), fix it
          if (Math.abs(coords[0]) > 90) {
            console.error('❌ Invalid latitude in localStorage, clearing');
            localStorage.removeItem('user-last-location');
          }
          
          // If longitude is outside valid range (-180 to 180), fix it
          if (Math.abs(coords[1]) > 180) {
            console.error('❌ Invalid longitude in localStorage, clearing');
            localStorage.removeItem('user-last-location');
          }
        }
      } catch (e) {
        console.error('Error validating user location:', e);
        localStorage.removeItem('user-last-location');
      }
    };
    
    // Force refresh coordinates if needed
    const forceRefreshCoordinates = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const freshCoords = [latitude, longitude];
            console.log('🔄 Force refreshed coordinates:', freshCoords);
            localStorage.setItem('user-last-location', JSON.stringify(freshCoords));
            
            // Dispatch a custom event that LeafletMap component can listen for
            const refreshEvent = new CustomEvent('location-refreshed', {
              detail: { coords: freshCoords }
            });
            window.dispatchEvent(refreshEvent);
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
    
    // Run our fixes
    validateUserLocationData();
    fixMarkerLayers();
    
    // Set a timeout to force refresh coordinates if needed
    const refreshTimeout = setTimeout(() => {
      const userMarkers = document.querySelectorAll('.user-location-marker');
      if (userMarkers.length === 0) {
        console.log('⚠️ No user marker found, forcing coordinate refresh');
        forceRefreshCoordinates();
      }
    }, 2000);
    
    // Clean up
    return () => {
      clearTimeout(refreshTimeout);
    };
  }, [map]);
  
  // Monitor map events to keep marker stable
  useMapEvents({
    zoomend: () => {
      // After zoom, ensure user marker stays on top
      setTimeout(() => {
        const markers = document.querySelectorAll('.user-location-marker');
        markers.forEach(marker => {
          (marker as HTMLElement).style.zIndex = '1000';
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
