# ARIA Patterns Reference

## Complete Role Reference

| Role | Element | When to use |
|------|---------|-------------|
| `button` | `<button>` (preferred) or `div[role="button"]` | Triggers action |
| `link` | `<a>` (preferred) or `div[role="link"]` | Navigation |
| `menu` | `<ul role="menu">` | Context menu, dropdown |
| `menuitem` | `<li role="menuitem">` | Item inside menu |
| `menuitemcheckbox` | `<li role="menuitemcheckbox">` | Checkable menu item |
| `tab` | `<button role="tab">` | Tab navigation |
| `tabpanel` | `<div role="tabpanel">` | Tab content |
| `tablist` | `<div role="tablist">` | Container for tabs |
| `dialog` | `<dialog>` (preferred) | Modal dialog |
| `alertdialog` | `<dialog role="alertdialog">` | Confirmation/destructive |
| `alert` | `<div role="alert">` | Error/important message |
| `status` | `<div role="status">` | Loading/success feedback |
| `progressbar` | `<div role="progressbar">` | Progress indication |
| `tooltip` | `<div role="tooltip">` | Hover tooltip |
| `combobox` | Input + listbox | Autocomplete, select |
| `listbox` | `<ul role="listbox">` | Selection list |
| `option` | `<li role="option">` | Selectable item |

## Tooltip

```typescript
'use client'

import { useState, useRef, useId } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactElement
}

function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        'aria-describedby': visible ? id : undefined,
        onMouseEnter: () => setVisible(true),
        onMouseLeave: () => setVisible(false),
        onFocus: () => setVisible(true),
        onBlur: () => setVisible(false),
      })}

      {visible && (
        <div
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded text-xs text-white bg-foreground whitespace-nowrap z-50"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  )
}
```

## Accordion

```typescript
'use client'

function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div>
      {items.map((item) => {
        const isOpen = openId === item.id
        const headingId = `accordion-heading-${item.id}`
        const panelId = `accordion-panel-${item.id}`

        return (
          <div key={item.id} className="border-b border-border">
            <h3>
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
              >
                {item.title}
                <ChevronDown
                  aria-hidden="true"
                  className={cn('transition-transform', isOpen && 'rotate-180')}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              className="pb-4 text-sm text-muted-foreground"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

## Combobox (Autocomplete)

```typescript
'use client'

function Combobox({ options, value, onChange, placeholder }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputId = useId()
  const listId = useId()

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setOpen(true)
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (activeIndex >= 0 && filtered[activeIndex]) {
          onChange(filtered[activeIndex].value)
          setQuery(filtered[activeIndex].label)
          setOpen(false)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={activeIndex >= 0 ? `option-${filtered[activeIndex]?.value}` : undefined}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border border-border px-3 py-2"
      />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface-elevated shadow-lg"
        >
          {filtered.map((option, i) => (
            <li
              key={option.value}
              id={`option-${option.value}`}
              role="option"
              aria-selected={value === option.value}
              className={cn(
                'px-3 py-2 cursor-pointer text-sm',
                activeIndex === i && 'bg-primary/10',
                value === option.value && 'font-medium'
              )}
              onClick={() => {
                onChange(option.value)
                setQuery(option.label)
                setOpen(false)
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Data Table with Sort

```typescript
interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  caption,
}: {
  data: T[]
  columns: Column<T>[]
  caption: string
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: keyof T) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {/* Screen reader-only caption describes the table */}
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                aria-sort={
                  sortKey === col.key
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : col.sortable ? 'none' : undefined
                }
                className="px-4 py-3 text-left font-medium text-foreground"
              >
                {col.sortable ? (
                  <button
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <span aria-hidden="true">
                      {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-t border-border">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3">
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Screen Reader Only Utility

```css
/* Add to globals.css — Tailwind's sr-only class covers this */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Usage:
```typescript
// Text only visible to screen readers
<span className="sr-only">Loading, please wait</span>

// Icon-only button with hidden label
<button type="button">
  <Trash2Icon aria-hidden="true" className="h-4 w-4" />
  <span className="sr-only">Delete {item.name}</span>
</button>
```
