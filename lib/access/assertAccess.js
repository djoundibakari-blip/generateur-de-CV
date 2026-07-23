import { prisma } from '@/lib/prisma'
import { PLANS, planForFeature } from '@/lib/plans'

export class AccessError extends Error {
  constructor(code, extra = {}) {
    super(code)
    this.code = code // 'AUTH_REQUIRED' | 'UPGRADE_REQUIRED' | 'CREDITS_EXHAUSTED'
    Object.assign(this, extra)
  }
}

export function accessErrorResponse(err) {
  return {
    error: err.code,
    requiredPlan: err.requiredPlan ?? null,
    feature: err.feature ?? null,
  }
}

/**
 * Vérifie qu'un utilisateur authentifié a accès à `featureKey` sur son plan actuel,
 * puis décrémente 1 crédit de façon atomique. Lève une AccessError sinon.
 */
export async function assertAccess(session, featureKey) {
  if (!session?.user?.id) {
    throw new AccessError('AUTH_REQUIRED', { feature: featureKey })
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  })

  const planKey = subscription?.plan?.key ?? 'FREE'
  const planFeatures = subscription?.plan?.features ?? PLANS.FREE.features

  if (!planFeatures.includes(featureKey)) {
    const requiredPlan = planForFeature(featureKey)
    throw new AccessError('UPGRADE_REQUIRED', { requiredPlan: requiredPlan?.key, feature: featureKey })
  }

  // Décrément atomique : évite qu'une race condition ne fasse passer le solde en négatif
  const result = await prisma.subscription.updateMany({
    where: { userId: session.user.id, creditsBalance: { gt: 0 } },
    data: { creditsBalance: { decrement: 1 } },
  })

  if (result.count === 0) {
    throw new AccessError('CREDITS_EXHAUSTED', { feature: featureKey })
  }

  await prisma.creditLedger.create({
    data: { userId: session.user.id, action: featureKey, delta: -1 },
  })

  return { planKey }
}
