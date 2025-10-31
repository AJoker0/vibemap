import { config } from 'dotenv';
config({ path: '.env.local' });  // <-- добавили

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('No MONGODB_URI in env');
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.db('vibemap').command({ ping: 1 });
  console.log('✅ Mongo connected & ping OK');
} catch (e) {
  console.error('❌ Mongo connect error:', e.message);
} finally {
  await client.close();
}
