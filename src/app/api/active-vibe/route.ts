// src/app/api/active-vibe/route.ts - API для активных вайбов (NextAuth пользователи)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'

// GET - получить текущий активный вайб
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.email // Используем email как ID для NextAuth пользователей
    
    // Удаляем истекшие вайбы
    await db.collection('activeVibes').deleteMany({
      userId,
      expiresAt: { $lt: new Date() }
    })
    
    // Получаем текущий активный вайб
    const activeVibe = await db.collection('activeVibes').findOne({ userId })
    
    if (!activeVibe) {
      return NextResponse.json({ hasActiveVibe: false })
    }
    
    return NextResponse.json({ 
      hasActiveVibe: true, 
      vibe: activeVibe 
    })
  } catch (error) {
    console.error('❌ Error fetching active vibe:', error)
    return NextResponse.json({ error: 'Failed to fetch active vibe' }, { status: 500 })
  }
}

// POST - установить/обновить активный вайб
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { emoji, lat, lng, city, country } = body
    
    if (!emoji || !lat || !lng || !city || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const { db } = await connectToDatabase()
    const userId = session.user.email
    
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +24 часа
    
    const activeVibe = {
      userId,
      emoji,
      lat,
      lng,
      city,
      country,
      createdAt: now,
      expiresAt
    }
    
    // Обновляем или создаем активный вайб (один на пользователя)
    await db.collection('activeVibes').replaceOne(
      { userId },
      activeVibe,
      { upsert: true }
    )
    
    console.log(`🌟 Active vibe set for NextAuth user ${userId}: ${emoji} in ${country}`)
    return NextResponse.json({ success: true, vibe: activeVibe })
  } catch (error) {
    console.error('❌ Error setting active vibe:', error)
    return NextResponse.json({ error: 'Failed to set active vibe' }, { status: 500 })
  }
}

// DELETE - удалить активный вайб вручную
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userId = session.user.email
    
    const result = await db.collection('activeVibes').deleteOne({ userId })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'No active vibe found' }, { status: 404 })
    }
    
    console.log(`🗑️ Active vibe deleted for NextAuth user ${userId}`)
    return NextResponse.json({ success: true, message: 'Active vibe deleted' })
  } catch (error) {
    console.error('❌ Error deleting active vibe:', error)
    return NextResponse.json({ error: 'Failed to delete active vibe' }, { status: 500 })
  }
}
