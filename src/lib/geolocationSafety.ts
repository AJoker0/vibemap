/**
 * Safety functions to ensure geolocation is working correctly 
 * and location data is valid.
 */

/**
 * Validates that coordinates are in the correct format for Leaflet
 * [latitude, longitude] with latitude between -90 and 90, longitude between -180 and 180
 */
export const validateCoordinates = (coords: any): [number, number] | null => {
  // Check if coords is an array with two elements
  if (!Array.isArray(coords) || coords.length !== 2) {
    console.error('❌ Invalid coordinates format:', coords);
    return null;
  }
  
  const [lat, lng] = coords;
  
  // Check if both are numbers
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    console.error('❌ Coordinates must be numbers:', coords);
    return null;
  }
  
  // Check if latitude is in valid range
  if (lat < -90 || lat > 90) {
    // Try swapping to see if that fixes it
    if (lng >= -90 && lng <= 90 && lat >= -180 && lat <= 180) {
      console.warn('⚠️ Coordinates appear swapped, fixing:', [lng, lat]);
      return [lng, lat];
    }
    console.error('❌ Latitude out of range (-90 to 90):', lat);
    return null;
  }
  
  // Check if longitude is in valid range
  if (lng < -180 || lng > 180) {
    console.error('❌ Longitude out of range (-180 to 180):', lng);
    return null;
  }
  
  return [lat, lng];
};

/**
 * Cleans any invalid location data from localStorage
 */
export const cleanInvalidLocationData = () => {
  try {
    const locationData = localStorage.getItem('user-last-location');
    if (locationData) {
      const coords = JSON.parse(locationData);
      if (!validateCoordinates(coords)) {
        console.warn('🧹 Cleaning invalid location data');
        localStorage.removeItem('user-last-location');
      }
    }
  } catch (e) {
    console.error('Error cleaning location data:', e);
    localStorage.removeItem('user-last-location');
  }
};

/**
 * Ensures geolocation data is always properly oriented as [latitude, longitude]
 */
export const ensureCorrectCoordinateOrientation = () => {
  try {
    const locationData = localStorage.getItem('user-last-location');
    if (locationData) {
      const coords = JSON.parse(locationData);
      if (Array.isArray(coords) && coords.length === 2) {
        const [first, second] = coords;
        
        // If first number is outside latitude range but second is within it,
        // coordinates might be swapped
        if ((Math.abs(first) > 90 && Math.abs(second) <= 90) ||
            (Math.abs(first) > Math.abs(second) * 2 && Math.abs(second) <= 90)) {
          // Swap coordinates
          console.warn('🔄 Fixing swapped coordinates');
          localStorage.setItem('user-last-location', JSON.stringify([second, first]));
        }
      }
    }
  } catch (e) {
    console.error('Error fixing coordinate orientation:', e);
  }
};

/**
 * Forces a fresh geolocation lookup and stores the result
 */
export const forceFreshGeolocation = (): Promise<[number, number] | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        if (validateCoordinates(coords)) {
          localStorage.setItem('user-last-location', JSON.stringify(coords));
          console.log('✅ Fresh coordinates stored:', coords);
          resolve(coords);
        } else {
          console.error('❌ Got invalid coordinates from geolocation API');
          resolve(null);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Run all geolocation safety checks
 */
export const runGeolocationSafetyChecks = async () => {
  cleanInvalidLocationData();
  ensureCorrectCoordinateOrientation();
  
  // Force a new location check if needed
  const locationData = localStorage.getItem('user-last-location');
  if (!locationData) {
    await forceFreshGeolocation();
  } else {
    try {
      const coords = JSON.parse(locationData);
      if (!validateCoordinates(coords)) {
        console.warn('🔄 Invalid stored location, getting fresh location');
        await forceFreshGeolocation();
      }
    } catch (e) {
      console.error('Error parsing location data:', e);
      await forceFreshGeolocation();
    }
  }
  
  // Return whether we have valid coordinates or not
  const finalLocation = localStorage.getItem('user-last-location');
  if (finalLocation) {
    try {
      return validateCoordinates(JSON.parse(finalLocation)) !== null;
    } catch (e) {
      return false;
    }
  }
  return false;
};
