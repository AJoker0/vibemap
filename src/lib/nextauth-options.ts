import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Centralized NextAuth options to avoid exporting extra symbols from route modules
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = (account as any).access_token
        token.userId = (user as any).id
        token.email = (user as any).email
        token.name = (user as any).name
        token.picture = (user as any).image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session as any).accessToken = token.accessToken as string
        ;(session.user as any).id = token.userId as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Create/check user profile in our DB via internal API
      try {
        const baseUrl =
          process.env.NEXTAUTH_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        const response = await fetch(`${baseUrl}/api/users/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: (user as any).email,
            name: (user as any).name,
            avatar: (user as any).image,
            googleId: (user as any).id,
          }),
        })

        if (response.ok) {
          // We only log server-side; no need to return data
          await response.json().catch(() => null)
        }
        return true
      } catch (error) {
        console.error('❌ Error checking/creating user profile:', error)
        return true // still allow login
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
