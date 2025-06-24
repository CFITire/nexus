import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle cleanup on app shutdown
if (typeof window === 'undefined') {
  const cleanup = async () => {
    await prisma.$disconnect()
  }
  
  process.on('beforeExit', cleanup)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}