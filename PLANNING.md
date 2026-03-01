# Stack Fingerprint

> **Note**: This is a greenfield repository. No existing Next.js project files were detected.
> Stack fingerprint below represents recommended modern defaults for a production Next.js app.
> Adjust any line before confirming.

ROUTER: App Router
NEXT_VERSION: 15.x (latest)
STYLING: Tailwind CSS v3 + tailwind-merge + clsx
STATE_GLOBAL: Zustand
STATE_SERVER: TanStack Query v5
STATE_FORM: React Hook Form + Zod resolver
ORM: Prisma
DB: PostgreSQL
API_STYLE: Server Actions (mutations) + Route Handlers (webhooks/external)
AUTH: NextAuth v5 (Auth.js)
REALTIME: WebSocket (optional / skip if not needed)
TESTING: Vitest + React Testing Library + Playwright
ARCHITECTURE: Feature-based (feature-per-directory with full vertical slice)

## Skills to Generate
All 18 skills apply to this stack. Full list:

01. prd-analyzer       — PRD/spec parsing → PROJECT_SPEC.md
02. system-planner     — Architecture decisions, file tree, data models
03. task-generator     — Atomic, ordered dev tasks from architecture docs
04. design-extractor   — Design tokens from mockups/Figma/screenshots
05. design-system      — CSS tokens + Tailwind config + base component library
06. feature-architect  — Feature folder scaffolding + boundary enforcement
07. component-builder  — Production RSC/Client components + accessibility
08. state-architect    — Zustand slices + TanStack Query + URL state decisions
09. data-layer         — Server Actions + Route Handlers + Zod validation
10. db-schema          — Prisma schema design + indexes + migrations
11. auth-flow          — NextAuth middleware + RBAC + session patterns
12. realtime-layer     — WebSocket/SSE with reconnect + React Query integration
13. performance        — Core Web Vitals + bundle + memoization + caching
14. testing            — Vitest unit + RTL component + MSW mocks + Playwright E2E
15. error-handling     — error.tsx + normalizeError + error boundaries
16. type-system        — Shared types + entity types + API response types
17. accessibility      — WCAG 2.1 AA + ARIA + keyboard + focus management
18. env-config         — Zod-validated type-safe env vars

## Skills to Skip
None — all 18 skills are relevant for this full-stack configuration.

## Custom Skills to Add
None identified at this time (no project-specific patterns detected yet).

## Files to Be Generated
```
CLAUDE.md
agent_docs/
  architecture.md
  feature-conventions.md
  commands.md
  gotchas.md
.claude/
  SKILLS_REGISTRY.md
  skills/
    01-prd-analyzer/
      SKILL.md
      references/project-spec-template.md
    02-system-planner/
      SKILL.md
      references/decision-matrices.md
    03-task-generator/
      SKILL.md
    04-design-extractor/
      SKILL.md
      references/design-tokens-template.md
    05-design-system/
      SKILL.md
    06-feature-architect/
      SKILL.md
    07-component-builder/
      SKILL.md
      references/component-patterns.md
    08-state-architect/
      SKILL.md
      references/query-patterns.md
    09-data-layer/
      SKILL.md
      references/api-patterns.md
    10-db-schema/
      SKILL.md
      references/schema-patterns.md
    11-auth-flow/
      SKILL.md
    12-realtime-layer/
      SKILL.md
    13-performance/
      SKILL.md
      references/performance-checklist.md
    14-testing/
      SKILL.md
    15-error-handling/
      SKILL.md
    16-type-system/
      SKILL.md
    17-accessibility/
      SKILL.md
      references/aria-patterns.md
    18-env-config/
      SKILL.md
```
