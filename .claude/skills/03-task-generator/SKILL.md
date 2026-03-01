---
name: task-generator
description: "Generates atomic, ordered development tasks from architecture documents. Use whenever the user wants to break down work into tasks, create a development plan, generate a task list, plan sprints, figure out what to build first, or after system-planner produces ARCHITECTURE.md. Also triggers on: 'what should I build first', 'give me a task list', 'break this down into steps', 'create a dev plan', 'what's the order of work', 'plan the implementation'."
allowed-tools: Read
---

# Task Generator

## Purpose
Converts architecture documents into atomic, dependency-ordered development tasks
that each fit within a single Claude Code session. Produces `TASKS.md` at project root.

## Inputs Required
Before executing, confirm you have:
- [ ] `ARCHITECTURE.md` and/or `FILE_TREE.md` (from system-planner)
- [ ] `PROJECT_SPEC.md` (from prd-analyzer) — for priority context
- [ ] `DATA_MODEL.md` — for schema task ordering

## Atomic Task Rules
- One task = **one file** OR one clearly bounded concern (e.g., "set up Prisma client")
- Must be completable in a single Claude Code session (< 2 hours, < 200 lines of code)
- Never combine schema design + implementation in one task
- Never combine backend + frontend in one task
- Every task has explicit, testable acceptance criteria (not "it works")
- Tasks ordered by dependency graph — no task assumes incomplete work from later tasks
- Every phase ends with a VERIFY task: "Run typecheck + lint"

## Task Format

```markdown
## TASK-[N]: [Action verb] [specific target]

**Skill**: [skill-name to use for this task]
**Phase**: [0-Foundation | 1-Infrastructure | 2-Feature | 3-Polish]
**Depends on**: [TASK-N, TASK-M | none]
**Inputs**: [specific files or context needed]
**Outputs**: [specific files or artifacts produced]

**Acceptance Criteria**:
- [ ] [Specific, testable — name the file or behavior]
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

**Complexity**: [S=<30min | M=30-90min | L=90-180min | XL=split this task]
**Web search needed**: [yes — reason | no]
```

## Phase Ordering

### Phase 0 — Foundation (run first, everything depends on this)
- tsconfig.json with path aliases (`@/*`)
- `src/shared/types/` — BaseEntity, ApiResponse, PaginationMeta
- `src/shared/lib/env.ts` — type-safe env validation
- `src/shared/lib/cn.ts` — tailwind-merge utility
- Design tokens: CSS custom properties + tailwind.config.ts
- Folder structure scaffold (empty index.ts files)

### Phase 1 — Infrastructure
- Prisma schema (all models, indexes, relations)
- Prisma client setup (`src/shared/lib/prisma.ts`)
- Database migration (initial)
- Auth setup (NextAuth config, middleware)
- Base UI components (Button, Input, Card, Badge, Typography)
- Global QueryClient provider
- Zustand store initialization

### Phase 2 — Features (P0 → P1 → P2)
For each feature, in order:
1. Types (`features/[f]/types/index.ts`)
2. Server Actions (`features/[f]/api/[f]Actions.ts`)
3. Query functions (`features/[f]/api/[f]Queries.ts`)
4. TanStack Query hooks (`features/[f]/hooks/use[F]Query.ts`)
5. Components — Page shell, List, Card, Form (one task each)
6. Route wiring (`app/[route]/page.tsx`)
7. Feature index.ts

### Phase 3 — Polish
- Error boundaries (error.tsx per route)
- Loading states (loading.tsx per route)
- Not-found pages (not-found.tsx)
- Performance: memoization audit, bundle analysis
- Tests: unit, component, E2E (one task per feature)
- Accessibility audit

## VERIFY Tasks
Insert a VERIFY task at the end of each phase:

```markdown
## TASK-[N]: VERIFY Phase [X] — Run quality checks

**Skill**: none
**Phase**: [X]-[name]
**Depends on**: [all tasks in this phase]

**Acceptance Criteria**:
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm run test` — all passing (Phase 3+)
- [ ] `npm run build` — succeeds (Phase 1+)

**Complexity**: S
**Web search needed**: no
```

## Instructions

### Step 1 — Read Architecture
Read `ARCHITECTURE.md`, `FILE_TREE.md`, `DATA_MODEL.md`, `PROJECT_SPEC.md`.

### Step 2 — Build Dependency Graph (mental model)
Map which tasks must complete before others can start.
Foundation → Infrastructure → Features (by priority) → Polish.

### Step 3 — Generate Tasks
Write one task per atomic unit of work. When a task is XL, split it.
Order tasks so Claude can execute them top-to-bottom without blockers.

### Step 4 — Write TASKS.md
Save at project root. Include:
- Summary table of all tasks (TASK-N | Phase | Skill | Complexity)
- Full task blocks in order
- VERIFY tasks at end of each phase

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| "Implement the entire auth system" | Split into: env setup, Prisma schema, NextAuth config, middleware, login page | Too large for one session |
| Acceptance criteria: "it works" | "User can sign in and sees /dashboard" | Untestable without specifics |
| Start Phase 2 before Phase 1 VERIFY | Always verify each phase before starting next | Propagating type errors breaks everything |
| Combine DB + UI in one task | Separate schema tasks from component tasks | Different concerns, different skills |

## Quality Checklist
- [ ] Every task fits in one Claude Code session (L is max, XL must be split)
- [ ] Every task has ≥ 2 acceptance criteria
- [ ] typecheck/lint in every task's criteria
- [ ] VERIFY tasks at end of each phase
- [ ] Tasks ordered so dependencies always precede dependents
- [ ] TASKS.md saved at project root

## Related Skills
- `system-planner`: Produces ARCHITECTURE.md that feeds this skill
- `feature-architect`: Scaffolds the folders this skill defines in tasks
- `db-schema`: Implements TASK-Phase1-Prisma tasks
- `component-builder`: Implements TASK-Phase2-Component tasks
