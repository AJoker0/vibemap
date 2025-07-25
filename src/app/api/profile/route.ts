import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Ищем пользователя по email в базе данных
    const user = await db
      .collection('users')
      .findOne({ email: session.user.email })

    if (!user) {
      // Если пользователя нет в базе, возвращаем ошибку
      // Пользователь должен быть создан через signIn callback
      return NextResponse.json({ 
        error: 'User not found. Please log in again.' 
      }, { status: 404 })
    }

    // Возвращаем существующий профиль
    return NextResponse.json({
      id: user.email,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
      notifications: user.notifications !== false,
      birthday: user.birthday,
      isDefaultUsername: user.isDefaultUsername || false
    })
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, avatar, birthday, notifications } = body

    const { db } = await connectToDatabase()
    
    // 🎯 Проверяем уникальность username во ВСЕХ коллекциях если он изменился
    if (username) {
      const currentUser = await db
        .collection('users')
        .findOne({ email: session.user.email })
      
      // Если username изменился, проверяем уникальность во всех коллекциях
      if (currentUser && currentUser.username !== username) {
        const checks = await Promise.all([
          // Проверяем в коллекции NextAuth пользователей (Google OAuth)
          db.collection('users').findOne({ 
            username: username,
            email: { $ne: session.user.email } // Исключаем текущего пользователя
          }),
          // Проверяем в коллекции JWT пользователей (Email/Password) - они в 'profiles'
          db.collection('profiles').findOne({ username: username }).catch(() => null)
        ])
        
        if (checks.some(user => user !== null)) {
          console.log('❌ Username conflict detected:', username, 'found in:', checks.map((user, i) => user ? (i === 0 ? 'users' : 'profiles') : null).filter(Boolean))
          return NextResponse.json({ 
            error: 'Username уже занят. Выберите другой.' 
          }, { status: 409 })
        }
      }
    }
    
    // Обновляем профиль пользователя
    await db
      .collection('users')
      .updateOne(
        { email: session.user.email },
        { 
          $set: {
            name,
            username,
            avatar,
            birthday,
            notifications,
            isDefaultUsername: false, // Убираем флаг после первого сохранения
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )

    console.log('✅ Profile updated with unique username:', username)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
