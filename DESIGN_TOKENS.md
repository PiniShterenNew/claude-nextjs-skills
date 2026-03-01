# DESIGN_TOKENS.md
## MenuCost — Design Tokens Extracted from Mockups

**Source screens**: 6 screens (Dashboard, Ingredients, Recipe Builder, Recipe Detail, Menu Engineering, Settings)
**Design direction**: Light-mode SaaS dashboard with dark sidebar, Hebrew RTL
**Dark mode**: ❌ Not in the design — light mode only (dark sidebar is a component, not a full dark mode)

---

## 1. Color Palette

### Light Mode (main app)

| Token | Hex | Tailwind Equivalent | Usage |
|-------|-----|---------------------|-------|
| `--color-primary` | `#2563EB` | `blue-600` | CTAs, active nav item, links, focus rings, save buttons |
| `--color-primary-hover` | `#1D4ED8` | `blue-700` | Primary button hover state |
| `--color-primary-dark` | `#1E40AF` | `blue-800` | Pressed / deep accent |
| `--color-primary-foreground` | `#FFFFFF` | `white` | Text on primary (blue) backgrounds |
| `--color-primary-subtle` | `#EFF6FF` | `blue-50` | Tinted row highlight, info card backgrounds |
| `--color-background` | `#F1F5F9` | `slate-100` | Page/body background behind cards |
| `--color-surface` | `#FFFFFF` | `white` | Card, panel, table background |
| `--color-surface-subtle` | `#F8FAFC` | `slate-50` | Table header row, secondary surface |
| `--color-surface-elevated` | `#FFFFFF` | `white` | Modals, dropdowns (differentiated by shadow) |
| `--color-sidebar` | `#0F172A` | `slate-900` | Fixed sidebar background |
| `--color-sidebar-hover` | `#1E293B` | `slate-800` | Sidebar item hover |
| `--color-sidebar-foreground` | `#CBD5E1` | `slate-300` | Sidebar default text |
| `--color-sidebar-muted` | `#64748B` | `slate-500` | Sidebar section labels |
| `--color-foreground` | `#0F172A` | `slate-950` | Primary body text |
| `--color-foreground-secondary` | `#1E293B` | `slate-800` | Headings |
| `--color-muted-foreground` | `#64748B` | `slate-500` | Placeholder, secondary text, timestamps |
| `--color-border` | `#E2E8F0` | `slate-200` | Default borders, card borders |
| `--color-border-subtle` | `#F1F5F9` | `slate-100` | Table row dividers |
| `--color-border-focus` | `#2563EB` | `blue-600` | Input focus border |
| `--color-success` | `#22C55E` | `green-500` | Food cost OK badge text/icon |
| `--color-success-subtle` | `#DCFCE7` | `green-100` | Success badge background |
| `--color-success-foreground` | `#15803D` | `green-700` | Text on success background |
| `--color-warning` | `#EAB308` | `yellow-500` | Warning badge icon |
| `--color-warning-subtle` | `#FEF9C3` | `yellow-100` | Warning badge background |
| `--color-warning-foreground` | `#A16207` | `yellow-700` | Text on warning background |
| `--color-error` | `#EF4444` | `red-500` | Danger badge icon, alert icon |
| `--color-error-subtle` | `#FEE2E2` | `red-100` | Error background, waste % input |
| `--color-error-foreground` | `#B91C1C` | `red-700` | Text on error background |
| `--color-orange-subtle` | `#FFF7ED` | `orange-50` | Price alert card background |
| `--color-orange-border` | `#FFEDD5` | `orange-100` | Price alert card border |

### Extra accent colors (used in KPI icon boxes)
| Usage | Background | Icon Color |
|-------|-----------|-----------|
| Food cost % KPI | `blue-50` | `blue-600` |
| Most profitable KPI | `green-50` | `green-600` |
| Highest cost KPI | `red-50` | `red-600` |
| Total dishes KPI | `purple-50` | `purple-600` |

---

## 2. Typography

**Font family**: `Heebo` (Google Fonts) — Hebrew-optimized variable font, weights 100–900

> Heebo is specifically designed for Hebrew+Latin bilingual text. It renders correctly in both RTL Hebrew and LTR numerics.

| Element | Size (Tailwind) | Weight | Line Height | Letter Spacing | Usage |
|---------|----------------|--------|-------------|----------------|-------|
| Page title (H1) | `text-2xl` (24px) | 700 `font-bold` | `leading-tight` | normal | `"סקירה כללית"`, `"ניהול חומרי גלם"` |
| Section title (H2) | `text-lg` (18px) | 700 `font-bold` | `leading-snug` | normal | Card titles, panel headers |
| KPI large number | `text-3xl` (30px) | 700 `font-bold` | `leading-none` | `tracking-tight` | `28.4%`, `48`, `₪42,500` |
| KPI medium number | `text-xl` (20px) | 700 `font-bold` | `leading-none` | normal | Recipe cost (`₪21.55`), medium KPIs |
| Body / table body | `text-sm` (14px) | 400 `font-normal` | `leading-normal` | normal | Table rows, descriptions |
| Body medium | `text-sm` (14px) | 500 `font-medium` | `leading-normal` | normal | Primary table cell text, button labels |
| Form label | `text-sm` (14px) | 500 `font-medium` | `leading-normal` | normal | Input labels (`text-gray-700`) |
| Section subheader | `text-sm` (14px) | 700 `font-bold` | `leading-tight` | `tracking-wide uppercase` | Form section titles (e.g. "פרטים בסיסיים") |
| Muted / timestamp | `text-xs` (12px) | 400 `font-normal` | `leading-normal` | normal | IDs, timestamps, helper text |
| Table header | `text-xs` (12px) | 600 `font-semibold` | `leading-tight` | `uppercase tracking-wider` | `thead` labels |
| Badge / chip | `text-xs` (12px) | 500 `font-medium` | `leading-none` | normal | `"פעיל"`, `"5 דורשים עדכון"` |
| Sidebar nav | `text-sm` (14px) | 500 `font-medium` | `leading-normal` | normal | Nav item labels |
| Sidebar section | `text-xs` (12px) | 600 `font-semibold` | `leading-tight` | `uppercase tracking-wider` | `"ראשי"`, `"ניהול"` section dividers |

---

## 3. Spacing System

**Base unit**: 4px (Tailwind default). All spacing is multiples of 4px.

| Tailwind | px | Usage in designs |
|----------|----|-----------------|
| `p-1` / `gap-1` | 4px | Icon padding, tiny gap |
| `p-2` / `gap-2` | 8px | Badge padding, inline button gap, input icon padding |
| `p-3` / `gap-3` | 12px | Compact table cell padding (`py-3.5` = 14px used for table rows) |
| `p-4` / `gap-4` | 16px | Standard spacing, form fields, table cell vertical |
| `p-5` / `gap-5` | 20px | Page section vertical padding |
| `p-6` / `gap-6` | 24px | Card internal padding, grid gaps between KPI cards |
| `p-8` / `gap-8` | 32px | Page content padding, large section spacing |

**Sidebar width**: `w-64` = 256px (fixed)
**Max content width**: `max-w-7xl` (1280px) with `mx-auto`
**Edit panel width**: `w-[420px]` (ingredient edit side panel)

---

## 4. Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--radius-sm` | 4px | `rounded` | Tiny badges (`rounded`), pagination buttons |
| `--radius-md` | 6px | `rounded-md` | Nav items (`rounded-md`), small buttons |
| `--radius-lg` | 8px | `rounded-lg` | Primary buttons, inputs, dropdown items |
| `--radius-xl` | 12px | `rounded-xl` | Cards, panels, modals, KPI cards |
| `--radius-full` | 9999px | `rounded-full` | Avatars, pill badges (`"פעיל"`), icon boxes, progress bars |

**Key observation**: Cards consistently use `rounded-xl`. Buttons consistently use `rounded-lg`. This is a clear hierarchy rule.

---

## 5. Shadows

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` | Default card, default button |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.10)` | `shadow-md` | Card hover state, focused input |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.10)` | `shadow-lg` | Modals, elevated dropdowns |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | `shadow-2xl` | Side edit panel (ingredient form panel) |

**Pattern**: Cards default to `shadow-sm`, upgrade to `shadow-md` on hover (`hover:shadow-md`).

---

## 6. Transitions & Motion

| Interaction | Duration | Easing | Tailwind |
|-------------|----------|--------|---------|
| Button/link hover color | 150ms | ease | `transition-colors` |
| Row hover background | 150ms | ease | `transition-colors` |
| Icon visibility (edit button on row) | 150ms | ease | `opacity-0 group-hover:opacity-100 transition-opacity` |
| All-property (scale, shadow) | 200ms | ease | `transition-all` |
| KPI card icon on hover | 200ms | ease-in-out | `group-hover:scale-110 transition-transform` |
| Sidebar collapse | 300ms | ease-in-out | (not shown in mockup — use 300ms) |
| Modal enter | 200ms | ease-out | (not shown — recommended) |

---

## 7. Icons

**Icon system**: **Material Symbols Outlined** (Google)
- Load via: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`
- Font variation settings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- Default size: `20px` in nav, `24px` in content, `16px` in inline text

**Key icons used**:
| Icon name | Usage |
|-----------|-------|
| `dashboard` | Dashboard nav |
| `restaurant_menu` | Recipes nav |
| `inventory_2` | Ingredients nav |
| `monitoring` | Menu Engineering nav |
| `percent` | Food cost % KPI |
| `monetization_on` | Most profitable KPI |
| `production_quantity_limits` | Highest cost KPI |
| `menu_book` | Total dishes KPI |
| `check_circle` | Food cost OK (green) |
| `error` | Food cost warning (yellow) |
| `warning` | Food cost alert (red) |
| `price_change` | Price alerts section |
| `notifications` | Top bar notification bell |
| `settings`, `group`, `store` | Management nav |
| `add`, `edit`, `delete`, `save` | CRUD actions |
| `search`, `filter_list`, `download` | List controls |
| `save` | Save button icon |

---

## 8. Component Visual Patterns

### Button Hierarchy

| Variant | Background | Text | Border | Shadow | Hover |
|---------|-----------|------|--------|--------|-------|
| **Primary** | `bg-blue-600` | `text-white` | none | `shadow-sm` | `hover:bg-blue-700` |
| **Secondary** | `bg-white` | `text-gray-700` | `border border-gray-300` | `shadow-sm` | `hover:bg-gray-50` |
| **Ghost** | transparent | `text-slate-600` | `border border-slate-200` | none | `hover:bg-slate-50` |
| **Dark** | `bg-slate-900` | `text-white` | none | `shadow-sm` | `hover:bg-slate-800` |
| **Destructive** | transparent / `bg-red-50` | `text-red-600` | `border-red-200` | none | `hover:bg-red-100` |

All buttons: `rounded-lg`, `px-4 py-2` (standard) or `px-6 py-2` (wide), `text-sm font-medium`, `transition-colors`

### Input Fields

| State | Border | Background | Ring |
|-------|--------|-----------|------|
| Default | `border-gray-300` | `bg-white` | none |
| Focus | `border-blue-500` | `bg-white` | `ring-2 ring-blue-500` |
| Error | `border-red-200` | `bg-red-50` | `ring-red-500` (on focus) |
| Highlighted / active edit | `border-blue-200` | `bg-blue-50` | `ring-blue-500` (on focus) |
| Read-only | `border-gray-200` | `bg-gray-100` | none |

All inputs: `rounded-lg`, `shadow-sm`, `sm:text-sm` (14px), `text-gray-900`
Label style: `text-sm font-medium text-gray-700 mb-1`

### Cards

| Type | Background | Border | Radius | Shadow |
|------|-----------|--------|--------|--------|
| Standard KPI card | `bg-white` | `border border-slate-200` | `rounded-xl` | `shadow-sm` → `hover:shadow-md` |
| Table container | `bg-white` | `border border-slate-200` | `rounded-xl` | `shadow-sm` |
| Alert card — orange | `bg-orange-50` | `border border-orange-100` | `rounded-lg` | none |
| Alert card — blue | `bg-blue-50` | `border border-blue-100` | `rounded-lg` | none |
| Warning notice | `bg-yellow-50` | `border border-yellow-100` | `rounded-md` | none |
| Dark hero card | `bg-slate-900` | none | `rounded-xl` | `shadow-sm` |

### Badges

| Type | Background | Text color | Shape |
|------|-----------|-----------|-------|
| Active | `bg-green-100` | `text-green-700` | `rounded-full` |
| Warning | `bg-yellow-100` | `text-yellow-700` | `rounded` |
| Count chip | `bg-gray-100` | `text-gray-600` | `rounded-full` |
| Needs update | `bg-yellow-100` | `text-yellow-700` | `rounded` |
| Nav active (inline) | `bg-gray-100` | `text-gray-900` | `rounded-md` |

All badges: `px-2 py-0.5 text-xs font-medium`

### Food Cost % Status Color System

| Threshold | Color class | Icon |
|-----------|------------|------|
| Below target (green) | `text-green-600 font-bold` | `check_circle` (green-500) |
| Within 5% of target (warning) | `text-yellow-600 font-bold` | `error` (yellow-500) |
| Over target (alert) | `text-red-600 font-bold` | `warning` (red-500) |

### Table

- Container: `bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden`
- `<thead>`: `bg-slate-50` (or `bg-gray-50`), `text-xs uppercase font-semibold text-slate-500`
- `<tbody>`: `divide-y divide-slate-100`
- Row hover: `hover:bg-slate-50 transition-colors`
- Row active/selected: `bg-blue-50/30` with `text-blue-700`

### Sidebar Navigation

```
Container: bg-slate-900 text-slate-300 w-64 fixed/sticky
Logo area: p-6 border-b border-slate-800
Nav item default: flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white rounded-md transition-colors
Nav item active: bg-blue-600 text-white rounded-md
Section label: px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-8
User footer: mt-auto p-4 border-t border-slate-800
```

---

## 9. Pagination Pattern

```html
<!-- Active page -->
<button class="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded font-medium">1</button>
<!-- Default page -->
<button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">2</button>
<!-- Disabled -->
<button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-500 disabled:opacity-50" disabled>הקודם</button>
```

---

## CSS Custom Properties
### (Copy → `src/app/globals.css`)

```css
:root {
  /* Primary */
  --color-primary: 37 99 235;           /* #2563EB blue-600 */
  --color-primary-hover: 29 78 216;     /* #1D4ED8 blue-700 */
  --color-primary-dark: 30 64 175;      /* #1E40AF blue-800 */
  --color-primary-foreground: 255 255 255;
  --color-primary-subtle: 239 246 255;  /* #EFF6FF blue-50 */

  /* Surfaces */
  --color-background: 241 245 249;      /* #F1F5F9 slate-100 */
  --color-surface: 255 255 255;         /* #FFFFFF */
  --color-surface-subtle: 248 250 252;  /* #F8FAFC slate-50 */
  --color-surface-elevated: 255 255 255;
  --color-sidebar: 15 23 42;            /* #0F172A slate-900 */
  --color-sidebar-hover: 30 41 59;      /* #1E293B slate-800 */

  /* Text */
  --color-foreground: 15 23 42;         /* #0F172A slate-950 */
  --color-foreground-secondary: 30 41 59; /* #1E293B slate-800 */
  --color-muted-foreground: 100 116 139; /* #64748B slate-500 */
  --color-sidebar-foreground: 203 213 225; /* #CBD5E1 slate-300 */
  --color-sidebar-muted: 100 116 139;    /* #64748B slate-500 */

  /* Borders */
  --color-border: 226 232 240;          /* #E2E8F0 slate-200 */
  --color-border-subtle: 241 245 249;   /* #F1F5F9 slate-100 */
  --color-border-focus: 37 99 235;      /* #2563EB blue-600 */

  /* Semantic */
  --color-success: 34 197 94;           /* #22C55E green-500 */
  --color-success-subtle: 220 252 231;  /* #DCFCE7 green-100 */
  --color-success-foreground: 21 128 61; /* #15803D green-700 */
  --color-warning: 234 179 8;           /* #EAB308 yellow-500 */
  --color-warning-subtle: 254 249 195;  /* #FEF9C3 yellow-100 */
  --color-warning-foreground: 161 98 7; /* #A16207 yellow-700 */
  --color-error: 239 68 68;             /* #EF4444 red-500 */
  --color-error-subtle: 254 226 226;    /* #FEE2E2 red-100 */
  --color-error-foreground: 185 28 28;  /* #B91C1C red-700 */

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}

/* Dark mode: not designed — no overrides needed for MVP */
/* [data-theme="dark"] { } */
```

---

## Tailwind Config Extension
### (Copy → `tailwind.config.ts` inside `extend: {}`)

```typescript
extend: {
  colors: {
    primary: {
      DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
      hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
      dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
      foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
      subtle: 'rgb(var(--color-primary-subtle) / <alpha-value>)',
    },
    background: 'rgb(var(--color-background) / <alpha-value>)',
    surface: {
      DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
      subtle: 'rgb(var(--color-surface-subtle) / <alpha-value>)',
      elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
    },
    sidebar: {
      DEFAULT: 'rgb(var(--color-sidebar) / <alpha-value>)',
      hover: 'rgb(var(--color-sidebar-hover) / <alpha-value>)',
      foreground: 'rgb(var(--color-sidebar-foreground) / <alpha-value>)',
      muted: 'rgb(var(--color-sidebar-muted) / <alpha-value>)',
    },
    foreground: {
      DEFAULT: 'rgb(var(--color-foreground) / <alpha-value>)',
      secondary: 'rgb(var(--color-foreground-secondary) / <alpha-value>)',
    },
    muted: {
      foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
    },
    border: {
      DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
      subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
      focus: 'rgb(var(--color-border-focus) / <alpha-value>)',
    },
    success: {
      DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
      subtle: 'rgb(var(--color-success-subtle) / <alpha-value>)',
      foreground: 'rgb(var(--color-success-foreground) / <alpha-value>)',
    },
    warning: {
      DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
      subtle: 'rgb(var(--color-warning-subtle) / <alpha-value>)',
      foreground: 'rgb(var(--color-warning-foreground) / <alpha-value>)',
    },
    error: {
      DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
      subtle: 'rgb(var(--color-error-subtle) / <alpha-value>)',
      foreground: 'rgb(var(--color-error-foreground) / <alpha-value>)',
    },
  },
  fontFamily: {
    sans: ['Heebo', 'system-ui', 'sans-serif'],
  },
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  boxShadow: {
    // Keep Tailwind defaults — they match the design (shadow-sm, shadow-md, shadow-lg, shadow-2xl)
    // No custom shadows needed
  },
},
```

---

## 10. Design Decisions & Notes for Implementation

1. **Font**: Use `next/font/google` to load `Heebo` — do NOT link directly from Google Fonts CDN in Next.js. The variable font weight range `100..900` covers all cases.

2. **RTL**: All screens are `dir="rtl"`. The HTML `<html>` element must have `dir="rtl" lang="he"`. Tailwind RTL utilities (`rtl:` prefix) handle directional adjustments.

3. **Sidebar**: Always on the right in RTL — it appears on the right edge in the screenshots. Use `order-last` or let flex direction handle it naturally in `dir="rtl"`.

4. **No dark mode**: The design does not include a dark mode. The dark sidebar is intentional branding — not a toggleable theme. Do not add dark mode infrastructure.

5. **Scrollbar styling**: The designs show a custom thin scrollbar (`width: 6px`, `background: #cbd5e1`, `border-radius: 3px`). Apply globally in `globals.css`.

6. **Background vs surface**: Body background is `slate-100` (#F1F5F9), not white. Cards sit on top as white surfaces — this creates the visual elevation without shadows alone.

7. **Food Cost color thresholds** are workspace-configurable (from `ARCHITECTURE.md`), not hardcoded. The `CostThresholdBadge` component receives the workspace threshold as a prop.

8. **Icon system**: Use Material Symbols Outlined via `next/font` or direct CDN. The outlined style with weight 400 is the design standard.

9. **Monetary display**: All prices show the `₪` shekel symbol prefix (Hebrew convention: symbol before amount). Format: `₪XX.XX`.
