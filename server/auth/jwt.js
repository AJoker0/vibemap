// auth/jwt.js
import jwt from 'jsonwebtoken';
const SECRET = 'SUPER_SECRET_JWT_KEY'; // ✅ MATCH frontend/backend

export function signToken(user) {
  // Always convert MongoDB ObjectId to string if present
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign({ id: userId, email: user.email }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
