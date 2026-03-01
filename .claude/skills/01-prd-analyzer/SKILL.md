---
name: prd-analyzer
description: "Analyzes Product Requirements Documents (PRDs), feature specs, and requirement descriptions to extract structured project specifications. Use this skill whenever the user shares a PRD, feature description, requirements doc, user stories, or asks Claude to understand what needs to be built — even if they just paste text describing a product without calling it a PRD. Also triggers on: 'here's what I want to build', 'analyze this spec', 'extract requirements', 'what features do we need', 'break down this product idea', 'understand the requirements', or sharing any design screenshots alongside product goals."
allowed-tools: Read, WebFetch
---

# PRD Analyzer

## Purpose
Parses unstructured product requirements (text, screenshots, user stories, feature lists)
into a structured `PROJECT_SPEC.md` artifact. Surfaces ambiguities, maps data entities,
and sets priority levels so the system-planner skill can immediately begin architecture work.

## Inputs Required
Before executing, confirm you have:
- [ ] PRD text, feature description, or requirements document (pasted or linked)
- [ ] Design screenshots (optional — attach if available)
- [ ] Target user or persona (optional — infer if not stated)

## Instructions

### Step 1 — Parse the PRD
Read the full input once before extracting anything. Identify:
- What problem is being solved
- Who the primary actors (users/roles) are
- What the core user flows are
- What data needs to be persisted

### Step 2 — Extract Features with Priority
Assign each feature a priority:
- **P0** — Core loop. App is unusable without it.
- **P1** — High value. Users expect it on launch.
- **P2** — Nice to have. Post-MVP.

Assign complexity:
- **S** — < 1 day. Single component or simple CRUD.
- **M** — 1–3 days. Multi-component with state.
- **L** — 3–7 days. Cross-feature, complex state, auth.
- **XL** — > 1 week. Must be broken into sub-features.

### Step 3 — Map Data Entities
For each entity, draft a TypeScript interface. Keep it rough — db-schema skill refines it.

```typescript
// Draft only — db-schema skill will finalize
interface User {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}
```

### Step 4 — Flag Ambiguities
List every requirement that is:
- **Missing**: implied but not stated (e.g., "users can log in" — via what method?)
- **Contradictory**: two requirements conflict
- **Assumed**: you are making a reasonable assumption — state it explicitly

### Step 5 — Write PROJECT_SPEC.md
Use the template at `references/project-spec-template.md`.
Save as `PROJECT_SPEC.md` at project root.

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| Skip ambiguity flagging | List every open question | Hidden assumptions become bugs |
| Assign all features P0 | Ruthlessly prioritize | P0 = truly non-negotiable |
| Write implementation details | Stay at requirements level | system-planner handles architecture |
| Combine two user flows in one feature | One feature = one user goal | Atomic features are easier to plan |

## Quality Checklist
- [ ] Every feature has a priority (P0/P1/P2) and complexity (S/M/L/XL)
- [ ] Every data entity has a draft TypeScript interface
- [ ] Ambiguities section is non-empty (if PRD is perfect, question more)
- [ ] Out-of-scope section explicitly names what's NOT being built
- [ ] PROJECT_SPEC.md saved at project root

## Related Skills
- `system-planner`: Next step after PROJECT_SPEC.md — converts spec to architecture
- `task-generator`: Run after system-planner to break architecture into atomic tasks
- `design-extractor`: If design mockups were shared alongside the PRD

## Reference
See `references/project-spec-template.md` for the full output template.
