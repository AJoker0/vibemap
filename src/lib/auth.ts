// src/lib/auth.ts

const BASE_URL = 'http://localhost:5000'

export async function register(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { error: errorData.error || '❌ Registration failed' };
  }

  const data = await res.json();
  return { token: data.token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { error: errorData.error || '❌ Login failed' };
  }

  const data = await res.json();
  return { token: data.token };
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
