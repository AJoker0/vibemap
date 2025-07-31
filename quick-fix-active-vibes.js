// quick-fix-active-vibes.js - Быстрое тестирование активных вайбов через API

async function testActiveVibes() {
  console.log('🧪 Тестируем сохранение активного вайба...')
  
  // Симуляция данных пользователя
  const testData = {
    emoji: '😊',
    country: 'Bulgaria',
    lat: 42.6977,
    lng: 23.3219
  }
  
  try {
    // Тест сохранения через NextAuth API
    console.log('💾 Сохраняем тестовый активный вайб...')
    const response = await fetch('http://localhost:3002/api/active-vibe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Для тестирования без авторизации - API должен вернуть 401
      },
      body: JSON.stringify(testData)
    })
    
    console.log('Response status:', response.status)
    const result = await response.json()
    console.log('Response data:', result)
    
    if (response.status === 401) {
      console.log('✅ Правильно! API требует авторизации')
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error)
  }
  
  // Тест получения глобальных вайбов
  try {
    console.log('\n🌍 Получаем глобальные вайбы...')
    const response = await fetch('http://localhost:3002/api/global-vibes')
    const result = await response.json()
    
    console.log('Global vibes response:', result)
    
    if (Array.isArray(result)) {
      console.log(`✅ Получено ${result.length} глобальных вайбов`)
    }
    
  } catch (error) {
    console.error('❌ Ошибка получения глобальных вайбов:', error)
  }
  
  // Проверим MongoDB напрямую
  const { MongoClient } = require('mongodb')
  const client = new MongoClient('mongodb://localhost:27017')
  
  try {
    console.log('\n🗄️ Проверяем MongoDB...')
    await client.connect()
    const db = client.db('vibemap')
    
    const activeVibesCount = await db.collection('activeVibes').countDocuments()
    console.log(`💫 Активных вайбов в базе: ${activeVibesCount}`)
    
    if (activeVibesCount > 0) {
      const samples = await db.collection('activeVibes').find({}).limit(3).toArray()
      console.log('📋 Примеры активных вайбов:')
      samples.forEach((vibe, i) => {
        console.log(`  ${i + 1}. ${vibe.emoji} от ${vibe.userId} в ${vibe.country}`)
      })
    } else {
      console.log('ℹ️ Активных вайбов пока нет - нужно авторизоваться и выбрать вайб на карте')
    }
    
  } catch (error) {
    console.error('❌ Ошибка MongoDB:', error)
  } finally {
    await client.close()
  }
}

testActiveVibes()
