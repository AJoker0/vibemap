import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config({ path: '.env.local' })
config()

const apply = process.argv.includes('--apply')
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibemap')

try {
  await client.connect()
  const db = client.db('vibemap')
  const users = await db.collection('users').find({}).toArray()
  const groups = new Map()

  for (const user of users) {
    if (!user.email) continue
    const group = groups.get(user.email) || []
    group.push(user)
    groups.set(user.email, group)
  }

  const duplicates = [...groups.entries()].filter(([, group]) => group.length > 1)
  if (!duplicates.length) {
    console.log('No duplicate account emails found.')
    process.exit(0)
  }

  for (const [email, group] of duplicates) {
    const profiles = await db.collection('profiles').find({ email }).toArray()
    const primary = group.find((user) => profiles.some((profile) => profile.userId === user._id.toString())) || group[0]
    const secondary = group.filter((user) => user._id.toString() !== primary._id.toString())
    const merged = Object.assign({}, ...secondary, primary)

    console.log(`${apply ? 'Merging' : 'Would merge'} ${email}: ${secondary.length} duplicate(s) into ${primary._id}`)
    if (!apply) continue

    await db.collection('users').updateOne({ _id: primary._id }, {
      $set: {
        ...(merged.googleId ? { googleId: merged.googleId } : {}),
        ...(merged.passwordHash ? { passwordHash: merged.passwordHash } : {}),
        ...(merged.name ? { name: merged.name } : {}),
        ...(merged.avatar ? { avatar: merged.avatar } : {}),
      },
    })

    for (const duplicate of secondary) {
      const oldId = duplicate._id.toString()
      const newId = primary._id.toString()
      await db.collection('profiles').updateMany({ userId: oldId }, { $set: { userId: newId } })
      await db.collection('visits').updateMany({ userId: oldId }, { $set: { userId: newId } })
      await db.collection('activeVibes').updateMany({ userId: oldId }, { $set: { userId: newId } })
      await db.collection('friends').updateMany({ fromUserId: oldId }, { $set: { fromUserId: newId } })
      await db.collection('friends').updateMany({ toUserId: oldId }, { $set: { toUserId: newId } })
      await db.collection('users').deleteOne({ _id: duplicate._id })
    }
  }

  if (!apply) console.log('Dry run only. Re-run with --apply to merge these accounts.')
} finally {
  await client.close()
}
