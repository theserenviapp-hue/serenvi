let prisma: any;

try {
  const { PrismaClient } = require('@prisma/client');
  
  const globalForPrisma = global as unknown as { prisma: any };
  
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (e) {
  // Prisma client not initialized yet (e.g., during build)
  prisma = null;
}

export { prisma };
export default prisma;
