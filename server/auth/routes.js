// server/auth/routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from './jwt.js';

export default function (db) {
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

    const token = signToken({ id: result.insertedId.toString(), email });
    res.json({ token });
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    const token = signToken({   id: user._id.toString(), email }); // 👈 Сохраняем поле "_id"
    res.json({ token });
  });

  return router;
}
