// server/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { MongoClient } from 'mongodb';
import requireAuth from './auth/middleware.js';
import authRoutes from './auth/routes.js';

const app = express();
const port = 5000;

// ✅ Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '8mb' }));
app.use(helmet());

const client = new MongoClient('mongodb://localhost:27017/vibemap');
let db;

client.connect().then(() => {
  db = client.db('vibemap');
  console.log('🧠 Connected to MongoDB');

  // 🔐 Auth routes
  app.use('/auth', authRoutes(db));

  // ✅ Protected test route
  app.get('/private', requireAuth, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
  });

  // 👤 Profile (GET)
  app.get('/profile', requireAuth, async (req, res) => {
    try {
      const profile = await db.collection('profiles').findOne({ userId: req.user._id });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // 👤 Profile (PUT)
  app.put('/profile', requireAuth, async (req, res) => {
    try {
      const { id: userId } = req.user;
      const allowedFields = ['name', 'avatar', 'birthday', 'username', 'notifications'];
      const update = {};

      for (const key of allowedFields) {
        if (req.body[key]) update[key] = req.body[key];
      }

      const result = await db.collection('profiles').updateOne(
        { userId },
        { $set: update },
        { upsert: true }
      );

      res.json({ success: true, updated: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // 👤 Username check
  app.get('/check-username', requireAuth, async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'No username provided' });

    const existing = await db.collection('profiles').findOne({ username });
    res.json({ taken: !!existing });
  });

  // 📍 Visits
  app.get('/visits', requireAuth, async (req, res) => {
    try {
      const visits = await db.collection('visits').find({ userId: req.user._id }).toArray();
      res.json(visits);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch visits' });
    }
  });

  app.post('/visits', requireAuth, async (req, res) => {
    try {
      const visit = { ...req.body, userId: req.user._id };
      await db.collection('visits').insertOne(visit);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add visit' });
    }
  });

  // 🧑‍🤝‍🧑 Friends
  app.get('/friends', requireAuth, async (req, res) => {
    try {
      const friends = await db.collection('friends').find({ userId: req.user._id }).toArray();
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch friends' });
    }
  });

}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
});

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});
