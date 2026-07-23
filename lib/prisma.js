import { PrismaClient } from '@prisma/client'

// Évite de recréer une instance à chaque hot-reload en dev (Next.js réimporte les modules)
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
