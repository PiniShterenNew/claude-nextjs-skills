# Schema Patterns Reference

## Self-Referential (Tree Structure)

```prisma
model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique

  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")

  @@index([parentId])
  @@map("categories")
}
```

## Polymorphic (shared table via type column)

```prisma
model Notification {
  id         String           @id @default(cuid())
  createdAt  DateTime         @default(now())
  readAt     DateTime?

  type       NotificationType
  targetType String           // 'ORDER' | 'PRODUCT' | etc.
  targetId   String

  userId     String
  user       User             @relation(fields: [userId], references: [id])

  @@index([userId, readAt])
  @@index([targetType, targetId])
  @@map("notifications")
}

enum NotificationType {
  ORDER_SHIPPED
  COMMENT_REPLY
  MENTION
  SYSTEM
}
```

## Full-Text Search (PostgreSQL)

```prisma
model Product {
  id          String @id @default(cuid())
  name        String
  description String?

  // For PostgreSQL full-text search
  // searchVector Unsupported("tsvector")? — store computed tsvector
  @@map("products")
}
```

```typescript
// Using PostgreSQL full-text search via raw query
const results = await db.$queryRaw<Product[]>`
  SELECT * FROM products
  WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
    @@ plainto_tsquery('english', ${searchTerm})
    AND deleted_at IS NULL
  ORDER BY ts_rank(
    to_tsvector('english', name || ' ' || COALESCE(description, '')),
    plainto_tsquery('english', ${searchTerm})
  ) DESC
  LIMIT 20
`
```

## Audit Log (append-only history)

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())

  entity     String   // 'Product' | 'Order' | etc.
  entityId   String
  action     String   // 'CREATE' | 'UPDATE' | 'DELETE'
  changes    Json     // { before: {...}, after: {...} }

  actorId    String
  actor      User     @relation(fields: [actorId], references: [id])
  actorIp    String?

  @@index([entity, entityId])
  @@index([actorId])
  @@index([createdAt(sort: Desc)])
  @@map("audit_logs")
}
```

## Key-Value / Metadata Store

```prisma
model UserPreference {
  id      String @id @default(cuid())
  key     String
  value   Json

  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, key])
  @@index([userId])
  @@map("user_preferences")
}
```

## Multi-Tenant (tenant isolation via RLS)

```prisma
model Workspace {
  id   String @id @default(cuid())
  slug String @unique
  name String

  members WorkspaceMember[]
  products Product[]

  @@map("workspaces")
}

model WorkspaceMember {
  id          String        @id @default(cuid())
  role        WorkspaceRole @default(MEMBER)

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id])

  @@unique([workspaceId, userId])
  @@index([userId])
  @@map("workspace_members")
}

enum WorkspaceRole { OWNER ADMIN MEMBER }
```

## Prisma Client Extensions (global soft delete middleware)

```typescript
// src/shared/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const basePrisma = new PrismaClient()

// Extend with soft delete middleware
export const db = basePrisma.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        // Auto-inject deletedAt: null if model has deletedAt field
        args.where = { deletedAt: null, ...args.where }
        return query(args)
      },
      async findFirst({ args, query }) {
        args.where = { deletedAt: null, ...args.where }
        return query(args)
      },
      async findUnique({ args, query }) {
        // Can't easily inject for findUnique — handle per query or use findFirst
        return query(args)
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db as unknown as PrismaClient
```

## Common Seed Pattern

```typescript
// prisma/seed.ts
import { db } from '../src/shared/lib/prisma'

async function seed() {
  // Upsert to make seed idempotent
  const admin = await db.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const categories = await Promise.all(
    ['Electronics', 'Clothing', 'Books'].map((name) =>
      db.category.upsert({
        where: { slug: name.toLowerCase() },
        update: {},
        create: { name, slug: name.toLowerCase() },
      })
    )
  )

  console.log(`Seeded ${categories.length} categories`)
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
```
