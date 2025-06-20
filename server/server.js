// server/server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { MongoClient } from 'mongodb'
import { requireAuth } from './auth/middleware.js'
import authRoutes from './auth/routes.js'

const app = express()
const port = 5000

// Логгер запросов (для отладки)
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url} | Headers:`, req.headers)
  next()
})

// CORS
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
let db

client
  .connect()
  .then(() => {
    db = client.db('vibemap')
    console.log('🧠 Connected to MongoDB')

    app.use('/auth', authRoutes(db))

    app.get('/ping', (req, res) => res.send('pong'))
    
    app.get('/private', requireAuth, (req, res) => {
      res.json({ message: 'Protected data', user: req.user })
    })
    
    app.get('/profile', requireAuth, async (req, res) => {
      try {
        console.log('Looking for profile with userId:', req.user.id);
        const profile = await db.collection('profiles').findOne({ userId: req.user.id });
        if (!profile) {
          // If no profile found, try creating one with basic info
          const userEmail = req.user.email;
          const newProfile = {
            userId: req.user.id,
            email: userEmail,
            name: userEmail.split('@')[0],
            avatar: '/user.png',
            birthday: '',
            username: '',
            notifications: false,
          };
          await db.collection('profiles').insertOne(newProfile);
          res.json(newProfile);
        } else {
          res.json(profile);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
      }
    })

    app.put('/profile', requireAuth, async (req, res) => {
      try {
        const { id: userId } = req.user
        const fields = ['name', 'avatar', 'birthday', 'username', 'notifications']
        const update = {}
        for (const key of fields) {
          if (req.body[key]) update[key] = req.body[key]
        }
        const result = await db.collection('profiles').updateOne({ userId }, { $set: update }, { upsert: true })
        res.json({ success: true, updated: result.modifiedCount })
      } catch {
        res.status(500).json({ error: 'Failed to update profile' })
      }
    })

    app.get('/check-username', requireAuth, async (req, res) => {
      const { username } = req.query
      if (!username) return res.status(400).json({ error: 'No username provided' })
      const existing = await db.collection('profiles').findOne({ username })
      res.json({ taken: !!existing })
    })

    app.get('/visits', requireAuth, async (req, res) => {
      try {
        const visits = await db.collection('visits').find({ userId: req.user.id }).toArray()
        res.json(visits)
      } catch {
        res.status(500).json({ error: 'Failed to fetch visits' })
      }
    })

    app.post('/visits', requireAuth, async (req, res) => {
      try {
        const visit = { ...req.body, userId: req.user.id }
        await db.collection('visits').insertOne(visit)
        res.status(201).json({ success: true })
      } catch {
        res.status(500).json({ error: 'Failed to add visit' })
      }
    })

    app.get('/friends', requireAuth, async (req, res) => {
      try {
        const friends = await db.collection('friends').find({ userId: req.user.id }).toArray()
        res.json(friends)
      } catch {
        res.status(500).json({ error: 'Failed to fetch friends' })
      }
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  })

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`)
})
