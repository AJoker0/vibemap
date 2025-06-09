// server/auth/google.js
const { OAuth2Client } = require('google-auth-library');
const { signToken } = require('./jwt');

const client = new OAuth2Client('GOOGLE_CLIENT_ID');

async function googleLogin(tokenId, usersCollection) {
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: 'GOOGLE_CLIENT_ID',
  });
  const payload = ticket.getPayload();
  const email = payload.email;

  let user = await usersCollection.findOne({ email });
  if (!user) {
    const result = await usersCollection.insertOne({ email, google: true });
    user = { _id: result.insertedId, email };
  }

  return signToken(user);
}

module.exports = { googleLogin };
