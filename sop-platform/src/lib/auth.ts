import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    // ============================================
    // GOOGLE AUTH - Uncomment when ready to use
    // Add to .env:
    //   GOOGLE_CLIENT_ID="your-client-id"
    //   GOOGLE_CLIENT_SECRET="your-client-secret"
    // ============================================
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       hd: 'sumedhainfra.com', // Restrict to company domain
    //     },
    //   },
    // }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.emailVerified || !user.isActive) return null
        if (!user.password) return null // Google-only users can't use credentials

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          departmentId: user.departmentId,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    // ============================================
    // GOOGLE AUTH CALLBACK - Uncomment with GoogleProvider
    // ============================================
    // async signIn({ user, account }) {
    //   if (account?.provider === 'google') {
    //     const email = user.email!
    //     // Only allow company domain
    //     if (!email.endsWith('@sumedhainfra.com')) return false
    //
    //     const existing = await prisma.user.findUnique({ where: { email } })
    //     if (existing) {
    //       if (!existing.isActive) return false // blocked user
    //       // Update profile pic
    //       await prisma.user.update({
    //         where: { email },
    //         data: { image: user.image, emailVerified: true },
    //       })
    //     } else {
    //       // Auto-create user on first Google sign-in
    //       await prisma.user.create({
    //         data: {
    //           email,
    //           name: user.name || email.split('@')[0],
    //           image: user.image,
    //           role: 'USER',
    //           emailVerified: true,
    //           isActive: true,
    //         },
    //       })
    //     }
    //   }
    //   return true
    // },

    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.departmentId = (user as any).departmentId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).departmentId = token.departmentId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}
