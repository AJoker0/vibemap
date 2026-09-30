//server/auth/routes.js

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { signToken, isValidEmail, generateUsername } = require('./utils');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { env } = require('../config');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

function setAuthCookie(res, token) {
  res.cookie('vibemap_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

module.exports = (db) => {
  console.log('🔥 Creating auth router...');
  const router = express.Router();

  router.use((req, res, next) => {
    console.log(`📥 Auth request: ${req.method} ${req.path}`);
    next();
  });

  // 🔐 Login - ОБНОВЛЕННАЯ ВЕРСИЯ С ОТЛАДКОЙ
  router.post('/login', async (req, res) => {
    console.log('🔐 Login with email + password');
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Use a valid email and a password with 8-128 characters' });
    const { email, password } = parsed.data;

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
        hasPassword: !!user.passwordHash,
        hasGoogleId: !!user.googleId,
      });

      const passwordHash = user.passwordHash;
      if (!passwordHash || !passwordHash.startsWith('$2')) {
        console.log('❌ No password found for user:', email);
        return res.status(401).json({ error: 'User registered with Google. Please use Google login.' });
      }

      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch) {
  console.log('❌ Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }


      const token = signToken({
        id: user._id.toString(),
        email: user.email,
      });

      console.log('✅ Login successful for:', email);
      setAuthCookie(res, token);
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
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Use a valid email and a password with 8-128 characters' });
    const { email, password } = parsed.data;

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
        passwordHash: hashedPassword,
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

      setAuthCookie(res, token);
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

      setAuthCookie(res, token);
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

  router.post('/logout', (_req, res) => {
    res.clearCookie('vibemap_token', { httpOnly: true, sameSite: 'lax', path: '/' });
    res.json({ success: true });
  });

  // ✅ NextAuth Google OAuth endpoint
  router.post('/google-oauth', async (req, res) => {
    console.log('🔥 NextAuth Google OAuth endpoint hit!')
    const { googleId, email, name, avatar } = req.body

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
      console.log('🔍 Looking for user with googleId:', googleId)
      let user = await db.collection('users').findOne({ googleId })

      if (!user) {
        console.log('👤 Creating new OAuth user...')
        
        const result = await db.collection('users').insertOne({
          googleId,
          email,
          name,
          avatar,
          createdAt: new Date(),
        })

        user = {
          _id: result.insertedId,
          googleId,
          email,
          name,
          avatar,
        }

        // Создаем профиль
        await db.collection('profiles').insertOne({
          userId: result.insertedId.toString(),
          email,
          name,
          avatar: avatar || '/user.png',
          birthday: '',
          username: generateUsername(name, email),
          notifications: false,
          createdAt: new Date(),
        })
        
        console.log('✅ New OAuth user created')
      } else {
        console.log('👤 Existing OAuth user found')
      }

      res.json({ 
        success: true, 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        }
      })

    } catch (err) {
      console.error('❌ OAuth user save error:', err)
      res.status(500).json({ error: 'Failed to save user' })
    }
  })

  router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working!' });
  });

  return router;
};