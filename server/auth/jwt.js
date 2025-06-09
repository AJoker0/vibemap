// auth/jwt.js
const jwt = require('jsonwebtoken');
const SECRET = 'SUPER_SECRET_JWT_KEY'; // ✅ MATCH frontend/backend

function signToken(user) {
  return jwt.sign({ id: user.id || user._id, email: user.email }, SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
