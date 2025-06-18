// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // При первом входе сохраняем токены и профиль
      if (account) {
        token.accessToken = account.access_token
        token.user = {
          name: profile?.name,
          email: profile?.email,
          image: (profile as any)?.picture || null,
        }
      }
      return token
    },
    async session({ session, token }) {
      // Добавляем кастомные поля в сессию
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string
      }
      if (token?.user) {
        session.user = token.user as typeof session.user
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // кастомная страница логина
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
