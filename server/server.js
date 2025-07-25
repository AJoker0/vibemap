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