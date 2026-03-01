---
name: env-config
description: "Sets up type-safe environment variable validation using Zod for Next.js projects. Prevents runtime crashes from missing or malformed env vars by validating at startup. Use when adding new environment variables, configuring third-party services, setting up API keys, or when the user mentions .env files, environment configuration, process.env, missing env vars, or asks how to configure any external service."
allowed-tools: Read
---

# Env Config

## Purpose
Creates a single, centralized, Zod-validated environment configuration module.
Any missing or invalid env var causes an immediate, clear error at startup —
never a cryptic `Cannot read property of undefined` at runtime.

## Inputs Required
Before executing, confirm you have:
- [ ] List of env vars needed (service credentials, URLs, secrets)
- [ ] `.env.example` file to be created/updated
- [ ] Knowledge of which vars are server-only vs client-safe

## Server vs Client Rules

```
Server-only (NO NEXT_PUBLIC_ prefix):
  → Never included in client JS bundle
  → Available in: RSC, Server Actions, Route Handlers, middleware
  → Include: DB URLs, auth secrets, API secret keys, email credentials

Client-safe (MUST have NEXT_PUBLIC_ prefix):
  → Embedded in client JS bundle at BUILD TIME
  → Available everywhere (RSC + Client Components)
  → Include: public app URL, analytics IDs, public API keys, WS URL
  → NEVER include secrets here
```

## Implementation

```typescript
// src/shared/lib/env.ts
import { z } from 'zod'

// ── Schema ─────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // ── Server-only (no NEXT_PUBLIC_) ─────────────────────────────────────

  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Authentication (NextAuth v5)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // OAuth providers (optional — only validate if OAUTH_ENABLED)
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  // Email (optional)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // File storage (optional)
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ── Client-safe (NEXT_PUBLIC_ prefix required) ────────────────────────

  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
})

// ── Validation ─────────────────────────────────────────────────────────────

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n')

    // Throw at app startup — fail fast, fail loud
    throw new Error(
      `\n\n❌ Invalid environment variables:\n${errors}\n\n` +
      `Fix these in your .env.local file. See .env.example for reference.\n`
    )
  }

  return result.data
}

// Export validated, typed env — use this everywhere instead of process.env
export const env = validateEnv()
```

## .env.example (always commit this)

```bash
# .env.example
# Copy to .env.local and fill in your values

# ── Database ──────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp"

# ── Authentication ────────────────────────────────────────────────────────
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-char-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# ── Email ─────────────────────────────────────────────────────────────────
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# ── Storage ───────────────────────────────────────────────────────────────
BLOB_READ_WRITE_TOKEN=""

# ── Payments ─────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ── Client-safe (NEXT_PUBLIC_ prefix) ─────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

## Usage Throughout the App

```typescript
// ✅ Always use env (not process.env directly)
import { env } from '@/shared/lib/env'

// In Server Action or server-only code
const dbUrl = env.DATABASE_URL      // TypeScript knows this is string

// In Route Handler
const secret = env.NEXTAUTH_SECRET  // TypeScript knows this is string

// Client-safe vars are available in Client Components too
// (but import env.ts only in server contexts — use NEXT_PUBLIC_ vars directly
//  in client contexts to avoid bundling server vars accidentally)

// In Client Component — use process.env directly for NEXT_PUBLIC_ vars
const wsUrl = process.env.NEXT_PUBLIC_WS_URL  // Always string | undefined
```

## Server-Only Guard

```typescript
// src/shared/lib/prisma.ts (and any other server-only module)
import 'server-only'  // Throws if accidentally imported in client bundle
import { env } from './env'

// ...
```

## Conditional Validation

```typescript
// For optional services — validate only when the service is configured
const envSchema = z.object({
  // Stripe is optional — but if SECRET_KEY set, WEBHOOK_SECRET must also be set
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
}).refine(
  (data) => !data.STRIPE_SECRET_KEY || data.STRIPE_WEBHOOK_SECRET,
  {
    message: 'STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET_KEY is set',
    path: ['STRIPE_WEBHOOK_SECRET'],
  }
)
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `process.env.DATABASE_URL!` | `env.DATABASE_URL` | Non-null assertion hides missing vars |
| Secret in `NEXT_PUBLIC_` var | Server-only var | Exposed in client bundle |
| `process.env.X` scattered everywhere | `env.X` from central module | Single validation point |
| Commit `.env.local` | Add to `.gitignore`, commit `.env.example` | Security |
| Skip `.env.example` | Always maintain it | Onboarding new devs |

## Quality Checklist
- [ ] `src/shared/lib/env.ts` created with Zod schema
- [ ] All env vars documented in `.env.example`
- [ ] `.env.local` added to `.gitignore`
- [ ] Server-only modules import `'server-only'`
- [ ] No secrets in `NEXT_PUBLIC_` vars
- [ ] App fails at startup (not runtime) for missing required vars
- [ ] `npm run typecheck` passes

## Related Skills
- `auth-flow`: Uses `NEXTAUTH_SECRET`, `AUTH_GOOGLE_ID`, etc.
- `db-schema`: Uses `DATABASE_URL`
- `realtime-layer`: Uses `NEXT_PUBLIC_WS_URL`
