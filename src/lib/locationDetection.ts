/**
 * Utilities for detecting specific regions and locations
 */

/**
 * Check if coordinates are in Italy
 */
export function isItalyRegion(coords: [number, number]): boolean {
  const [lat, lng] = coords

  // Italy is roughly between latitude 36°-47° and longitude 6°-19°
  return lat >= 36 && lat <= 47 && lng >= 6 && lng <= 19
}

/**
 * Check if coordinates are in Terranova da Sibari region
 */
export function isTerranoDaSibariRegion(coords: [number, number]): boolean {
  const [lat, lng] = coords

  // Terranova da Sibari is around latitude 39.65° and longitude 16.33°
  return Math.abs(lat - 39.65) < 0.5 && Math.abs(lng - 16.33) < 0.5
}

/**
 * Apply region-specific classes to map elements for enhanced visibility
 */
export function applyRegionSpecificClasses(coords: [number, number]): void {
  const mapElement = document.querySelector('.leaflet-container')
  if (!mapElement) return

  // Reset existing classes
  mapElement.classList.remove('italy-region', 'terranova-region')

  // Apply specific region classes
  if (isItalyRegion(coords)) {
    mapElement.classList.add('italy-region')

    if (isTerranoDaSibariRegion(coords)) {
      mapElement.classList.add('terranova-region')
      console.log(
        '🇮🇹 Terranova da Sibari region detected, applying special marker styling'
      )
    }
  }
}

/**
 * Fix coordinates specifically for the Terranova da Sibari region
 */
export function fixTerranoDaSibariCoordinates(
  coords: [number, number]
): [number, number] {
  const [lat, lng] = coords

  // If we detect we're in Terranova da Sibari region but coordinates look reversed
  if (lng > 36 && lng < 43 && lat > 10 && lat < 20) {
    console.log('🇮🇹 Terranova da Sibari coordinates appear swapped, fixing')
    return [lng, lat] // Swap them
  }

  // If coordinates appear correct for this region
  if (isTerranoDaSibariRegion(coords)) {
    return coords
  }

  // Fallback: If we think we're in Italy but coordinates need fixing
  if (lat > 6 && lat < 19 && lng > 36 && lng < 47) {
    console.log('🇮🇹 Italy coordinates appear swapped, fixing')
    return [lng, lat] // Swap lat/lng
  }

  return coords
}
