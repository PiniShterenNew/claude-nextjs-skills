---
name: auth-flow
description: "Implements authentication and authorization for Next.js using NextAuth v5 (Auth.js). Covers route protection via middleware, RBAC, session access in Server Components and Client Components, and protecting Server Actions and API routes. Use when setting up auth, protecting routes, implementing login/logout, checking user permissions, implementing role-based access control, or when the user mentions login, signup, sign in, sign out, sessions, JWT, OAuth, magic link, credentials, or access control."
allowed-tools: Read, WebFetch
---

# Auth Flow

## Purpose
Implements complete authentication and authorization: NextAuth v5 setup, middleware
route protection, RBAC with type-safe permissions, and session access patterns
for RSC, Client Components, Server Actions, and Route Handlers.

## Inputs Required
Before executing, confirm you have:
- [ ] Auth providers needed (Google OAuth, GitHub, email/password, magic link)
- [ ] `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `.env.local`
- [ ] User model in Prisma schema (email, role, etc.)
- [ ] Protected vs public route list

## Step 1 — Install

```bash
npm install next-auth@beta @auth/prisma-adapter
```

## Step 2 — Auth Config

```typescript
// src/shared/lib/auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from './prisma'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: Role
      image: string | null
    }
  }
  interface User {
    role: Role
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' }, // use 'database' if you need server-side invalidation

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email, deletedAt: null },
        })
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
```

## Step 3 — Route Handler (required)

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/shared/lib/auth'
export const { GET, POST } = handlers
```

## Step 4 — Middleware (route protection)

```typescript
// middleware.ts (project root)
import { auth } from '@/shared/lib/auth'
import { NextResponse } from 'next/server'

// Routes that don't require auth
const PUBLIC_PATHS = ['/', '/login', '/signup', '/about', '/pricing']
// Routes that redirect authenticated users away
const AUTH_ONLY_PATHS = ['/login', '/signup']

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = Boolean(req.auth)
  const path = nextUrl.pathname

  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  )
  const isAuthOnly = AUTH_ONLY_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  )

  // Redirect authenticated users away from login/signup
  if (isAuthenticated && isAuthOnly) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

## Step 5 — RBAC

```typescript
// src/shared/lib/permissions.ts
import type { Role } from '@prisma/client'

export type Permission =
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  | 'product:view'
  | 'user:manage'
  | 'admin:access'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'product:create', 'product:update', 'product:delete', 'product:view',
    'user:manage', 'admin:access',
  ],
  MANAGER: ['product:create', 'product:update', 'product:view'],
  USER: ['product:view'],
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Server-side permission check (use in Server Actions)
export async function requirePermission(permission: Permission) {
  const { auth } = await import('./auth')
  const session = await auth()
  if (!session?.user) {
    throw new Error('UNAUTHORIZED')
  }
  if (!can(session.user.role, permission)) {
    throw new Error('FORBIDDEN')
  }
  return session
}
```

## Session Access Patterns

### In Server Component (RSC)
```typescript
import { auth } from '@/shared/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return <div>Hello, {session.user.name}</div>
}
```

### In Server Action
```typescript
'use server'
import { auth } from '@/shared/lib/auth'
import { can } from '@/shared/lib/permissions'
import { API_ERRORS } from '@/shared/types/api'

export async function deleteProductAction(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: API_ERRORS.UNAUTHORIZED }
  if (!can(session.user.role, 'product:delete')) {
    return { success: false, error: API_ERRORS.FORBIDDEN }
  }
  // ... proceed
}
```

### In Client Component
```typescript
'use client'
import { useSession } from 'next-auth/react'

function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Skeleton className="h-8 w-8 rounded-full" />
  if (!session) return <Link href="/login">Sign in</Link>

  return <p>Welcome, {session.user.name}</p>
}
```

### In Route Handler
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/shared/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // proceed
}
```

## Session Provider (for Client Components)

```typescript
// src/shared/providers/AuthProvider.tsx
'use client'
import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/shared/providers/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| DB calls in middleware | Only use `req.auth` (from JWT) | Middleware runs on edge |
| Expose session.user.passwordHash | Use `select` to exclude | Security |
| Client-side permission check only | Server-side check in action | Client checks are bypassable |
| Check role by string comparison | Use `can()` helper | Centralized, type-safe |
| `useSession()` in RSC | `auth()` from `@/shared/lib/auth` | RSC has server-only access |

## Quality Checklist
- [ ] `NEXTAUTH_SECRET` (min 32 chars) set in env
- [ ] `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` set (if using Google)
- [ ] Route handler created at `app/api/auth/[...nextauth]/route.ts`
- [ ] Middleware protects all non-public routes
- [ ] `session.user.id` and `session.user.role` accessible via callbacks
- [ ] RBAC `can()` function used in all mutations
- [ ] `npm run typecheck` passes

## Related Skills
- `env-config`: Set up type-safe env vars for NEXTAUTH_SECRET etc.
- `data-layer`: Use `auth()` + `can()` at the top of every Server Action
- `db-schema`: User model needs `email`, `role`, optional `passwordHash`
