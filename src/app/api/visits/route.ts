import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth-options'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lat, lng, city, emoji, timestamp } = body

    // Сохраняем визит в MongoDB
    console.log('📍 NextAuth user visit:', {
      userId: session.user.id,
      email: session.user.email,
      lat,
      lng,
      city,
      emoji,
      timestamp
    })

    const { db } = await connectToDatabase()
    
    const visit = {
      userEmail: session.user.email, // 🎯 Используем email как уникальный ID
      userName: session.user.name || 'Unknown User',
      lat,
      lng,
      city,
      emoji,
      timestamp
    }
    
    await db.collection('visits').insertOne(visit)
    console.log('✅ Visit saved to MongoDB successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error saving visit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Ищем визиты по email пользователя (уникальный идентификатор)
    const visits = await db
      .collection('visits')
      .find({ userEmail: session.user.email })
      .sort({ timestamp: -1 })
      .toArray()
    
    return NextResponse.json(visits)
  } catch (error) {
    console.error('❌ Error fetching visits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
