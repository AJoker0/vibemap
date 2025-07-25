import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Получаем все usernames из всех коллекций
    const nextAuthUsers = await db.collection('users').find({}, { projection: { username: 1, email: 1, name: 1 } }).toArray()
    const jwtUsers = await db.collection('profiles').find({}, { projection: { username: 1, userId: 1, email: 1 } }).toArray()

    return NextResponse.json({
      nextAuthUsers: nextAuthUsers.length,
      jwtUsers: jwtUsers.length,
      nextAuthUsernames: nextAuthUsers.map(u => ({ username: u.username, email: u.email, name: u.name })),
      jwtUsernames: jwtUsers.map(u => ({ username: u.username, userId: u.userId, email: u.email })),
      allUsernames: [...nextAuthUsers.map(u => u.username), ...jwtUsers.map(u => u.username)].filter(Boolean)
    })
  } catch (error) {
    console.error('❌ Error in debug route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
