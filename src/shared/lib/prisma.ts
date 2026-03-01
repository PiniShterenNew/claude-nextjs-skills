import { PrismaClient } from '@prisma/client'

// Models that have a deletedAt field (soft-delete enabled)
const SOFT_DELETE_MODELS = new Set<string>([
  'User',
  'Workspace',
  'Ingredient',
  'Recipe',
])

const SOFT_DELETE_READ_OPERATIONS = new Set<string>([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
])

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (
            model &&
            SOFT_DELETE_MODELS.has(model) &&
            SOFT_DELETE_READ_OPERATIONS.has(operation)
          ) {
            const typedArgs = args as { where?: Record<string, unknown> }
            typedArgs.where ??= {}

            if (typedArgs.where['deletedAt'] === undefined) {
              typedArgs.where['deletedAt'] = null
            }
          }

          return query(args)
        },
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

// Global singleton — prevents multiple instances during Next.js hot reload in dev
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
