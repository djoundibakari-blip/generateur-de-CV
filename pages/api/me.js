import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.json({ authenticated: false, plan: PLANS.FREE.key, features: PLANS.FREE.features, creditsBalance: 0 })
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  })

  const plan = subscription?.plan ?? PLANS.FREE

  return res.json({
    authenticated: true,
    user: { name: session.user.name, email: session.user.email, image: session.user.image },
    plan: plan.key,
    features: plan.features,
    creditsBalance: subscription?.creditsBalance ?? 0,
  })
}
