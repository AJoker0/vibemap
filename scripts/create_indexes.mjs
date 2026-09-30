import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config({ path: '.env.local' })
config()

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibemap'
const client = new MongoClient(uri)
let uniqueConflicts = false

async function createUniqueIndex(collection, keys, options, lookupName) {
  try {
    await collection.createIndex(keys, options)
  } catch (error) {
    if (error?.code !== 11000) throw error
    uniqueConflicts = true
    console.error(`Cannot create unique index ${options.name}; duplicate records exist.`)
    await collection.createIndex(keys, { name: lookupName })
  }
}

async function ensureIndex(collection, keys, options) {
  try {
    await collection.createIndex(keys, options)
  } catch (error) {
    if (error?.code !== 85) throw error
    console.warn(`Index with these keys already exists: ${JSON.stringify(keys)}`)
  }
}

try {
  await client.connect()
  const db = client.db('vibemap')

  await db.collection('users').updateMany({ username: '' }, { $unset: { username: '' } })
  await db.collection('profiles').updateMany({ username: '' }, { $unset: { username: '' } })
  await createUniqueIndex(db.collection('users'), { email: 1 }, { unique: true, name: 'users_email_unique' }, 'users_email_lookup')
  await createUniqueIndex(db.collection('users'), { username: 1 }, { unique: true, sparse: true, name: 'users_username_unique' }, 'users_username_lookup')
  await createUniqueIndex(db.collection('profiles'), { username: 1 }, { unique: true, sparse: true, name: 'profiles_username_unique' }, 'profiles_username_lookup')
  await db.collection('visits').updateMany(
    { location: { $exists: false }, lat: { $type: 'number' }, lng: { $type: 'number' } },
    [{ $set: { location: { type: 'Point', coordinates: ['$lng', '$lat'] } } }]
  )
  await ensureIndex(db.collection('visits'), { location: '2dsphere' }, { name: 'visits_location_2dsphere' })
  await ensureIndex(db.collection('visits'), { userId: 1, timestamp: -1 }, { name: 'visits_user_time' })
  await ensureIndex(db.collection('visits'), { userEmail: 1, timestamp: -1 }, { name: 'visits_email_time' })
  await ensureIndex(db.collection('activeVibes'), { expiresAt: 1 }, { expireAfterSeconds: 0, name: 'active_vibes_ttl' })
  await ensureIndex(db.collection('activeVibes'), { location: '2dsphere' }, { name: 'active_vibes_location_2dsphere' })

  console.log('MongoDB indexes and TTL are ready.')
  if (uniqueConflicts) {
    console.error('Unique indexes were skipped for duplicate data. Merge duplicate accounts before production.')
    process.exitCode = 2
  }
} finally {
  await client.close()
}
