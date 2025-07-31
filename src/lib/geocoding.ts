// src/lib/geocoding.ts - Утилиты для работы с геолокацией

// Функция для получения страны по координатам
export async function getCountryFromCoords(lat: number, lng: number): Promise<string> {
  try {
    // Используем Nominatim API (бесплатный сервис OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'VibeMap/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    // Извлекаем название страны
    const country = data.address?.country || data.display_name?.split(',').pop()?.trim() || 'Unknown'
    
    console.log(`🌍 Geocoding: ${lat}, ${lng} -> ${country}`)
    return country
  } catch (error) {
    console.error('❌ Geocoding error:', error)
    
    // Fallback: простое определение по координатам
    return getCountryByCoordinates(lat, lng)
  }
}

// Fallback функция для определения страны по координатам (примерно)
function getCountryByCoordinates(lat: number, lng: number): string {
  // Примерные границы некоторых стран
  const countryBounds = [
    { name: 'Bulgaria', minLat: 41.2, maxLat: 44.2, minLng: 22.4, maxLng: 28.6 },
    { name: 'France', minLat: 42.3, maxLat: 51.1, minLng: -5.1, maxLng: 9.6 },
    { name: 'Italy', minLat: 35.5, maxLat: 47.1, minLng: 6.6, maxLng: 18.5 },
    { name: 'Germany', minLat: 47.3, maxLat: 55.1, minLng: 5.9, maxLng: 15.0 },
    { name: 'Spain', minLat: 27.6, maxLat: 43.8, minLng: -18.2, maxLng: 4.3 },
    { name: 'United Kingdom', minLat: 49.9, maxLat: 60.8, minLng: -8.6, maxLng: 1.8 },
    { name: 'USA', minLat: 18.9, maxLat: 71.4, minLng: -179.1, maxLng: -66.9 },
    { name: 'Canada', minLat: 41.7, maxLat: 83.1, minLng: -141.0, maxLng: -52.6 }
  ]
  
  for (const country of countryBounds) {
    if (lat >= country.minLat && lat <= country.maxLat && 
        lng >= country.minLng && lng <= country.maxLng) {
      return country.name
    }
  }
  
  return 'Unknown'
}

// Функция для получения города по координатам (уже существует)
export async function getCityFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'VibeMap/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }
    
    const data = await response.json()
    
    // Извлекаем название города
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.municipality ||
                 'Unknown City'
    
    console.log(`🏙️ Geocoding: ${lat}, ${lng} -> ${city}`)
    return city
  } catch (error) {
    console.error('❌ City geocoding error:', error)
    return 'Unknown City'
  }
}
