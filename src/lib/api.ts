const BASE_URL = 'http://localhost:5000'

// ✅ Универсальный fetch с токеном
export async function safeFetchJSON<T = any>(
  url: string,
  token?: string | null
): Promise<T> {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    throw new Error(
      `❌ Request failed: ${url} → ${res.status} ${res.statusText}`
    )
  }

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    throw new Error(
      `❌ Failed to parse JSON from ${url}\nRaw response:\n${text}`
    )
  }
}

export type ProfileUpdate = {
  name: string
  avatar: string
  birthday?: string
  username?: string
  notifications?: boolean
}

// ✅ Получить профиль (с токеном)
export async function getProfile(token: string | null) {
  if (!token) throw new Error('⚠️ No token — user not logged in')

  const res = await fetch('http://localhost:5000/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Profile fetch failed')
  return res.json()
}

export async function getFriends(token: string | null) {
  if (!token) throw new Error('⚠️ No token — user not logged in')

  const res = await fetch('http://localhost:5000/friends', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Friends fetch failed')
  return res.json()
}

// ✅ Обновить профиль
export async function updateProfile(data: ProfileUpdate, token: string) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(
      `❌ Failed to update profile: ${res.status} ${res.statusText}\n${text}`
    )
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON from server')
  }
}

// ✅ Проверить занятость username
export async function checkUsername(username: string, token: string) {
  const res = await fetch(`${BASE_URL}/check-username?username=${username}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    throw new Error(`❌ Username check failed: ${res.status}`)
  }

  return res.json()
}

// ✅ Получить город по координатам
export async function getCityFromCoords(lat: number, lng: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  )
  const data = await response.json()

  return (
    data.address.city ||
    data.address.town ||
    data.address.village ||
    data.address.state ||
    'Unknown'
  )
}
