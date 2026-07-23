const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // lib/plans.js est en syntaxe ESM (utilisé par Next.js) — import dynamique depuis ce script CommonJS
  const { PLANS } = await import('../lib/plans.js')

  for (const plan of Object.values(PLANS)) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: {
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        monthlyCredits: plan.monthlyCredits,
        features: plan.features,
      },
      create: {
        key: plan.key,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        monthlyCredits: plan.monthlyCredits,
        features: plan.features,
      },
    })
  }
  console.log('Plans seedés :', Object.keys(PLANS).join(', '))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
