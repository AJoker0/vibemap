'use client'

import { useEffect, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import * as L from 'leaflet'
import { validateCoordinates } from '@/lib/geolocationSafety'

// This component ensures correct display of the user location marker
const UserLocationMarker = ({ 
  userLocation,
  userIcon
}: {
  userLocation: [number, number] | null,
  userIcon: L.Icon
}) => {
  const [verifiedLocation, setVerifiedLocation] = useState<[number, number] | null>(null)
  
  useEffect(() => {
    // Verify/fix the coordinates
    const processCoordinates = (coords: [number, number] | null): [number, number] | null => {
      // First use the utility function for standard validation
      const validated = validateCoordinates(coords);
      if (validated) {
        console.log('✅ Using validated coordinates:', validated);
        return validated;
      }
      
      // Additional recovery attempt if standard validation fails
      if (Array.isArray(coords) && coords.length === 2) {
        const [first, second] = coords;
        
        // Check if coordinates look swapped
        if (typeof first === 'number' && typeof second === 'number') {
          // If first is likely a longitude (-180 to 180, often larger numbers)
          // and second is likely a latitude (-90 to 90, often smaller numbers)
          if ((Math.abs(first) > 90 && Math.abs(second) <= 90)) {
            const swapped: [number, number] = [second, first];
            console.log('🔄 Trying swapped coordinates:', swapped);
            
            // Validate the swapped coordinates
            return validateCoordinates(swapped);
          }
        }
      }
      
      return null;
    };
    
    // Always verify incoming coordinates
    const verified = processCoordinates(userLocation);
    setVerifiedLocation(verified);
    
    // Listen for location refresh events
    const handleLocationRefreshed = (event: CustomEvent) => {
      if (event.detail && event.detail.coords) {
        const newCoords = event.detail.coords;
        const verified = processCoordinates(newCoords);
        if (verified) {
          console.log('📍 Setting updated location from event:', verified);
          setVerifiedLocation(verified);
        }
      }
    };
    
    window.addEventListener('location-refreshed', handleLocationRefreshed as EventListener);
    window.addEventListener('location-updated', handleLocationRefreshed as EventListener);
    
    return () => {
      window.removeEventListener('location-refreshed', handleLocationRefreshed as EventListener);
      window.removeEventListener('location-updated', handleLocationRefreshed as EventListener);
    };
  }, [userLocation]);
  
  // Only render marker if we have verified coordinates
  if (!verifiedLocation) return null;
  
  return (
    <Marker position={verifiedLocation} icon={userIcon}>
      <Popup>
        <div className="location-popup">
          <span role="img" aria-label="Location">📍</span> You are here!
          <div className="location-coords">
            {verifiedLocation[0].toFixed(4)}, {verifiedLocation[1].toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;
