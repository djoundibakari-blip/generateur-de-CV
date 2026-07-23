import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

// email → plan pour les 2 comptes de test (phase Vercel de test, pas de vrais utilisateurs Google)
const TEST_ACCOUNTS = {
  [process.env.TEST_USER_EMAIL]: 'FREE',
  [process.env.ADMIN_USER_EMAIL]: 'PREMIUM',
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Connexion email/mot de passe réservée aux 2 comptes de test — à retirer avant un vrai lancement public
    CredentialsProvider({
      id: 'dev-login',
      name: 'Compte de test',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const planKey = TEST_ACCOUNTS[credentials?.email]
        if (!planKey || credentials.password !== process.env.TEST_LOGIN_PASSWORD) return null

        const plan = await prisma.plan.findUnique({ where: { key: planKey } })
        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: {},
          create: {
            email: credentials.email,
            name: planKey === 'PREMIUM' ? 'Admin (test)' : 'Utilisateur (test)',
          },
        })

        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: { planId: plan.id, creditsBalance: planKey === 'PREMIUM' ? 999 : plan.monthlyCredits, status: 'active' },
          create: {
            userId: user.id,
            planId: plan.id,
            creditsBalance: planKey === 'PREMIUM' ? 999 : plan.monthlyCredits,
            status: 'active',
          },
        })

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  // Le Credentials Provider impose les sessions JWT (pas de sessions "database" possible avec NextAuth v4)
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
  events: {
    // Nouveau compte Google → abonnement Gratuit par défaut (0 crédit, aucune feature IA)
    // (les comptes de test passent par authorize() ci-dessus, pas par cet event)
    async createUser({ user }) {
      const freePlan = await prisma.plan.findUnique({ where: { key: PLANS.FREE.key } })
      if (!freePlan) return
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: 'active',
          creditsBalance: freePlan.monthlyCredits,
        },
      })
    },
  },
}

export default NextAuth(authOptions)
