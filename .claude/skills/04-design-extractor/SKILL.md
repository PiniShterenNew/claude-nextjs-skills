---
name: design-extractor
description: "Extracts design tokens, visual patterns, and typography from design screens, Figma exports, or screenshots. Use whenever the user shares design mockups, screenshots, Figma files, or asks Claude to understand the visual style, color palette, spacing, or typography of a design — even for a single screen. Also triggers on: 'match this design', 'extract the colors', 'what fonts are used', 'set up the design system from this', 'Figma handoff', 'implement this mockup', 'recreate this UI'."
allowed-tools: Read, WebFetch
---

# Design Extractor

## Purpose
Parses design mockups, screenshots, or Figma exports into structured design tokens:
color palette, typography scale, spacing system, border/shadow conventions, and
component visual patterns. Outputs `DESIGN_TOKENS.md` and a Tailwind config extension.

## Inputs Required
Before executing, confirm you have:
- [ ] Design screenshots, mockup images, or Figma export URL
- [ ] At least one screen that shows the primary color, text, and background
- [ ] Dark mode screens (optional — if the app supports dark mode)

## Instructions

### Step 1 — Color Palette Extraction

Identify and name colors semantically (never by hue):

```typescript
// Semantic naming — NOT "blue-500" or "#3B82F6"
colors: {
  // Primary action colors
  primary: "...",           // Main CTA, links, active states
  "primary-hover": "...",   // Hover/focus variant
  "primary-foreground": "...", // Text ON primary background

  // Surface colors (backgrounds)
  background: "...",        // Page background
  surface: "...",           // Card, panel background
  "surface-elevated": "...", // Modal, dropdown background

  // Text colors
  foreground: "...",        // Primary text
  "muted-foreground": "...", // Secondary/placeholder text

  // Semantic states
  success: "...",
  warning: "...",
  error: "...",
  info: "...",

  // Borders
  border: "...",
  "border-focus": "...",
}
```

**Dark mode**: Use CSS custom properties with `[data-theme="dark"]` override — never
duplicate classes. See `references/design-tokens-template.md`.

### Step 2 — Typography Scale

Identify:
- Font families (heading vs body — note if same or different)
- Size scale (map to Tailwind: text-xs through text-5xl)
- Weight usage (400/normal, 500/medium, 600/semibold, 700/bold)
- Line heights (tight for headings, relaxed for body)
- Letter spacing (tracking-tight for large headings)

### Step 3 — Spacing System

Determine the base unit:
- **4px base**: designs use multiples of 4 (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **8px base**: designs use multiples of 8 (8, 16, 24, 32, 48, 64, 96)

Tailwind's default scale is already 4px-based — verify the design matches.
Note any custom spacing values not in the default scale.

### Step 4 — Border, Shadow, Motion

```
Border radius: none | sm (2px) | md (6px) | lg (8px) | xl (12px) | full (9999px)
Border width: 1px (default), 2px (focus rings)

Shadows: none | sm | md | lg | xl
  Note how "elevated" surfaces (modals, dropdowns) differ from cards.

Transitions:
  Duration: 150ms (micro), 200ms (standard), 300ms (complex)
  Easing: ease-out (enter), ease-in (exit), ease-in-out (transform)
```

### Step 5 — Component Visual Patterns

For each recurring component, note:
- Button hierarchy (primary, secondary, ghost, destructive) and their visual treatment
- Input style (border radius, focus ring, error state color)
- Card style (shadow vs border vs neither, padding, radius)
- Badge/chip style (filled vs outline, colors, size)

### Step 6 — Write Outputs

**DESIGN_TOKENS.md**: Full token documentation in prose + tables.
**Tailwind config extension** (ready to paste into `tailwind.config.ts`):
```typescript
extend: {
  colors: { /* semantic color map */ },
  fontFamily: { sans: ['...', 'system-ui'] },
  fontSize: { /* custom sizes if needed */ },
  borderRadius: { /* custom if non-standard */ },
  boxShadow: { /* custom shadow tokens */ },
}
```
**CSS custom properties** (paste into `src/styles/tokens.css`):
```css
:root { --color-primary: ...; }
[data-theme="dark"] { --color-primary: ...; }
```

See `references/design-tokens-template.md` for the full output template.

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| Hardcode colors in components | CSS vars + Tailwind semantic classes | Dark mode support |
| Name by hue: `blue-accent` | Name by role: `primary` | Role-based naming survives rebrand |
| Guess at exact hex values | Note approximation, use design source | Wrong tokens = wrong UI |
| Skip dark mode extraction | Note if not present, plan for it | Harder to retrofit later |

## Quality Checklist
- [ ] All colors have semantic names (no hue names)
- [ ] Dark mode variants noted or explicitly marked "not in design"
- [ ] Typography scale complete (family, sizes, weights, line-heights)
- [ ] Base spacing unit identified (4px or 8px)
- [ ] Tailwind config extension is copy-paste ready
- [ ] CSS custom properties block is copy-paste ready
- [ ] DESIGN_TOKENS.md saved at project root

## Related Skills
- `design-system`: Next step — implements these tokens into actual CSS and components
- `component-builder`: Uses token classes when building any component

## Reference
See `references/design-tokens-template.md` for full output template.
