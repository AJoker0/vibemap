import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar, googleId } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    
    // Проверяем, существует ли уже пользователь
    const existingUser = await db
      .collection('users')
      .findOne({ email })

    if (existingUser) {
      // Пользователь уже существует, возвращаем его данные
      return NextResponse.json({
        exists: true,
        username: existingUser.username,
        user: existingUser
      })
    }

    // Создаем нового пользователя с уникальным username
    const emailPrefix = email.split('@')[0] || 'user'
    
    // 🎯 Генерируем ДЕЙСТВИТЕЛЬНО уникальный username во ВСЕХ коллекциях
    let uniqueUsername = ''
    let isUnique = false
    let attempts = 0
    const maxAttempts = 100
    
    while (!isUnique && attempts < maxAttempts) {
      const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
      uniqueUsername = `${emailPrefix}_${randomSuffix}`
      
      // 🔍 Проверяем во ВСЕХ коллекциях пользователей
      const checks = await Promise.all([
        // Проверяем в коллекции NextAuth пользователей (Google OAuth)
        db.collection('users').findOne({ username: uniqueUsername }),
        // Проверяем в коллекции JWT пользователей (Email/Password) - они в 'profiles'
        db.collection('profiles').findOne({ username: uniqueUsername }).catch(() => null)
      ])
      
      if (!checks.some(user => user !== null)) {
        isUnique = true
        console.log('✅ Found unique username:', uniqueUsername, 'after', attempts + 1, 'attempts')
      } else {
        console.log('❌ Username taken:', uniqueUsername, 'in collections:', checks.map((user, i) => user ? (i === 0 ? 'users' : 'profiles') : null).filter(Boolean))
      }
      attempts++
    }
    
    // Если не удалось найти уникальный username за 100 попыток, добавляем timestamp
    if (!isUnique) {
      uniqueUsername = `${emailPrefix}_${Date.now().toString().slice(-6)}`
    }
    
    const newUser = {
      email,
      name: name || 'NextAuth User',
      avatar: avatar || '/user.png',
      username: uniqueUsername,
      googleId,
      notifications: true,
      isDefaultUsername: true,
      createdAt: new Date()
    }
    
    await db.collection('users').insertOne(newUser)
    
    console.log('🎯 New user created with UNIQUE username:', uniqueUsername)
    
    return NextResponse.json({
      exists: false,
      username: uniqueUsername,
      user: newUser
    })
  } catch (error) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
