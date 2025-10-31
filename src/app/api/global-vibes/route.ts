// src/app/api/global-vibes/route.ts - Глобальная статистика вайбов по странам (24 часа)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// Возвращает список стран с лидирующей эмоцией и общим числом активных вайбов
// Статистика за последние 24 часа: учитываем документы с createdAt >= since
// и/или неистекшие по TTL (expiresAt >= now)
export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const now = new Date()
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const pipeline = [
      {
        $match: {
          $and: [
            { country: { $type: 'string' } },
            { emoji: { $type: 'string' } },
            {
              $or: [
                { expiresAt: { $gte: now } }, // активные записи по TTL
                { createdAt: { $gte: since } }, // или явно добавленные за 24ч
              ],
            },
          ],
        },
      },
      // Считаем количество для каждой пары (страна, эмодзи)
      {
        $group: {
          _id: { country: '$country', emoji: '$emoji' },
          count: { $sum: 1 },
        },
      },
      // Сортируем так, чтобы первый элемент в стране был лидер
      { $sort: { '_id.country': 1, count: -1 } },
      // Собираем по стране: total и topEmoji
      {
        $group: {
          _id: '$_id.country',
          total: { $sum: '$count' },
          topEmoji: { $first: { emoji: '$_id.emoji', count: '$count' } },
        },
      },
      {
        $project: {
          _id: 0,
          country: '$_id',
          total: 1,
          topEmoji: 1,
        },
      },
      // Финальный рейтинг: по лидер‑эмодзи, затем total, затем страна
      { $sort: { 'topEmoji.count': -1, total: -1, country: 1 } },
    ]

    const countries = await db
      .collection('activeVibes')
      .aggregate(pipeline)
      .toArray()

    return NextResponse.json({ countries })
  } catch (error) {
    console.error('❌ Error fetching global vibes:', error)
    return NextResponse.json({ countries: [] }, { status: 500 })
  }
}
