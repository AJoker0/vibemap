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
        // Отправляем данные на наш сервер для сохранения в MongoDB
        const response = await fetch('http://localhost:5000/auth/google-oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: user.id,
            email: user.email,
            name: user.name,
            avatar: user.image,
          }),
        })
        
        const result = await response.json()
        console.log('🔥 User saved to MongoDB:', result)
        
        return true
      } catch (error) {
        console.error('❌ Error saving user:', error)
        return true // Все равно разрешаем логин
      }
    },
  },
  // Убираем кастомные страницы - NextAuth будет использовать стандартные
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
