// setup-mongodb-indexes.js - Настройка индексов для активных вайбов

const { MongoClient } = require('mongodb');

async function setupIndexes() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('vibemap');
    const activeVibesCollection = db.collection('activeVibes');
    
    // Создаем TTL индекс для автоматического удаления через 24 часа
    await activeVibesCollection.createIndex(
      { "expiresAt": 1 }, 
      { expireAfterSeconds: 0 }
    );
    console.log('✅ TTL index created for activeVibes collection');
    
    // Создаем индекс для быстрого поиска по userId
    await activeVibesCollection.createIndex({ "userId": 1 });
    console.log('✅ userId index created for activeVibes collection');
    
    // Создаем индекс для группировки по странам
    await activeVibesCollection.createIndex({ "country": 1 });
    console.log('✅ country index created for activeVibes collection');
    
    // Показываем текущие документы в коллекции
    const count = await activeVibesCollection.countDocuments();
    console.log(`📊 Current activeVibes documents: ${count}`);
    
    if (count > 0) {
      const samples = await activeVibesCollection.find({}).limit(3).toArray();
      console.log('📝 Sample documents:');
      samples.forEach((doc, i) => {
        console.log(`  ${i + 1}. User: ${doc.userId}, Emoji: ${doc.emoji}, Country: ${doc.country}, Expires: ${doc.expiresAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error setting up indexes:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setupIndexes();
