// test-active-vibes-api.js - Тестирование API активных вайбов

async function testActiveVibesAPI() {
  console.log('🧪 Тестируем API активных вайбов...\n');
  
  // Тест 1: Получение глобальных вайбов (без авторизации)
  try {
    console.log('📊 Тест 1: Получение глобальных вайбов');
    const response = await fetch('http://localhost:3002/api/global-vibes');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Тест 2: Проверим Express API (для JWT пользователей)
  try {
    console.log('🚀 Тест 2: Express API - глобальные вайбы (без токена)');
    const response = await fetch('http://localhost:5000/global-vibes');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Тест 3: Проверим MongoDB напрямую
  const { MongoClient } = require('mongodb');
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    console.log('🗄️ Тест 3: Прямая проверка MongoDB');
    await client.connect();
    const db = client.db('vibemap');
    
    const usersCount = await db.collection('users').countDocuments();
    const profilesCount = await db.collection('profiles').countDocuments();
    const visitsCount = await db.collection('visits').countDocuments();
    const activeVibesCount = await db.collection('activeVibes').countDocuments();
    
    console.log(`👥 Пользователи: ${usersCount}`);
    console.log(`📝 Профили: ${profilesCount}`);
    console.log(`📍 Визиты: ${visitsCount}`);
    console.log(`💫 Активные вайбы: ${activeVibesCount}`);
    
    if (visitsCount > 0) {
      const recentVisits = await db.collection('visits').find({}).sort({ timestamp: -1 }).limit(3).toArray();
      console.log('\n🔍 Последние визиты:');
      recentVisits.forEach((visit, i) => {
        console.log(`  ${i + 1}. ${visit.userId || visit.userEmail} - ${visit.emoji} в ${visit.city} (${new Date(visit.timestamp).toLocaleString()})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка MongoDB:', error.message);
  } finally {
    await client.close();
  }
}

testActiveVibesAPI();
