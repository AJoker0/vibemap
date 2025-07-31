//server/server.js

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const requireAuth = require('./auth/middleware');

// Загружаем переменные окружения
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS + JSON
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '8mb' }));

// Отладочный middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibemap');
let db;

client.connect().then(() => {
  db = client.db('vibemap');
  console.log('🧠 Connected to MongoDB');

  // ✅ Auth routes
  console.log('🔥 Registering auth routes...');
  const authRoutes = require('./auth/routes')(db);
  app.use('/auth', authRoutes);
  console.log('✅ Auth routes registered at /auth');

  // ✅ Тестовый роут
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
  });

  // ✅ Protected test route
  app.get('/private', requireAuth, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
  });

  // ✅ Get profile
  app.get('/profile', requireAuth, async (req, res) => {
    try {
      const profile = await db.collection('profiles').findOne({ userId: req.user.id });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // ✅ Update profile
  app.put('/profile', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      const allowedFields = ['name', 'avatar', 'birthday', 'username', 'notifications'];

      const update = {};
      for (const key of allowedFields) {
        if (key in data) update[key] = data[key];
      }

      const result = await db.collection('profiles').updateOne(
        { userId },
        { $set: update },
        { upsert: true }
      );

      res.json({ success: true, updated: result.modifiedCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ✅ Check username across ALL user types
  app.get('/check-username', requireAuth, async (req, res) => {
    const username = req.query.username;
    const userId = req.user.id;

    if (!username) return res.status(400).json({ error: 'No username provided' });

    // 🎯 Проверяем во ВСЕХ коллекциях пользователей
    const checks = await Promise.all([
      // Проверяем в коллекции JWT пользователей (profiles) - текущий пользователь
      db.collection('profiles').findOne({ username }),
      // Проверяем в коллекции NextAuth пользователей (users) - Google OAuth
      db.collection('users').findOne({ username }).catch(() => null)
    ]);

    // Находим любого пользователя с таким username
    const existingUser = checks.find(user => user !== null);
    
    // Если username найден и это НЕ текущий пользователь
    if (existingUser) {
      // Для JWT пользователей проверяем по userId
      if (existingUser.userId && existingUser.userId !== userId) {
        console.log('❌ Username taken by JWT user:', username, 'userId:', existingUser.userId);
        return res.json({ taken: true });
      }
      // Для NextAuth пользователей (у них нет userId в том же формате)
      if (!existingUser.userId) {
        console.log('❌ Username taken by NextAuth user:', username, 'email:', existingUser.email);
        return res.json({ taken: true });
      }
    }

    console.log('✅ Username available:', username);
    return res.json({ taken: false });
  });

  // ✅ Get visits
  app.get('/visits', requireAuth, async (req, res) => {
    try {
      const visits = await db.collection('visits').find({ userId: req.user.id }).toArray();
      res.json(visits);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visits' });
    }
  });

  // ✅ Add visit
  app.post('/visits', requireAuth, async (req, res) => {
    try {
      const visit = { ...req.body, userId: req.user.id };
      await db.collection('visits').insertOne(visit);
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add visit' });
    }
  });

  // 🌟 НОВЫЕ ACTIVE VIBE ENDPOINTS - для 24-часовых вайбов

  // ✅ Get current active vibe
  app.get('/active-vibe', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Удаляем истекшие вайбы
      await db.collection('activeVibes').deleteMany({
        userId,
        expiresAt: { $lt: new Date() }
      });
      
      // Получаем текущий активный вайб
      const activeVibe = await db.collection('activeVibes').findOne({ userId });
      
      if (!activeVibe) {
        return res.json({ hasActiveVibe: false });
      }
      
      res.json({ 
        hasActiveVibe: true, 
        vibe: activeVibe 
      });
    } catch (err) {
      console.error('❌ Error fetching active vibe:', err);
      res.status(500).json({ error: 'Failed to fetch active vibe' });
    }
  });

  // ✅ Set/Update active vibe (24 hours)
  app.post('/active-vibe', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { emoji, lat, lng, city, country } = req.body;
      
      if (!emoji || !lat || !lng || !city || !country) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 часа
      
      const activeVibe = {
        userId,
        emoji,
        lat,
        lng,
        city,
        country,
        createdAt: now,
        expiresAt
      };
      
      // Обновляем или создаем активный вайб (один на пользователя)
      await db.collection('activeVibes').replaceOne(
        { userId },
        activeVibe,
        { upsert: true }
      );
      
      console.log(`🌟 Active vibe set for user ${userId}: ${emoji} in ${country}`);
      res.json({ success: true, vibe: activeVibe });
    } catch (err) {
      console.error('❌ Error setting active vibe:', err);
      res.status(500).json({ error: 'Failed to set active vibe' });
    }
  });

  // ✅ Delete active vibe manually
  app.delete('/active-vibe', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const result = await db.collection('activeVibes').deleteOne({ userId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'No active vibe found' });
      }
      
      console.log(`🗑️ Active vibe deleted for user ${userId}`);
      res.json({ success: true, message: 'Active vibe deleted' });
    } catch (err) {
      console.error('❌ Error deleting active vibe:', err);
      res.status(500).json({ error: 'Failed to delete active vibe' });
    }
  });

  // 🌍 Get global vibe statistics by countries
  app.get('/global-vibes', async (req, res) => {
    try {
      // Сначала удаляем все истекшие вайбы
      await db.collection('activeVibes').deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
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
      ];
      
      const globalStats = await db.collection('activeVibes').aggregate(pipeline).toArray();
      
      // Добавляем прикольные подписи для стран
      const funMessages = {
        'Bulgaria': {
          '😄': 'Bulgarians are happy today!',
          '💪': 'Bulgarian power!',
          '🏃': 'Runners from Bulgaria!',
          '🎉': 'Party time in Bulgaria!'
        },
        'France': {
          '💪': 'Wow, French people are sporty!',
          '🍷': 'French wine vibes!',
          '🎨': 'Artistic French souls!',
          '😄': 'Happy French people!'
        },
        'Italy': {
          '🍕': 'Pizza time in Italy!',
          '💪': 'Italian strength!',
          '🎵': 'Musical Italian vibes!',
          '😄': 'Joyful Italians!'
        },
        'Germany': {
          '💪': 'German efficiency and strength!',
          '🍺': 'German beer culture!',
          '⚽': 'Football loving Germans!',
          '😄': 'Happy Germans today!'
        }
      };
      
      // Добавляем сообщения к результатам
      const enrichedStats = globalStats.map(stat => {
        const country = stat.country;
        const topEmoji = stat.topVibe?.emoji;
        const message = funMessages[country]?.[topEmoji] || `${country} vibes: ${topEmoji}`;
        
        return {
          ...stat,
          message
        };
      });
      
      console.log(`🌍 Global vibes requested: ${globalStats.length} countries active`);
      res.json(enrichedStats);
    } catch (err) {
      console.error('❌ Error fetching global vibes:', err);
      res.status(500).json({ error: 'Failed to fetch global vibes' });
    }
  });

  // ✅ Get friends
  app.get('/friends', requireAuth, async (req, res) => {
    try {
      const friends = await db.collection('friends').find({ userId: req.user.id }).toArray();
      res.json(friends);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch friends' });
    }
  });

  // ✅ Всё загружено
  console.log('✅ All routes registered');

  // ✅ Старт сервера
  app.listen(port, () => {
    console.log(`🚀 API server running on http://localhost:${port}`);
    console.log(`🔗 Test endpoint: http://localhost:${port}/test`);
    console.log(`🔗 Auth test: http://localhost:${port}/auth/test`);
  });

}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});