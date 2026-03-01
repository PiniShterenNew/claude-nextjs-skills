---
name: accessibility
description: "Ensures WCAG 2.1 AA compliance in Next.js components. Covers ARIA attributes, keyboard navigation, focus management, color contrast, and screen reader patterns. Use when auditing components for accessibility, adding ARIA attributes, fixing keyboard navigation, ensuring color contrast, or building interactive components like modals, dropdowns, tabs, accordions, tooltips, or data tables. Also triggers on: 'a11y', 'screen reader', 'keyboard nav', 'focus trap', 'aria', 'accessible', 'WCAG'."
allowed-tools: Read, WebFetch
---

# Accessibility

## Purpose
Implements WCAG 2.1 AA compliance across all interactive components. Ensures keyboard
navigation, screen reader compatibility, and color contrast requirements are met.
Every interactive element is reachable by keyboard and announced correctly.

## WCAG 2.1 AA Requirements (Cheatsheet)

| Criterion | Requirement | Test |
|-----------|-------------|------|
| 1.1.1 Alt Text | All images have alt | `<img alt="...">` |
| 1.4.3 Contrast | Text: 4.5:1, Large text: 3:1 | WebAIM Contrast Checker |
| 1.4.4 Resize | Content works at 200% zoom | Browser zoom test |
| 1.4.11 UI Contrast | UI components: 3:1 | Button border vs background |
| 2.1.1 Keyboard | All functionality via keyboard | Tab through the page |
| 2.1.2 No Trap | Users can escape any component | Modals close with Escape |
| 2.4.3 Focus Order | Logical focus sequence | Tab order matches visual order |
| 2.4.6 Headings | Descriptive heading labels | Heading hierarchy makes sense |
| 2.4.7 Focus Visible | Focus indicator always visible | Focus ring on all elements |
| 3.1.1 Language | `<html lang="en">` | Check root layout |
| 3.3.1 Error ID | Errors linked to fields | `aria-describedby` |
| 4.1.2 Name/Role | All UI has name, role, state | ARIA attributes |

## Semantic HTML First

```typescript
// ❌ Div soup
<div className="card" onClick={handleClick}>
  <div className="title">Product Name</div>
  <div className="price">$99</div>
  <div className="btn" onClick={handleDelete}>Delete</div>
</div>

// ✅ Semantic HTML
<article aria-label="Product Name">
  <h3>Product Name</h3>
  <p>$99.00</p>
  <button
    type="button"
    aria-label="Delete Product Name"
    onClick={handleDelete}
  >
    Delete
  </button>
</article>
```

## ARIA Patterns per Element Type

### Buttons and Links
```typescript
// Button: use <button> for actions
<button type="button" onClick={handleSave}>Save</button>

// Icon-only button: always label it
<button type="button" aria-label="Delete product">
  <TrashIcon aria-hidden="true" />
</button>

// Link: use <a> / <Link> for navigation
<Link href="/products">View all products</Link>

// "Learn more" links: disambiguate for screen readers
<Link href={`/products/${id}`} aria-label={`View details for ${name}`}>
  Learn more
</Link>
```

### Form Fields
```typescript
// Always pair label with input
<div className="flex flex-col gap-1.5">
  <label htmlFor="product-name" className="text-sm font-medium">
    Product name <span aria-label="required">*</span>
  </label>
  <input
    id="product-name"
    type="text"
    required
    aria-required="true"
    aria-describedby={error ? 'product-name-error' : 'product-name-hint'}
    aria-invalid={error ? true : undefined}
    className={cn('...', error && 'border-error')}
  />
  {/* Error: role="alert" for immediate announcement */}
  {error && (
    <p id="product-name-error" role="alert" className="text-xs text-error">
      {error}
    </p>
  )}
  {/* Hint: no role — announced on focus */}
  {!error && (
    <p id="product-name-hint" className="text-xs text-muted-foreground">
      Max 100 characters
    </p>
  )}
</div>
```

### Modal / Dialog
```typescript
// Use native <dialog> — best accessibility built-in
'use client'

function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      dialog.showModal()  // Adds focus trap + Escape key automatically
    } else {
      dialog.close()
      previousFocusRef.current?.focus() // Restore focus
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className="rounded-xl p-6 shadow-lg backdrop:bg-black/50"
    >
      <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
      <div id="dialog-description">{children}</div>
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute top-4 right-4"
      >
        ✕
      </button>
    </dialog>
  )
}
```

### Dropdown Menu
```typescript
'use client'

function Dropdown({ trigger, items }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
      items?.[0]?.focus()
    }
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="dropdown-menu"
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>

      {open && (
        <ul
          ref={menuRef}
          id="dropdown-menu"
          role="menu"
          aria-label="Options"
          className="absolute z-10 mt-1 rounded-md border border-border bg-surface-elevated shadow-lg"
        >
          {items.map((item, i) => (
            <li key={i} role="none">
              <button
                role="menuitem"
                className="w-full px-4 py-2 text-left text-sm hover:bg-surface focus:bg-surface focus:outline-none"
                onClick={() => { item.onClick(); setOpen(false) }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    const next = e.currentTarget.closest('li')?.nextElementSibling?.querySelector<HTMLElement>('[role="menuitem"]')
                    next?.focus()
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    const prev = e.currentTarget.closest('li')?.previousElementSibling?.querySelector<HTMLElement>('[role="menuitem"]')
                    prev?.focus() ?? triggerRef.current?.focus()
                  }
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Tabs
```typescript
function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div>
      <div role="tablist" aria-label="Content sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => {
              // Arrow key navigation between tabs
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const idx = tabs.findIndex((t) => t.id === activeTab)
                const next = e.key === 'ArrowRight'
                  ? tabs[(idx + 1) % tabs.length]
                  : tabs[(idx - 1 + tabs.length) % tabs.length]
                onChange(next.id)
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
```

### Loading States
```typescript
// Live region for dynamic content
<div aria-live="polite" aria-atomic="true">
  {isPending && <span className="sr-only">Loading products...</span>}
</div>

// Skeleton with accessible label
<div role="status" aria-label="Loading products">
  <Skeleton className="h-8 w-48" aria-hidden="true" />
  <Skeleton className="h-32 w-full" aria-hidden="true" />
</div>
```

## Focus Management

```typescript
// Skip link — allows keyboard users to skip nav
// Add as FIRST element inside <body>
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Skip to main content
    </a>
  )
}

// Main content landmark
<main id="main-content" tabIndex={-1}>
  {/* page content */}
</main>
```

## Color Contrast Requirements

```
Normal text:  4.5:1 minimum  (e.g., #64748B on white = fails; #475569 on white = passes)
Large text:   3.0:1 minimum  (18pt / 14pt bold+)
UI components: 3.0:1 minimum (button border vs background)

Test tool: https://webaim.org/resources/contrastchecker/
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `<div onClick={...}>` | `<button type="button">` | Not keyboard accessible |
| Color-only error indicator | Color + icon + text | Color blind users |
| `aria-label="Click here"` | `aria-label="Save product name"` | Descriptive, not generic |
| Missing `alt` on images | `alt="description"` or `alt=""` | Screen reader confusion |
| `tabIndex={1}` or higher | `tabIndex={0}` or `tabIndex={-1}` | Disrupts natural flow |
| `display: none` for focus-only skip link | `.sr-only` + `focus:not-sr-only` | Hidden but focusable |

## Quality Checklist
- [ ] All interactive elements reachable by Tab key
- [ ] All interactive elements operable by Enter/Space
- [ ] All dialogs/modals close with Escape and restore focus
- [ ] All form inputs have associated `<label>`
- [ ] All form errors use `role="alert"` or `aria-live`
- [ ] All images have `alt` attribute
- [ ] Icon-only buttons have `aria-label`
- [ ] Color contrast 4.5:1 for body text
- [ ] Skip link present for keyboard users
- [ ] `<html lang="en">` (or correct lang) in root layout

## Reference
See `references/aria-patterns.md` for complete ARIA patterns library.
