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
    async jwt({ token, account, user }) {
      // При первом логине сохраняем данные пользователя
      if (account && user) {
        console.log('🔥 New user login:', user)
        token.accessToken = account.access_token
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Передаем данные в сессию
      if (session.user) {
        session.accessToken = token.accessToken as string
        session.user.id = token.userId as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Здесь можем сохранить пользователя в нашу базу данных
      console.log('🔥 Google sign in:', { user, account, profile })
      
      try {
        // Создаем/проверяем пользователя через специальный API
        const baseUrl =
          process.env.NEXTAUTH_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        const response = await fetch(`${baseUrl}/api/users/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            avatar: user.image,
            googleId: user.id,
          }),
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.exists) {
            console.log('🔥 Existing user found:', result.username)
          } else {
            console.log('🎯 New user created with username:', result.username)
          }
        }
        
        return true
      } catch (error) {
        console.error('❌ Error checking/creating user profile:', error)
        return true // Все равно разрешаем логин
      }
    },
  },
  // Убираем кастомные страницы - NextAuth будет использовать стандартные
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
