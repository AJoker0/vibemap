// src/lib/auth.ts

const BASE_URL = 'http://localhost:5000'

export async function register(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {
  return requestAuth('/register', email, password, 'Registration failed')
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {
  return requestAuth('/login', email, password, 'Login failed')
}

async function requestAuth(
  route: string,
  email: string,
  password: string,
  fallback: string
): Promise<{ token?: string; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) return { error: data.error || fallback }
    return { token: data.token }
  } catch {
    return { error: 'The map signal is offline. Start the API and try again.' }
  }
}

export async function loginWithGoogle(id_token: string): Promise<{ token?: string; error?: string }> {
  const res = await fetch('http://localhost:5000/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_token }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { error: errorData.error || '❌ Google login failed' };
  }

  const data = await res.json();
  return { token: data.token };
}
