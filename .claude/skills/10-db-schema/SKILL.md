---
name: db-schema
description: "Designs and implements database schemas using Prisma ORM. Covers model design, relationships, indexes, soft delete, audit fields, migration strategy, and query optimization. Use when designing data models, creating or editing Prisma schema, planning database structure, writing migrations, adding relationships between entities, or when the user asks about data modeling, persistence, or database design."
allowed-tools: Read, WebFetch, Bash
---

# DB Schema

## Purpose
Designs production-ready Prisma schemas with correct indexes, soft delete, audit
fields, and relationships. Generates the migration and verifies the Prisma client
compiles without errors.

## Inputs Required
Before executing, confirm you have:
- [ ] Entity list from `DATA_MODEL.md` or `PROJECT_SPEC.md`
- [ ] Relationship map (one-to-many, many-to-many)
- [ ] `DATABASE_URL` set in `.env.local`

## Prisma Setup

```typescript
// src/shared/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

## Base Model Convention

Every model follows this pattern:

```prisma
model ModelName {
  // ---- Identity ----
  id          String    @id @default(cuid())   // cuid() — shorter, URL-safe vs uuid()
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?                          // Soft delete — NEVER hard-delete user data

  // ---- Audit ----
  createdById String
  createdBy   User      @relation("ModelCreatedBy", fields: [createdById], references: [id])

  // ---- Domain fields ----
  name        String
  status      ModelStatus @default(DRAFT)

  // ---- Relations ----
  // (define here)

  // ---- Indexes ----
  @@index([status])                   // Every common WHERE field
  @@index([createdById])
  @@index([createdAt(sort: Desc)])    // Pagination default sort
  @@index([deletedAt])                // Soft delete filter
  @@map("model_name")                  // snake_case table name
}
```

## Full Schema Example

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Enums ──────────────────────────────────────────────────────────────────

enum Role {
  ADMIN
  MANAGER
  USER
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

// ── Models ─────────────────────────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  email     String   @unique
  name      String?
  role      Role     @default(USER)
  avatarUrl String?

  // Relations
  products  Product[] @relation("ProductCreatedBy")
  orders    Order[]

  @@index([email])
  @@index([role])
  @@index([deletedAt])
  @@map("users")
}

model Product {
  id          String        @id @default(cuid())
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  name        String
  description String?
  price       Decimal       @db.Decimal(10, 2) // Use Decimal for money — never Float
  status      ProductStatus @default(DRAFT)
  imageUrl    String?

  // Relations
  createdById String
  createdBy   User          @relation("ProductCreatedBy", fields: [createdById], references: [id])
  categoryId  String
  category    Category      @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]

  @@index([status])
  @@index([createdById])
  @@index([categoryId])
  @@index([createdAt(sort: Desc)])
  @@index([deletedAt])
  @@index([name])                    // If search by name is common
  @@map("products")
}

model Category {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  name      String    @unique
  slug      String    @unique

  products  Product[]

  @@index([slug])
  @@map("categories")
}

// Many-to-many via explicit join model (preferred over implicit @relation)
model Order {
  id          String      @id @default(cuid())
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)

  userId      String
  user        User        @relation(fields: [userId], references: [id])
  items       OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([deletedAt])
  @@map("orders")
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## Migration Commands

```bash
# Development — push schema directly (no migration file)
npm run db:push

# Development — create a named migration
npx prisma migrate dev --name add_product_status

# Production — apply pending migrations
npx prisma migrate deploy

# After schema changes — always regenerate client
npm run db:generate
```

## Query Patterns (with soft delete)

```typescript
// ALWAYS include deletedAt: null in WHERE clause
const products = await db.product.findMany({
  where: {
    deletedAt: null,                    // ← Never forget this
    status: 'ACTIVE',
    categoryId: 'cat_xyz',
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0,
  select: {
    id: true,
    name: true,
    price: true,
    status: true,
    category: { select: { name: true, slug: true } },
  },
})
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `Float` for money | `Decimal @db.Decimal(10,2)` | Float precision errors |
| `uuid()` for ID | `cuid()` | cuid is shorter, URL-safe, monotonic |
| Missing `@@index` | Index every common WHERE field | Slow queries at scale |
| Hard delete | Soft delete with `deletedAt` | Data recovery, compliance |
| Skip `@@map` | Always snake_case table names | DB convention |
| Implicit many-to-many | Explicit join model | Add metadata, easier to query |
| `prisma db push` in production | `prisma migrate deploy` | Schema drift |

## Quality Checklist
- [ ] Every model has `id`, `createdAt`, `updatedAt`, `deletedAt`
- [ ] Every model has `@@map` with snake_case table name
- [ ] Every common WHERE field has an `@@index`
- [ ] Money fields use `Decimal @db.Decimal(10, 2)` (never Float)
- [ ] `npm run db:generate` runs without errors
- [ ] `npm run typecheck` passes (Prisma types are generated correctly)

## Related Skills
- `data-layer`: Writes queries against this schema
- `type-system`: TypeScript entity types match the Prisma models
- `auth-flow`: User model must support session fields

## Reference
See `references/schema-patterns.md` for full-text search, self-referential, and polymorphic patterns.
