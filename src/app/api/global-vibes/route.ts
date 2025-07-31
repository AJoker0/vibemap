// src/app/api/global-vibes/route.ts - Глобальная статистика вайбов по странам

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// GET - получить глобальную статистику вайбов по странам
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Сначала удаляем все истекшие вайбы
    await db.collection('activeVibes').deleteMany({
      expiresAt: { $lt: new Date() }
    })
    
    // Группируем активные вайбы по странам и эмодзи
    const pipeline = [
      {
        $group: {
          _id: { 
            country: '$country',
            emoji: '$emoji' 
          },
          count: { $sum: 1 },
          cities: { $addToSet: '$city' }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          vibes: {
            $push: {
              emoji: '$_id.emoji',
              count: '$count',
              cities: '$cities'
            }
          },
          totalPeople: { $sum: '$count' }
        }
      },
      {
        $project: {
          country: '$_id',
          vibes: 1,
          totalPeople: 1,
          topVibe: { $arrayElemAt: [{ $sortArray: { input: '$vibes', sortBy: { count: -1 } } }, 0] }
        }
      },
      { $sort: { totalPeople: -1 } }
    ]
    
    const globalStats = await db.collection('activeVibes').aggregate(pipeline).toArray()
    
    // Добавляем прикольные подписи для стран
    const funMessages: Record<string, Record<string, string>> = {
      'Bulgaria': {
        '😄': 'Bulgarians are happy today!',
        '💪': 'Bulgarian power!',
        '🏃': 'Runners from Bulgaria!',
        '🎉': 'Party time in Bulgaria!',
        '😴': 'Sleepy Bulgaria vibes',
        '🌟': 'Bulgaria is shining!',
        '❤️': 'Love from Bulgaria!'
      },
      'France': {
        '💪': 'Wow, French people are sporty!',
        '🍷': 'French wine vibes!',
        '🎨': 'Artistic French souls!',
        '😄': 'Happy French people!',
        '🥖': 'Baguette time in France!',
        '🌟': 'French elegance!',
        '❤️': 'Love from France!'
      },
      'Italy': {
        '🍕': 'Pizza time in Italy!',
        '💪': 'Italian strength!',
        '🎵': 'Musical Italian vibes!',
        '😄': 'Joyful Italians!',
        '☕': 'Italian coffee culture!',
        '🌟': 'Italian passion!',
        '❤️': 'Amore from Italy!'
      },
      'Germany': {
        '💪': 'German efficiency and strength!',
        '🍺': 'German beer culture!',
        '⚽': 'Football loving Germans!',
        '😄': 'Happy Germans today!',
        '🌟': 'German precision!',
        '❤️': 'Love from Germany!'
      },
      'Spain': {
        '💃': 'Flamenco vibes from Spain!',
        '☀️': 'Sunny Spanish mood!',
        '🎉': 'Fiesta time in Spain!',
        '💪': 'Strong Spanish spirit!',
        '😄': 'Happy Spanish people!',
        '❤️': 'Amor from Spain!'
      },
      'United Kingdom': {
        '☔': 'Classic British weather mood!',
        '☕': 'Tea time in the UK!',
        '💪': 'British resilience!',
        '😄': 'Happy Brits today!',
        '🌟': 'British brilliance!',
        '❤️': 'Love from the UK!'
      },
      'USA': {
        '💪': 'American strength!',
        '🦅': 'Freedom vibes from USA!',
        '🍔': 'American food culture!',
        '😄': 'Happy Americans!',
        '🌟': 'American dreams!',
        '❤️': 'Love from USA!'
      },
      'Canada': {
        '🍁': 'Canadian maple vibes!',
        '😄': 'Happy Canadians, eh!',
        '💪': 'Strong Canadian spirit!',
        '🌟': 'Canadian kindness!',
        '❤️': 'Love from Canada!'
      }
    }
    
    // Добавляем сообщения к результатам
    const enrichedStats = globalStats.map(stat => {
      const country = stat.country
      const topEmoji = stat.topVibe?.emoji
      const message = funMessages[country]?.[topEmoji] || `${country} vibes: ${topEmoji}`
      
      return {
        ...stat,
        message
      }
    })
    
    console.log(`🌍 Global vibes requested: ${globalStats.length} countries active`)
    return NextResponse.json(enrichedStats)
  } catch (error) {
    console.error('❌ Error fetching global vibes:', error)
    return NextResponse.json({ error: 'Failed to fetch global vibes' }, { status: 500 })
  }
}
