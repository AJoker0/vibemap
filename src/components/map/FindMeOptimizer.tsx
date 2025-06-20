'use client'

import { useEffect } from 'react'
import { validateCoordinates, cleanInvalidLocationData, runGeolocationSafetyChecks } from '@/lib/geolocationSafety'

/**
 * This component optimizes the "Find Me" button performance
 * by pre-warming the geolocation API when the component loads
 * and fixes coordinate issues with user location
 */
const FindMeOptimizer = () => {
  useEffect(() => {
    // EMERGENCY FIX: Delete potentially corrupted location data
    const clearBadLocationData = () => {
      // Use the utility function from geolocationSafety
      cleanInvalidLocationData();
      
      // Also clear any tile caches that might be causing issues
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('leaflet') || key.includes('tile') || key.includes('map'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 Cleared ${keysToRemove.length} map cache items`);
    };
    
    // Force reload user location with correct format
    const forceGetCurrentLocation = () => {
      if (!navigator.geolocation) return;
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const correctLocation = [position.coords.latitude, position.coords.longitude];
          console.log('📍 New verified location obtained:', correctLocation);
          
          // Validate coordinates before storing
          if (validateCoordinates(correctLocation)) {
            // Store as string in the format expected by the map
            localStorage.setItem('user-last-location', JSON.stringify(correctLocation));
            
            // Force refresh if we're on the map screen (optional)
            const mapElement = document.querySelector('.leaflet-container');
            if (mapElement) {
              console.log('🔄 Detected map is loaded, applying new coordinates');
              // Dispatch a custom event that the map can listen to
              const event = new CustomEvent('location-updated', { 
                detail: { location: correctLocation } 
              });
              window.dispatchEvent(event);
            }
          } else {
            console.error('❌ Got invalid coordinates from browser:', correctLocation);
            localStorage.removeItem('user-last-location');
          }
        },
        (error) => {
          console.error('❌ Could not get fresh location:', error);
        },
        {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
      );
    };
    
    // Run emergency fixes
    clearBadLocationData();
    forceGetCurrentLocation();
    
    // Run comprehensive safety checks
    runGeolocationSafetyChecks();

    // Pre-warm geolocation API with correct handling
    const preWarmGeolocation = () => {
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        };

        // Request position to warm up the API
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ Geolocation API ready');
            // Ensure coordinates are stored correctly
            const { latitude, longitude } = position.coords;
            
            // Validate before storing
            if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
              // Store location with correct order [latitude, longitude]
              localStorage.setItem('user-last-location', JSON.stringify([latitude, longitude]));
            } else {
              console.error('❌ Received invalid coordinates from browser:', [latitude, longitude]);
              localStorage.removeItem('user-last-location');
            }
          },
          (error) => console.log('⚠️ Geolocation API warming failed:', error),
          options
        );
      }
    };
    
    // Additional optimization - watch for button and optimize it
    const optimizeFindMeButton = () => {
      // Find the Find Me button
      const findMeButton = document.querySelector('.button.find-me');
      if (findMeButton) {
        // Add extra class for optimized styling
        findMeButton.classList.add('optimized');
        
        // Replace click handler with optimized version
        findMeButton.addEventListener('click', (e) => {
          // Add finding class immediately for visual feedback
          findMeButton.classList.add('finding');
          
          // Change text immediately for better UX
          findMeButton.innerHTML = '<span class="icon">📍</span> Finding...';
          
          // Force new location lookup on click
          navigator.geolocation?.getCurrentPosition(
            (position) => {
              const correctLocation = [position.coords.latitude, position.coords.longitude];
              console.log('📍 Button click: New location obtained:', correctLocation);
              
              // Validate before storing
              if (validateCoordinates(correctLocation)) {
                localStorage.setItem('user-last-location', JSON.stringify(correctLocation));
                
                // Dispatch event to update map immediately
                const event = new CustomEvent('location-updated', { 
                  detail: { location: correctLocation, fromButton: true } 
                });
                window.dispatchEvent(event);
              } else {
                console.error('❌ Got invalid coordinates from button click:', correctLocation);
              }
            },
            (error) => {
              console.error('❌ Geolocation error on button click:', error);
              // Reset button state after error
              setTimeout(() => {
                findMeButton.classList.remove('finding');
                findMeButton.innerHTML = '<span class="icon">📍</span> Find Me';
              }, 1000);
            },
            {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}
          );
        }, { passive: true }); // Passive event for better performance
      }
    };
    
    // Execute our optimizations
    preWarmGeolocation();
    
    // Wait a bit for UI to load before optimizing button
    const timer = setTimeout(() => {
      optimizeFindMeButton();
    }, 1000);
    
    // Periodically ensure button is optimized (in case of DOM updates)
    const interval = setInterval(optimizeFindMeButton, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);
  
  return null;
};

export default FindMeOptimizer;
