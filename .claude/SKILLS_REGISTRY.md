# Skills Registry

## How Claude Uses These Skills

Skills load automatically when semantically relevant (Claude matches your words to
skill descriptions). You can also invoke any skill manually:

```
/prd-analyzer          ← Run this skill explicitly
/component-builder     ← Even if you didn't type "component"
```

Claude loads only the frontmatter at startup (zero context cost for unused skills).
Full skill body loads only when the skill is active — this is progressive disclosure.

---

## Skill Map

| # | Skill | Invokes On | Web Access | Produces |
|---|-------|------------|------------|---------|
| 01 | `prd-analyzer` | PRD, feature spec, requirements, user stories, "what to build" | ✅ | `PROJECT_SPEC.md` |
| 02 | `system-planner` | architecture, structure, design, how to organize, system design | ✅ | `ARCHITECTURE.md`, `FILE_TREE.md`, `DATA_MODEL.md` |
| 03 | `task-generator` | tasks, plan, break down, sprint, what to build first, dev plan | ❌ | `TASKS.md` |
| 04 | `design-extractor` | mockups, Figma, screenshots, colors, design handoff | ✅ | `DESIGN_TOKENS.md` |
| 05 | `design-system` | tokens, colors, UI components, Tailwind config, base components | ❌ | `tokens.css`, `tailwind.config.ts`, `ui/` |
| 06 | `feature-architect` | new feature, scaffold, folder structure, new module, organize | ❌ | Feature folder scaffold |
| 07 | `component-builder` | component, .tsx, page, form, card, list, modal, layout, UI | ✅ | `.tsx` files |
| 08 | `state-architect` | state, store, query, where state, Zustand, TanStack, filters | ❌ | `store/`, `hooks/` |
| 09 | `data-layer` | API, server action, fetch data, CRUD, Route Handler, mutation | ✅ | `api/`, `actions.ts` |
| 10 | `db-schema` | database, model, schema, Prisma, migration, data modeling | ✅ | `schema.prisma`, migration |
| 11 | `auth-flow` | auth, login, logout, session, OAuth, RBAC, permissions, role | ✅ | `middleware.ts`, `lib/auth.ts` |
| 12 | `realtime-layer` | WebSocket, SSE, live update, real-time, push, notifications | ✅ | WS/SSE hooks |
| 13 | `performance` | performance, bundle, LCP, CLS, INP, slow, optimize, Lighthouse | ✅ | Config updates, analysis |
| 14 | `testing` | test, spec, unit, E2E, coverage, TDD, Vitest, Playwright | ❌ | `*.test.tsx`, `*.spec.ts` |
| 15 | `error-handling` | error, crash, boundary, failure, exception, error page | ❌ | `error.tsx`, `normalizeError` |
| 16 | `type-system` | TypeScript, types, interface, type-safe, type error, `any` | ❌ | `types/` |
| 17 | `accessibility` | a11y, ARIA, keyboard, WCAG, screen reader, focus, contrast | ✅ | Component updates |
| 18 | `env-config` | env, environment, .env, process.env, config, API key, secret | ❌ | `lib/env.ts`, `.env.example` |

---

## Common Skill Chains

### New Project from PRD
```
01 prd-analyzer
  ↓ PROJECT_SPEC.md
02 system-planner
  ↓ ARCHITECTURE.md + FILE_TREE.md + DATA_MODEL.md
03 task-generator
  ↓ TASKS.md (ordered task list)
04 design-extractor
  ↓ DESIGN_TOKENS.md
05 design-system
  ↓ tokens.css + tailwind.config.ts + base UI components
18 env-config
  ↓ lib/env.ts + .env.example
```

### New Feature (from scratch)
```
06 feature-architect    → folder scaffold
16 type-system          → entity + input types
10 db-schema            → Prisma model + migration
09 data-layer           → Server Actions + query functions
08 state-architect      → TanStack Query hooks (+ Zustand if needed)
07 component-builder    → Page + List + Card + Form components
14 testing              → unit + component + E2E tests
```

### Authenticated Feature
```
18 env-config     → NEXTAUTH_SECRET etc.
11 auth-flow      → NextAuth config + middleware + RBAC
09 data-layer     → auth() check in every action
07 component-builder → session-aware UI
```

### Database-Driven Feature
```
10 db-schema      → Prisma schema + migration
09 data-layer     → Server Actions + query fns
08 state-architect → TanStack Query hooks
07 component-builder → UI components
```

### Real-Time Feature
```
12 realtime-layer  → WebSocket/SSE hook + event types
08 state-architect → query cache invalidation strategy
07 component-builder → live-updating UI
```

### Quality Pass (any feature)
```
13 performance     → bundle + rendering audit
14 testing         → fill coverage gaps
15 error-handling  → error.tsx + error states
17 accessibility   → ARIA + keyboard + contrast audit
```

### Third-Party Integration (Stripe, Resend, etc.)
```
18 env-config     → validate new env vars
09 data-layer     → Route Handler for webhooks
15 error-handling → normalize third-party errors
```

---

## Skill File Locations

```
.claude/skills/
├── 01-prd-analyzer/
│   ├── SKILL.md
│   └── references/project-spec-template.md
├── 02-system-planner/
│   ├── SKILL.md
│   └── references/decision-matrices.md
├── 03-task-generator/
│   └── SKILL.md
├── 04-design-extractor/
│   ├── SKILL.md
│   └── references/design-tokens-template.md
├── 05-design-system/
│   └── SKILL.md
├── 06-feature-architect/
│   └── SKILL.md
├── 07-component-builder/
│   ├── SKILL.md
│   └── references/component-patterns.md
├── 08-state-architect/
│   ├── SKILL.md
│   └── references/query-patterns.md
├── 09-data-layer/
│   ├── SKILL.md
│   └── references/api-patterns.md
├── 10-db-schema/
│   ├── SKILL.md
│   └── references/schema-patterns.md
├── 11-auth-flow/
│   └── SKILL.md
├── 12-realtime-layer/
│   └── SKILL.md
├── 13-performance/
│   ├── SKILL.md
│   └── references/performance-checklist.md
├── 14-testing/
│   └── SKILL.md
├── 15-error-handling/
│   └── SKILL.md
├── 16-type-system/
│   └── SKILL.md
├── 17-accessibility/
│   ├── SKILL.md
│   └── references/aria-patterns.md
└── 18-env-config/
    └── SKILL.md
```
