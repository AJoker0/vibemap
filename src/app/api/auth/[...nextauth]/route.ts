import NextAuth from 'next-auth'
import { authOptions } from '@/lib/nextauth-options'

// Only export route handlers to satisfy Next.js Route Module constraints
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
