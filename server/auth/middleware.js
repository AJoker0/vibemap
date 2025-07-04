// server/auth/middleware.js
const { verifyToken, extractToken } = require('./utils');
const { MongoClient } = require('mongodb');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Проверяем токен
    const decoded = verifyToken(token);
    
    // Добавляем пользователя в req для использования в других роутах
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = requireAuth;