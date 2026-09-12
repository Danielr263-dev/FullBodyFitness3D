import { PrismaClient } from '@prisma/client'

// One shared instance so we're not opening a new connection pool per request.
export const prisma = new PrismaClient()
