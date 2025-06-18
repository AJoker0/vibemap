// server/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { MongoClient } from 'mongodb';

import { requireAuth } from './auth/middleware.js'; // ✅ ESM-совместимо
import authRoutes from './auth/routes.js'; // ✅ function(db) -> Router

const app = express();
const port = 5000;


app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url} | Headers:`, req.headers);
  next();
});


// ✅ CORS
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url} | Headers:`, req.headers)
  next()
})
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.options('*', cors())
app.use(express.json({ limit: '8mb' }))
app.use(helmet())

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/vibemap'
console.log('📦 Connecting to MongoDB at', mongoUri)
const client = new MongoClient(mongoUri)
let db;

client.connect().then(() => {
  db = client.db('vibemap');
  console.log('🧠 Connected to MongoDB');

  app.use('/auth', authRoutes(db));

  app.get('/ping', (req, res) => res.send('pong'));

  app.get('/private', requireAuth, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
  });

  app.get('/profile', requireAuth, async (req, res) => {
    try {
      const profile = await db.collection('profiles').findOne({ userId: req.user.id });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put('/profile', requireAuth, async (req, res) => {
    try {
      const { id: userId } = req.user;
      const update = {};
      const fields = ['name', 'avatar', 'birthday', 'username', 'notifications'];
      fields.forEach((k) => { if (req.body[k]) update[k] = req.body[k]; });

      const result = await db.collection('profiles').updateOne({ userId }, { $set: update }, { upsert: true });
      res.json({ success: true, updated: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.get('/check-username', requireAuth, async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'No username provided' });
    const existing = await db.collection('profiles').findOne({ username });
    res.json({ taken: !!existing });
  });

  app.get('/visits', requireAuth, async (req, res) => {
    try {
      const visits = await db.collection('visits').find({ userId: req.user.id }).toArray();
      res.json(visits);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch visits' });
    }
  });

  app.post('/visits', requireAuth, async (req, res) => {
    try {
      const visit = { ...req.body, userId: req.user.id };
      await db.collection('visits').insertOne(visit);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add visit' });
    }
  });

  app.get('/friends', requireAuth, async (req, res) => {
    try {
      const friends = await db.collection('friends').find({ userId: req.user.id }).toArray();
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch friends' });
    }
  });

}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});
