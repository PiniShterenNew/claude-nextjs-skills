# Design Tokens Template

Use this template as the output format for the design-extractor skill.

---

# DESIGN_TOKENS.md

## Color Palette

### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#3B82F6` | CTAs, links, active indicators |
| `--color-primary-hover` | `#2563EB` | Button hover, link hover |
| `--color-primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--color-background` | `#FFFFFF` | Page background |
| `--color-surface` | `#F8FAFC` | Card, panel backgrounds |
| `--color-surface-elevated` | `#FFFFFF` | Modal, dropdown (with shadow) |
| `--color-foreground` | `#0F172A` | Primary text |
| `--color-muted-foreground` | `#64748B` | Secondary/placeholder text |
| `--color-border` | `#E2E8F0` | Default borders |
| `--color-border-focus` | `#3B82F6` | Focus ring |
| `--color-success` | `#16A34A` | Success states |
| `--color-warning` | `#D97706` | Warning states |
| `--color-error` | `#DC2626` | Error states |
| `--color-info` | `#0EA5E9` | Info states |

### Dark Mode Overrides
| Token | Light | Dark |
|-------|-------|------|
| `--color-background` | `#FFFFFF` | `#0F172A` |
| `--color-surface` | `#F8FAFC` | `#1E293B` |
| `--color-surface-elevated` | `#FFFFFF` | `#334155` |
| `--color-foreground` | `#0F172A` | `#F1F5F9` |
| `--color-muted-foreground` | `#64748B` | `#94A3B8` |
| `--color-border` | `#E2E8F0` | `#334155` |

## Typography

| Element | Family | Size | Weight | Line Height | Letter Spacing |
|---------|--------|------|--------|-------------|----------------|
| h1 | Inter | 36px (text-4xl) | 700 | 1.2 (leading-tight) | -0.025em (tracking-tight) |
| h2 | Inter | 30px (text-3xl) | 600 | 1.25 | -0.015em |
| h3 | Inter | 24px (text-2xl) | 600 | 1.3 | normal |
| h4 | Inter | 20px (text-xl) | 500 | 1.4 | normal |
| body | Inter | 16px (text-base) | 400 | 1.6 (leading-relaxed) | normal |
| small | Inter | 14px (text-sm) | 400 | 1.5 | normal |
| caption | Inter | 12px (text-xs) | 400 | 1.4 | 0.01em |
| label | Inter | 14px (text-sm) | 500 | 1.4 | normal |
| code | JetBrains Mono | 14px (text-sm) | 400 | 1.5 | normal |

## Spacing System

**Base unit**: 4px

| Tailwind | px | Common usage |
|----------|----|-------------|
| `p-1` | 4px | Tight — icon padding |
| `p-2` | 8px | Small — badge, chip |
| `p-3` | 12px | Medium-small |
| `p-4` | 16px | Standard — card padding |
| `p-6` | 24px | Large — section padding |
| `p-8` | 32px | XL — page padding |
| `p-12` | 48px | XXL — hero section |
| `gap-4` | 16px | Standard grid gap |
| `gap-6` | 24px | Section gap |

## Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Badges, small chips |
| radius-md | 6px | Buttons, inputs |
| radius-lg | 8px | Cards |
| radius-xl | 12px | Modals, dropdowns |
| radius-full | 9999px | Avatar, pill badge |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle card |
| shadow-md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Card hover, default card |
| shadow-lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modal, dropdown |
| shadow-xl | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Floating elements |

## Transitions

| Usage | Duration | Easing |
|-------|----------|--------|
| Button hover | 150ms | ease-out |
| Modal enter | 200ms | ease-out |
| Modal exit | 150ms | ease-in |
| Sidebar collapse | 300ms | ease-in-out |
| Accordion | 200ms | ease-in-out |

---

## CSS Custom Properties (copy → src/styles/tokens.css)

```css
:root {
  /* Colors */
  --color-primary: 59 130 246;
  --color-primary-hover: 37 99 235;
  --color-primary-foreground: 255 255 255;
  --color-background: 255 255 255;
  --color-surface: 248 250 252;
  --color-surface-elevated: 255 255 255;
  --color-foreground: 15 23 42;
  --color-muted-foreground: 100 116 139;
  --color-border: 226 232 240;
  --color-border-focus: 59 130 246;
  --color-success: 22 163 74;
  --color-warning: 217 119 6;
  --color-error: 220 38 38;
  --color-info: 14 165 233;

  /* Radius */
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
```

## Tailwind Config Extension (copy → tailwind.config.ts)

```typescript
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
    muted: {
      foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
    },
    border: {
      DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
      focus: 'rgb(var(--color-border-focus) / <alpha-value>)',
    },
    success: 'rgb(var(--color-success) / <alpha-value>)',
    warning: 'rgb(var(--color-warning) / <alpha-value>)',
    error: 'rgb(var(--color-error) / <alpha-value>)',
    info: 'rgb(var(--color-info) / <alpha-value>)',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
}
```
