import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getAdapter = () => {
  const url = process.env.DATABASE_URL;
  if (!url || url === 'undefined' || url === 'null') return undefined;
  
  try {
    const libsql = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    // @ts-ignore
    return new PrismaLibSql(libsql);
  } catch (e) {
    console.warn("Failed to initialize libsql client:", e);
    return undefined;
  }
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter: getAdapter() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
