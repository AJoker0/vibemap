//src/lib/auth.ts

const BASE_URL = 'http://localhost:5000';

export async function register(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // 🔥 OK
  });
  if (!res.ok) throw new Error('❌ Register failed');
  const data = await res.json();
  return data.token;
}

export async function loginUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // 🔥 OK
  });
  if (!res.ok) throw new Error('❌ Login failed');
  const data = await res.json();
  return data.token;
}
