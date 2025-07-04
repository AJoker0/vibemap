//server/auth/routes.js

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { signToken, isValidEmail, generateUsername } = require('./utils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = (db) => {
  console.log('🔥 Creating auth router...');
  const router = express.Router();

  // Отладочный middleware
  router.use((req, res, next) => {
    console.log(`📥 Auth request: ${req.method} ${req.path}`);
    console.log('📦 Request body:', req.body);
    next();
  });

  // ✅ Email + password login
  router.post('/login', async (req, res) => {
    console.log('🔐 Login with email + password');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      console.log('🔍 Looking for user:', email);
      const user = await db.collection('users').findOne({ email });

      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('✅ User found, checking password...');
      if (user.password !== password) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
      });

      console.log('✅ Login successful for:', email);
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name || '',
          avatar: user.avatar || '/user.png',
        },
      });
    } catch (err) {
      console.error('❌ Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ✅ Email + password register
  router.post('/register', async (req, res) => {
    console.log('📝 Register with email + password');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
      console.log('🔍 Checking if user exists:', email);
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        console.log('❌ User already exists:', email);
        return res.status(400).json({ error: 'User already exists' });
      }

      console.log('👤 Creating new user:', email);
      const result = await db.collection('users').insertOne({
        email,
        password,
        name: email.split('@')[0],
        avatar: '/user.png',
        createdAt: new Date(),
      });

      console.log('👤 Creating profile for:', email);
      await db.collection('profiles').insertOne({
        userId: result.insertedId.toString(),
        email,
        name: email.split('@')[0],
        avatar: '/user.png',
        birthday: '',
        username: generateUsername(email.split('@')[0], email),
        notifications: false,
        createdAt: new Date(),
      });

      const token = signToken({
        id: result.insertedId.toString(),
        email: email,
      });

      console.log('✅ Registration successful for:', email);
      res.json({
        token,
        user: {
          id: result.insertedId,
          email: email,
          name: email.split('@')[0],
          avatar: '/user.png',
        },
      });
    } catch (err) {
      console.error('❌ Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Google OAuth login
  router.post('/google', async (req, res) => {
    console.log('🔥 Google login endpoint hit!');
    const { id_token } = req.body;
    
    if (!id_token) {
      console.log('❌ No ID token provided');
      return res.status(400).json({ error: 'No ID token provided' });
    }

    try {
      console.log('🔍 Verifying Google token...');
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub, email, name, picture } = payload;
      
      console.log('✅ Google token verified for:', email);

      let user = await db.collection('users').findOne({ googleId: sub });

      if (!user) {
        console.log('👤 Creating new Google user...');
        
        const result = await db.collection('users').insertOne({
          googleId: sub,
          email,
          name,
          avatar: picture,
          createdAt: new Date(),
        });

        user = { 
          _id: result.insertedId, 
          googleId: sub, 
          email, 
          name, 
          avatar: picture 
        };

        await db.collection('profiles').insertOne({
          userId: result.insertedId.toString(),
          email,
          name,
          avatar: picture || '/user.png',
          birthday: '',
          username: generateUsername(name, email),
          notifications: false,
          createdAt: new Date(),
        });
        
        console.log('✅ New Google user created');
      } else {
        console.log('👤 Existing Google user found');
      }

      const token = signToken({ 
        id: user._id.toString(), 
        email: user.email 
      });
      
      console.log('✅ Google login successful for:', email);
      res.json({ 
        token, 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      });

    } catch (err) {
      console.error('❌ Google login error:', err);
      res.status(401).json({ error: 'Invalid Google token' });
    }
  });

  // Тестовый роут
  router.get('/test', (req, res) => {
    console.log('🧪 Auth test endpoint hit');
    res.json({ message: 'Auth routes working!' });
  });

  console.log('✅ Auth router created successfully');
  return router;
};