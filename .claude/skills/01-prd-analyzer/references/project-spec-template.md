# PROJECT_SPEC.md Template

Copy this template when running the prd-analyzer skill. Fill every section.

---

# PROJECT_SPEC.md

## Overview
**Product name**: [name]
**Purpose**: [1-2 sentences — what problem does this solve?]
**Target users**: [primary persona + secondary if relevant]
**Success metrics**: [How will we know this is working? e.g., "Users complete onboarding in < 2 min"]

## Actors & Roles

| Actor | Description | Permissions Summary |
|-------|-------------|---------------------|
| Guest | Unauthenticated visitor | Read-only public pages |
| User | Authenticated standard user | CRUD on own resources |
| Admin | Platform administrator | Full access |
| [Role] | [Description] | [Permissions] |

## Features

| Feature | Priority | Complexity | Entities Touched | Core User Flow |
|---------|----------|------------|-----------------|----------------|
| [name] | P0 | M | User, Product | User searches → adds to cart → checks out |
| [name] | P1 | S | User | User updates profile photo |
| [name] | P2 | L | Order, Notification | Admin views order analytics |

## Data Entities (Draft)

> These are rough — db-schema skill will finalize with Prisma models, indexes, and relations.

```typescript
interface [EntityName] {
  id: string           // cuid()
  createdAt: string    // ISO string
  updatedAt: string    // ISO string
  deletedAt: string | null  // soft delete

  // domain fields
  name: string
  status: '[STATUS_A]' | '[STATUS_B]'
  ownerId: string      // FK to User
}
```

## User Flows (P0 features)

### [Flow Name]
1. User arrives at [entry point]
2. User [action]
3. System [response]
4. User [next action]
5. Success: [outcome]
6. Error: [failure path]

## Non-Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
| Performance | LCP < 2.5s on 4G mobile | P0 |
| Performance | API responses < 200ms p95 | P1 |
| Security | Auth required for all /app routes | P0 |
| Security | Input validation on all mutations | P0 |
| Accessibility | WCAG 2.1 AA compliance | P1 |
| i18n | English only (MVP) | — |
| Availability | 99.9% uptime | P1 |

## Ambiguities & Open Questions

| # | Question | Impact | Default Assumption |
|---|----------|--------|-------------------|
| 1 | How do users authenticate? (email/password, OAuth, magic link?) | Auth architecture | Email/password + Google OAuth |
| 2 | Is email verification required on signup? | Onboarding flow | Yes — unverified users see limited UI |
| 3 | [Question] | [Impact] | [Assumption if we proceed without answer] |

## Explicitly Out of Scope (MVP)
- [Feature that was mentioned but deferred]
- [Integration that would be nice but isn't P0]
- [Platform: mobile app, desktop app, etc.]

## Open Decisions for Architecture Review
These require a decision before system-planner runs:
- [ ] Real-time updates: WebSocket vs polling vs SSE?
- [ ] File uploads: direct-to-S3 vs through server?
- [ ] Email: transactional service? (Resend, SendGrid, Postmark)
- [ ] [Decision]
