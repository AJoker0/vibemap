// server/auth/routes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const { signToken } = require('./jwt');

module.exports = function (db) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const existing = await db.collection('users').findOne({ email });
    if (existing) return res.status(400).json({ error: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = { email, password: hash };
    const result = await db.collection('users').insertOne(user);
    

    await db.collection('profiles').insertOne({
    userId: result.insertedId.toString(),
    email,
    name: email.split('@')[0],
    avatar: '/user.png',
    birthday: '',
    username: '',
    notifications: false,
  });
    
    const token = signToken({ id: result.insertedId.toString(), email }); // ✅ rename to "id"
    res.json({ token });
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    const token = signToken({ id: user._id.toString(), email }); // ✅ rename _id to id
    res.json({ token });
  });

  return router;
};
