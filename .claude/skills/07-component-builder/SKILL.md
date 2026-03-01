---
name: component-builder
description: "Builds production-ready React components for Next.js App Router. Handles RSC vs Client Component decisions, TypeScript types, accessibility, loading/error states, and composability. Use when creating any .tsx file — pages, layouts, components, forms, cards, lists, modals, tables, dropdowns, or any UI element whatsoever. Also triggers on: 'build a component', 'create a page', 'make a form', 'add a modal', 'implement this UI', 'build the list view', 'create the card'."
allowed-tools: Read, WebFetch
---

# Component Builder

## Purpose
Creates production-grade React components: correct RSC/Client boundary, full TypeScript
types, WCAG-compliant accessibility, loading/error/empty states, and Tailwind token classes.
Never hardcodes values — always uses design tokens and accepts `className` for overrides.

## Inputs Required
Before executing, confirm you have:
- [ ] Component name and purpose
- [ ] The data/props it receives (or where the data comes from)
- [ ] Which states to handle: loading, error, empty, success
- [ ] Whether it needs interactivity (determines RSC vs Client)

## RSC vs Client Decision

```
DEFAULT → Server Component (no directive)

Add 'use client' only for:
  onClick, onChange, onSubmit     → event handlers
  useState, useReducer            → local state
  useEffect, useLayoutEffect      → side effects
  useContext                      → React context
  useQuery, useMutation           → TanStack Query
  useStore                        → Zustand
  useForm, useController          → React Hook Form
  window, document, localStorage  → browser APIs
  Third-party: charts, DnD, etc.  → client-only libs
```

## Component Templates

### Server Component (default)
```typescript
// No 'use client' — this is the default
import type { FC } from 'react'
import { cn } from '@/shared/lib/cn'
import type { FeatureItem } from '@/features/feature/types'

interface FeatureCardProps {
  item: FeatureItem
  className?: string
}

const FeatureCard: FC<FeatureCardProps> = ({ item, className }) => {
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-surface p-4 shadow-sm',
        className
      )}
      aria-label={item.name}
    >
      <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{item.status}</p>
    </article>
  )
}

export { FeatureCard }
export type { FeatureCardProps }
```

### Client Component (with state)
```typescript
'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui'

interface FeatureFormProps {
  onSubmit: (data: FormData) => Promise<void>
  className?: string
}

function FeatureForm({ onSubmit, className }: FeatureFormProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    try {
      await onSubmit(new FormData(event.currentTarget))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-4', className)}
      aria-label="Feature form"
      noValidate
    >
      {/* form fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}

export { FeatureForm }
export type { FeatureFormProps }
```

### List with States
```typescript
// Server Component: renders with Suspense for loading state
import { Skeleton } from '@/shared/components/ui'
import type { FeatureItem } from '@/features/feature/types'
import { FeatureCard } from './FeatureCard'

interface FeatureListProps {
  items: FeatureItem[]
  className?: string
}

function FeatureList({ items, className }: FeatureListProps) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <p className="text-sm text-muted-foreground">No items yet.</p>
      </div>
    )
  }

  return (
    <ul
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      aria-label="Feature list"
    >
      {items.map((item) => (
        <li key={item.id}>
          <FeatureCard item={item} />
        </li>
      ))}
    </ul>
  )
}

// Loading skeleton — used in loading.tsx or Suspense fallback
function FeatureListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  )
}

export { FeatureList, FeatureListSkeleton }
export type { FeatureListProps }
```

### Modal (Client Component with focus trap)
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        'rounded-xl border border-border bg-surface-elevated p-6 shadow-lg',
        'backdrop:bg-black/50 open:flex open:flex-col open:gap-4',
        'max-w-lg w-full',
        className
      )}
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between">
        <h2 id="modal-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </Button>
      </div>
      <div>{children}</div>
    </dialog>
  )
}

export { Modal }
export type { ModalProps }
```

## Accessibility Requirements

| Element | Required attributes |
|---------|-------------------|
| Interactive div/span | `role="button"`, `tabIndex={0}`, `onKeyDown` for Enter/Space |
| Decorative icon | `aria-hidden="true"` |
| Image | `alt="description"` or `alt=""` if decorative |
| Form input | `<label htmlFor>`, `aria-describedby` for helper/error |
| Error message | `role="alert"` |
| Loading state | `role="status"`, `aria-live="polite"` |
| Modal/dialog | `<dialog>` element, `aria-labelledby` |
| List of items | `<ul>` or `<ol>` with `<li>` — not `<div>` |
| Navigation | `<nav>` with `aria-label` |
| Main content | `<main>` — one per page |

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `className="text-blue-500"` | `className="text-primary"` | Token-driven |
| Hardcode pixel values inline | Tailwind spacing classes | Consistent spacing |
| `<div onClick={...}>` | `<button onClick={...}>` | Accessibility |
| `export default` | `export { ComponentName }` | Explicit, named exports |
| Business logic in component | Extract to hook or Server Action | Separation of concerns |
| `any` prop type | Explicit interface | Type safety |

## Quality Checklist
- [ ] RSC vs Client decision made and justified
- [ ] All props typed in a named interface
- [ ] Loading state handled (Skeleton or Suspense fallback)
- [ ] Empty state handled (not just rendering nothing)
- [ ] Error state handled (if async data involved)
- [ ] No hardcoded colors — only token classes
- [ ] `className` prop accepted for override
- [ ] Named export (not default export)
- [ ] `npm run typecheck` passes

## Related Skills
- `design-system`: Provides Button, Input, Card, Badge, Skeleton base components
- `state-architect`: When the component needs state — consult first
- `accessibility`: For complex interactive components (modals, dropdowns, tabs)

## Reference
See `references/component-patterns.md` for Suspense, error boundary, and advanced patterns.
