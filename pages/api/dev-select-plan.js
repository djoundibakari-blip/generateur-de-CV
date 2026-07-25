import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'

// Simule l'activation d'un plan sans paiement réel (phase de test — à remplacer par
// un vrai webhook Stripe checkout.session.completed avant un lancement public).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) return res.status(401).json({ error: 'AUTH_REQUIRED' })

  const { planKey } = req.body ?? {}
  if (!PLANS[planKey]) return res.status(400).json({ error: 'Plan inconnu' })

  const plan = await prisma.plan.findUnique({ where: { key: planKey } })
  if (!plan) return res.status(500).json({ error: 'Plan non seedé en base' })

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: { planId: plan.id, creditsBalance: plan.monthlyCredits, status: 'active' },
    create: { userId: session.user.id, planId: plan.id, creditsBalance: plan.monthlyCredits, status: 'active' },
  })

  await prisma.creditLedger.create({
    data: { userId: session.user.id, action: 'renewal', delta: plan.monthlyCredits },
  })

  return res.json({ ok: true, plan: planKey })
}
