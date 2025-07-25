import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // 🎯 Проверяем username во ВСЕХ коллекциях пользователей
    const checks = await Promise.all([
      // Проверяем в коллекции NextAuth пользователей (Google OAuth)
      db.collection('users').findOne({ username }),
      // Проверяем в коллекции JWT пользователей (Email/Password) - они в 'profiles'
      db.collection('profiles').findOne({ username }).catch(() => null)
    ])

    const isTaken = checks.some(user => user !== null)

    console.log('🔍 Username check:', { username, isTaken, foundIn: checks.map((user, i) => user ? (i === 0 ? 'users' : 'profiles') : null).filter(Boolean) })

    return NextResponse.json({ 
      taken: isTaken,
      available: !isTaken 
    })
  } catch (error) {
    console.error('❌ Error checking username:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // 🎯 Проверяем username во ВСЕХ коллекциях пользователей
    const checks = await Promise.all([
      // Проверяем в коллекции NextAuth пользователей (Google OAuth)
      db.collection('users').findOne({ username }),
      // Проверяем в коллекции JWT пользователей (Email/Password) - они в 'profiles'
      db.collection('profiles').findOne({ username }).catch(() => null)
    ])

    const isTaken = checks.some(user => user !== null)

    console.log('🔍 Username check (GET):', { username, isTaken, foundIn: checks.map((user, i) => user ? (i === 0 ? 'users' : 'profiles') : null).filter(Boolean) })

    return NextResponse.json({ 
      taken: isTaken,
      available: !isTaken 
    })
  } catch (error) {
    console.error('❌ Error checking username:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
