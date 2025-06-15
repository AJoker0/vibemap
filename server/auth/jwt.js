// auth/jwt.js
import jwt from 'jsonwebtoken';
const SECRET = 'SUPER_SECRET_JWT_KEY'; // ✅ MATCH frontend/backend

export function signToken(user) {
  return jwt.sign({ id: user.id || user._id, email: user.email }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
