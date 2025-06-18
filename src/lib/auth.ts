//src/lib/auth.ts

const BASE_URL = 'http://localhost:5000'

async function safeFetch<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`❌ Request failed: ${res.status} ${res.statusText} - ${text}`)
  }

  return res.json() as Promise<T>
}

export async function register(email: string, password: string): Promise<string> {
  const data = await safeFetch<{ token: string }>(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return data.token
}

export async function loginUser(email: string, password: string): Promise<string> {
  const data = await safeFetch<{ token: string }>(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return data.token
}
