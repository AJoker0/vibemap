/**
 * Geolocation safety utilities for coordinate validation
 */

/**
 * Validates if coordinates are within valid ranges
 * @param coordinates - Array of [latitude, longitude]
 * @returns true if coordinates are valid, false otherwise
 */
export function validateCoordinates(coordinates: [number, number]): boolean {
  if (!coordinates || coordinates.length !== 2) {
    return false
  }

  const [lat, lng] = coordinates

  // Check if values are numbers
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false
  }

  // Check if values are finite (not NaN, Infinity, etc.)
  if (!isFinite(lat) || !isFinite(lng)) {
    return false
  }

  // Validate latitude range (-90 to 90)
  if (lat < -90 || lat > 90) {
    return false
  }

  // Validate longitude range (-180 to 180)
  if (lng < -180 || lng > 180) {
    return false
  }

  return true
}

/**
 * Validates if a coordinate is within acceptable bounds for the app
 * @param coordinates - Array of [latitude, longitude]
 * @returns true if coordinates are within acceptable bounds
 */
export function isValidLocation(coordinates: [number, number]): boolean {
  if (!validateCoordinates(coordinates)) {
    return false
  }

  // Additional app-specific validation can be added here
  // For now, just use the basic coordinate validation
  return true
}
