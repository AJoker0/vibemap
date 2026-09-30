import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

config({ path: '.env.local' })
config()

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibemap'
const client = new MongoClient(uri)
let migrated = 0

try {
  await client.connect()
  const collection = client.db('vibemap').collection('users')
  const cursor = collection.find({ password: { $type: 'string' } })

  for await (const user of cursor) {
    const password = user.password
    const passwordHash = password.startsWith('$2') ? password : await bcrypt.hash(password, 12)
    await collection.updateOne(
      { _id: user._id },
      { $set: { passwordHash }, $unset: { password: '' } },
    )
    migrated += 1
  }

  console.log(`Migrated ${migrated} legacy password records without printing credentials.`)
} finally {
  await client.close()
}
