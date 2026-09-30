import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth-options'
import { connectToDatabase } from '@/lib/mongodb'
import { z } from 'zod'

const visitSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  city: z.string().trim().min(1).max(120),
  emoji: z.string().trim().min(1).max(8),
  timestamp: z.string().datetime().optional(),
})

const privateCoordinate = (value: number) => Math.round(value * 1000) / 1000

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = visitSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid visit data' }, { status: 400 })
    }

    const { lat, lng, city, emoji, timestamp } = parsed.data
    const safeLat = privateCoordinate(lat)
    const safeLng = privateCoordinate(lng)

    // Сохраняем визит в MongoDB
    console.log('📍 NextAuth user visit:', {
      userId: session.user.id,
      email: session.user.email,
      lat: safeLat,
      lng: safeLng,
      location: { type: 'Point', coordinates: [safeLng, safeLat] },
      city,
      emoji,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date(),
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
