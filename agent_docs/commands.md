# Commands Reference

## Development

```bash
npm run dev              # Start Next.js dev server with Turbopack
                         # Runs on http://localhost:3000
                         # Hot reload enabled

npm run build            # Production build
                         # Runs type checking + lint as part of build
                         # Fails hard on type errors

npm run start            # Start production server (after build)
```

## Code Quality

```bash
npm run typecheck        # tsc --noEmit — zero tolerance for errors
                         # ALWAYS run before marking a task complete

npm run lint             # ESLint with Next.js config
                         # Checks imports, hooks rules, a11y

npm run lint:fix         # ESLint with --fix (auto-fixable only)

npm run format           # Prettier — formats all src/ files

npm run format:check     # Prettier check (no writes) — used in CI
```

## Testing

```bash
npm run test             # Vitest — runs unit + component tests
npm run test:watch       # Vitest in watch mode (use during dev)
npm run test:coverage    # Vitest with coverage report (lcov + text)
npm run test:e2e         # Playwright — runs all .spec.ts files
npm run test:e2e:ui      # Playwright with UI mode (interactive)
npm run test:e2e:debug   # Playwright with debug mode
```

## Database

```bash
npm run db:push          # Push schema to DB without migration (dev only)
                         # Use for rapid iteration on schema

npm run db:migrate       # Create + apply migration (use for production)
                         # Generates migration file in prisma/migrations/

npm run db:migrate:dev   # Apply pending migrations in dev

npm run db:reset         # Drop DB + re-migrate + seed (destructive!)
                         # Only use in local dev

npm run db:seed          # Run prisma/seed.ts

npm run db:studio        # Open Prisma Studio at http://localhost:5555
                         # Visual DB browser

npm run db:generate      # Regenerate Prisma client after schema change
                         # Run after any schema.prisma edit
```

## Environment

```bash
cp .env.example .env.local   # Create local env file from template
                              # Fill in values before running dev server
```

Required env vars (see `src/shared/lib/env.ts` for full schema):
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — min 32 chars, use `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` in dev
- `NEXT_PUBLIC_APP_URL` — same as NEXTAUTH_URL in dev

## Code Generation

```bash
npx prisma generate          # Regenerate Prisma client (alias: npm run db:generate)
npx prisma format            # Format schema.prisma file
```

## Useful One-Liners

```bash
# Check for unused exports
npx ts-prune

# Check bundle size
npm run build && npx @next/bundle-analyzer

# Find large dependencies
npx cost-of-modules --no-install

# Run single test file
npm run test -- path/to/file.test.ts

# Run E2E for single spec
npm run test:e2e -- tests/e2e/feature.spec.ts
```

## CI Pipeline Order
```
1. npm run typecheck      # Must pass (zero errors)
2. npm run lint           # Must pass (zero warnings)
3. npm run test           # Must pass (all green)
4. npm run build          # Must succeed
5. npm run test:e2e       # Must pass (all green)
```
