// server/auth/routes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const { signToken } = require('./jwt');

module.exports = function (db) {
  const router = express.Router();

  // ✅ Регистрация
  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existing = await db.collection('users').findOne({ email });
      if (existing) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = { email, password: hash, createdAt: new Date() };
      const result = await db.collection('users').insertOne(user);

      // 🧍‍♂️ Создаём профиль по умолчанию
      await db.collection('profiles').insertOne({
        userId: result.insertedId.toString(),
        email,
        name: email.split('@')[0],
        avatar: '/user.png',
        birthday: '',
        username: '',
        notifications: false,
      });

      const token = signToken({ id: result.insertedId.toString(), email });
      res.status(201).json({ token, message: 'User registered successfully' });

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ✅ Логин
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = signToken({ id: user._id.toString(), email });
      res.json({ token });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
