'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/cn'

interface Tab {
  id: string
  label: string
  content?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (id: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '')

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const isRTL = document.dir === 'rtl'
    const nextKey = isRTL ? 'ArrowLeft' : 'ArrowRight'
    const prevKey = isRTL ? 'ArrowRight' : 'ArrowLeft'

    if (e.key === nextKey) {
      const next = tabs[(index + 1) % tabs.length]
      if (next) { setActiveTab(next.id); onChange?.(next.id) }
    } else if (e.key === prevKey) {
      const prev = tabs[(index - 1 + tabs.length) % tabs.length]
      if (prev) { setActiveTab(prev.id); onChange?.(prev.id) }
    }
  }

  function selectTab(id: string) {
    setActiveTab(id)
    onChange?.(id)
  }

  const activeContent = tabs.find((t) => t.id === activeTab)?.content

  return (
    <div className={cn('w-full', className)}>
      <div role="tablist" className="flex gap-1 border-b border-border mb-4" aria-label="Tabs">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeContent && (
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeContent}
        </div>
      )}
    </div>
  )
}
