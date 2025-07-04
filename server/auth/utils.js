const jwt = require('jsonwebtoken');

// Функция для создания JWT токена
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key-vibemap-2024', {
    expiresIn: '7d'
  });
};

// Функция для проверки JWT токена
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-vibemap-2024');
  } catch (err) {
    throw new Error('Invalid token');
  }
};

// Функция для извлечения токена из заголовка Authorization
const extractToken = (authHeader) => {
  if (!authHeader) return null;
  
  // Ожидаем формат: "Bearer TOKEN"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

// Функция для валидации email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Функция для генерации случайного username
const generateUsername = (name, email) => {
  const baseName = name ? name.toLowerCase().replace(/\s+/g, '') : email.split('@')[0];
  const randomNum = Math.floor(Math.random() * 9999);
  return `${baseName}${randomNum}`;
};

module.exports = {
  signToken,
  verifyToken,
  extractToken,
  isValidEmail,
  generateUsername
};