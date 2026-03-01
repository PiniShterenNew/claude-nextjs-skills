---
name: design-system
description: "Implements design tokens into CSS custom properties and Tailwind configuration. Builds the base component library: Button, Input, Card, Badge, Typography, and Skeleton. Use when setting up the design system for the first time, creating or modifying base UI components, working with color tokens, spacing, typography, or any shared component in src/shared/components/ui/. Always use before building feature-specific components."
allowed-tools: Read, Bash
---

# Design System

## Purpose
Implements design tokens from `DESIGN_TOKENS.md` into CSS custom properties and
Tailwind config, then builds the base component library that all feature components
depend on. Every component is accessible, token-driven, and type-safe.

## Inputs Required
Before executing, confirm you have:
- [ ] `DESIGN_TOKENS.md` (from design-extractor) OR token decisions made inline
- [ ] `tailwind.config.ts` exists (or will be created)
- [ ] CVA (class-variance-authority) installed: `npm install class-variance-authority`

## Step 1 — Install Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge
```

## Step 2 — CSS Custom Properties

Create `src/styles/tokens.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Use space-separated RGB channels for Tailwind opacity support */
    --color-primary: 59 130 246;
    --color-primary-hover: 37 99 235;
    --color-primary-foreground: 255 255 255;
    --color-background: 255 255 255;
    --color-surface: 248 250 252;
    --color-surface-elevated: 255 255 255;
    --color-foreground: 15 23 42;
    --color-muted-foreground: 100 116 139;
    --color-border: 226 232 240;
    --color-success: 22 163 74;
    --color-warning: 217 119 6;
    --color-error: 220 38 38;

    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-xl: 12px;
  }

  [data-theme="dark"] {
    --color-background: 15 23 42;
    --color-surface: 30 41 59;
    --color-surface-elevated: 51 65 85;
    --color-foreground: 241 245 249;
    --color-muted-foreground: 148 163 184;
    --color-border: 51 65 85;
  }
}
```

## Step 3 — Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['attribute', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        },
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: { foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)' },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    },
  },
}
export default config
```

## Step 4 — cn() Utility

```typescript
// src/shared/lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Step 5 — Base Components

All components live in `src/shared/components/ui/` and export from an `index.ts`.

### Button
```typescript
// src/shared/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'border border-border bg-surface hover:bg-background text-foreground',
        ghost: 'hover:bg-surface text-foreground',
        destructive: 'bg-error text-white hover:bg-error/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { Button, buttonVariants }
export type { ButtonProps }
```

### Input
```typescript
// src/shared/components/ui/Input.tsx
import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

function Input({ className, label, error, helperText, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${inputId}-error` : undefined
  const helperId = helperText ? `${inputId}-helper` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="ml-1 text-error" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-error focus-visible:ring-error',
          className
        )}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="text-xs text-error">{error}</p>}
      {helperText && !error && <p id={helperId} className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}

export { Input }
export type { InputProps }
```

### Card
```typescript
// src/shared/components/ui/Card.tsx
import { cn } from '@/shared/lib/cn'
import type { HTMLAttributes } from 'react'

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-surface shadow-sm', className)} {...props} />
}
function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
}
function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}
function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center px-6 pb-6', className)} {...props} />
}

export { Card, CardHeader, CardBody, CardFooter }
```

### Badge
```typescript
// src/shared/components/ui/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/cn'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface border border-border text-foreground',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
        primary: 'bg-primary/10 text-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
export type { BadgeProps }
```

### Skeleton
```typescript
// src/shared/components/ui/Skeleton.tsx
import { cn } from '@/shared/lib/cn'
import type { HTMLAttributes } from 'react'

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-border/50', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
```

### Barrel Export
```typescript
// src/shared/components/ui/index.ts
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'
export { Input } from './Input'
export type { InputProps } from './Input'
export { Card, CardHeader, CardBody, CardFooter } from './Card'
export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'
export { Skeleton } from './Skeleton'
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `className="text-blue-500"` | `className="text-primary"` | Token-driven, dark mode safe |
| Hardcode hex in component | Use CSS var via Tailwind class | Survives theme changes |
| Skip `className` prop | Always accept `className` for override | Composability |
| Inline style for colors | Tailwind token class | Purging, consistency |

## Quality Checklist
- [ ] `src/styles/tokens.css` created with all CSS custom properties
- [ ] `tailwind.config.ts` extended with semantic color map
- [ ] `cn()` utility created at `src/shared/lib/cn.ts`
- [ ] All 5 base components created (Button, Input, Card, Badge, Skeleton)
- [ ] All components export from `src/shared/components/ui/index.ts`
- [ ] `npm run typecheck` passes with zero errors

## Related Skills
- `design-extractor`: Run first to produce DESIGN_TOKENS.md
- `component-builder`: Uses these base components when building feature components
- `accessibility`: Validates ARIA attributes on these components
