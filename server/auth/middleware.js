// server/auth/middleware.js
const { verifyToken } = require('./jwt');

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }

  const token = auth.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    console.log('🔑 Decoded token:', decoded); // 👈 вот здесь
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};