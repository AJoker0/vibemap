const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const requireAuth = require('./auth/middleware');

const app = express();
const port = 5000;

// ✅ Apply CORS before everything else
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Parse JSON body (required for req.body!)
app.use(express.json({ limit: '8mb' }));

const client = new MongoClient('mongodb://localhost:27017/vibemap');
let db;

client.connect().then(() => {
  db = client.db('vibemap');
  console.log('🧠 Connected to MongoDB');

  // 🔐 Auth routes
  const authRoutes = require('./auth/routes')(db);
  app.use('/auth', authRoutes);

  // ✅ Protected test route
  app.get('/private', requireAuth, (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
  });

  // 👤 Profile (GET)
  /*app.get('/profile', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id; // всегда id
      const profile = await db.collection('profiles').findOne({ userId });
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });*/
  // 👤 Username check (фикс)
app.get('/check-username', requireAuth, async (req, res) => {
  const username = req.query.username;
  const userId = req.user.id;

  if (!username) return res.status(400).json({ error: 'No username provided' });

  const existing = await db.collection('profiles').findOne({ username });

  if (existing && existing.userId !== userId) {
    return res.json({ taken: true }); // 🔒 чужой username
  }

  return res.json({ taken: false }); // ✅ свободен или твой
});


  // 👤 Profile (PUT)
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

  // 👤 Username check
  app.get('/check-username', requireAuth, async (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: 'No username provided' });

    const existing = await db.collection('profiles').findOne({ username });
    res.json({ taken: !!existing });
  });

  // 📍 Visits
  app.get('/visits', requireAuth, async (req, res) => {
    try {
      const visits = await db.collection('visits').find({ userId: req.user.id }).toArray();
      res.json(visits);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch visits' });
    }
  });

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

  // 🧑‍🤝‍🧑 Friends
  app.get('/friends', requireAuth, async (req, res) => {
    try {
      const friends = await db.collection('friends').find({ userId: req.user.id }).toArray();
      res.json(friends);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch friends' });
    }
  });

}).catch(console.error);

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});