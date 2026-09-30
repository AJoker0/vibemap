const test = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')

process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters'
const { isValidEmail, signToken, verifyToken } = require('../server/auth/utils')

test('accepts valid email addresses and rejects malformed values', () => {
  assert.equal(isValidEmail('person@example.com'), true)
  assert.equal(isValidEmail('not-an-email'), false)
})

test('passwords can be verified from bcrypt hashes', async () => {
  const hash = await bcrypt.hash('correct horse battery staple', 12)
  assert.equal(await bcrypt.compare('correct horse battery staple', hash), true)
  assert.equal(await bcrypt.compare('wrong password', hash), false)
  assert.match(hash, /^\$2/)
})

test('JWT round trip uses the configured secret', () => {
  const token = signToken({ id: 'test-user', email: 'person@example.com' })
  const decoded = verifyToken(token)
  assert.equal(decoded.id, 'test-user')
  assert.equal(decoded.email, 'person@example.com')
})
