//server/auth/routes.js

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { signToken, isValidEmail, generateUsername } = require('./utils');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = (db) => {
  console.log('🔥 Creating auth router...');
  const router = express.Router();

  router.use((req, res, next) => {
    console.log(`📥 Auth request: ${req.method} ${req.path}`);
    console.log('📦 Request body:', req.body);
    next();
  });

  // 🔐 Login - ОБНОВЛЕННАЯ ВЕРСИЯ С ОТЛАДКОЙ
  router.post('/login', async (req, res) => {
    console.log('🔐 Login with email + password');
    const { email, password } = req.body;

    if (!email || !password) {
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
      console.log('🔍 User data:', { 
        email: user.email, 
        hasPassword: !!user.password,
        hasGoogleId: !!user.googleId,
        passwordLength: user.password ? user.password.length : 0
      });

      // Проверяем, есть ли хешированный пароль
      if (!user.password) {
        console.log('❌ No password found for user:', email);
        return res.status(401).json({ error: 'User registered with Google. Please use Google login.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch && user.password === password) {
  console.log('⚠️ Using legacy plain password');
}

if (!isMatch && user.password !== password) {
  console.log('❌ Invalid password for:', email);
  console.log('🔍 Provided password:', password);
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

  // 📝 Register
  router.post('/register', async (req, res) => {
    console.log('📝 Register with email + password');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.collection('users').insertOne({
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        avatar: '/user.png',
        createdAt: new Date(),
      });

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

  // 🔗 Google OAuth login
  router.post('/google', async (req, res) => {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ error: 'No ID token provided' });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub, email, name, picture } = payload;

      let user = await db.collection('users').findOne({ googleId: sub });

      if (!user) {
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
          avatar: picture,
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
      }

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
      });

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.error('❌ Google login error:', err);
      res.status(401).json({ error: 'Invalid Google token' });
    }
  });

  router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working!' });
  });

  return router;
};