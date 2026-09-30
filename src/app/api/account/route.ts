import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth-options'
import { connectToDatabase } from '@/lib/mongodb'

export async function DELETE() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { db } = await connectToDatabase()
  const user = await db.collection('users').findOne({ email })
  const userIds = [email, user?._id?.toString()].filter(Boolean)

  await Promise.all([
    db.collection('users').deleteMany({ email }),
    db.collection('profiles').deleteMany({ $or: [{ email }, { userId: { $in: userIds } }] }),
    db.collection('visits').deleteMany({ $or: [{ userEmail: email }, { userId: { $in: userIds } }] }),
    db.collection('activeVibes').deleteMany({ userId: { $in: userIds } }),
    db.collection('friends').deleteMany({ $or: [{ fromUserId: { $in: userIds } }, { toUserId: { $in: userIds } }] }),
  ])

  return NextResponse.json({ success: true })
}
