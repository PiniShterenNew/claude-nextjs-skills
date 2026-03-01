# Next.js Skills Project

## What This Project Is
A production-grade Next.js 15 application built with App Router, TypeScript strict
mode, and a feature-based architecture. Provides a full vertical slice per feature —
UI, state, data access, and types all colocated within the feature directory.

## Stack
- Next.js 15 — App Router, React Server Components by default
- TypeScript (strict)
- Tailwind CSS v3 + tailwind-merge + clsx
- Zustand — cross-feature global state
- TanStack Query v5 — server/async state, caching, mutations
- React Hook Form + Zod — form management and validation
- Prisma — ORM with PostgreSQL
- NextAuth v5 (Auth.js) — authentication and sessions
- Vitest + React Testing Library + Playwright — testing

## Commands
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run typecheck    # tsc --noEmit (run before marking tasks complete)
npm run lint         # ESLint
npm run test         # Vitest (unit + component)
npm run test:e2e     # Playwright end-to-end
npm run db:push      # Push Prisma schema to DB (dev only)
npm run db:migrate   # Run Prisma migrations (prod)
npm run db:studio    # Open Prisma Studio
```

## Architecture
Feature-based. Each feature owns its full vertical slice.
Read: agent_docs/feature-conventions.md

## Key Directories
- `src/features/`  — Feature modules (UI + state + API per feature)
- `src/shared/`    — Cross-feature components, hooks, lib, types
- `src/app/`       — Next.js routing ONLY (thin pages, import from features/)
- `agent_docs/`    — Extended docs for Claude (read on demand)

## Critical Rules
- NEVER import from one feature into another. Use `shared/` or events.
- NEVER hardcode colors — use design tokens (`text-primary`, `bg-surface`).
- NEVER use `any` type — use `unknown` + type guard.
- App Router: RSC by default — add `'use client'` only when needed.
- ALWAYS run `npm run typecheck` before marking any task complete.
- NEVER hard-delete user data — use soft delete (`deletedAt` timestamp).
- ALWAYS validate with Zod at the API/action boundary, never trust raw input.

## Extended Documentation
Read these files when relevant — do not load all at once:
- `agent_docs/architecture.md`          — Data flow, state ownership, rendering
- `agent_docs/feature-conventions.md`   — Feature folder structure + naming rules
- `agent_docs/commands.md`              — All CLI commands with explanations
- `agent_docs/gotchas.md`               — Project warnings and edge cases

## Skills Available
Run `/[skill-name]` or describe what you need — Claude loads skills automatically.

| Skill | Invoke On |
|-------|-----------|
| `/prd-analyzer` | Paste a PRD or requirements doc |
| `/system-planner` | Architecture or folder structure questions |
| `/task-generator` | Break down work into atomic tasks |
| `/design-extractor` | Share mockups or Figma screenshots |
| `/design-system` | Build base UI components or tokens |
| `/feature-architect` | Start a new feature module |
| `/component-builder` | Create any .tsx component |
| `/state-architect` | State design (store, query, URL) |
| `/data-layer` | Server Actions or API routes |
| `/db-schema` | Prisma schema or data modeling |
| `/auth-flow` | Auth, sessions, RBAC |
| `/realtime-layer` | WebSocket or SSE features |
| `/performance` | Bundle size, Core Web Vitals |
| `/testing` | Write tests (unit, component, E2E) |
| `/error-handling` | Error boundaries and API errors |
| `/type-system` | TypeScript type design |
| `/accessibility` | WCAG, ARIA, keyboard nav |
| `/env-config` | Environment variable setup |

Full skill list: `.claude/SKILLS_REGISTRY.md`
