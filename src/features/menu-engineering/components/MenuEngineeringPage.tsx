'use client'

import { useState } from 'react'
import { MenuMatrix } from './MenuMatrix'
import { DishDetailPanel } from './DishDetailPanel'
import { QuadrantLabel } from './QuadrantLabel'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { useMenuEngineering } from '../hooks/useMenuEngineering'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { DishMatrixPoint } from '../types'

interface MenuEngineeringPageProps {
  workspaceId: string
}

export function MenuEngineeringPage({ workspaceId }: MenuEngineeringPageProps) {
  const [selectedDish, setSelectedDish] = useState<DishMatrixPoint | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const { data, isPending, error } = useMenuEngineering(workspaceId)

  if (isPending) {
    return <Skeleton className="h-96 w-full" />
  }

  if (error ?? !data) {
    return <p className="text-destructive">שגיאה בטעינת נתוני תפריט</p>
  }

  const categories = [...new Set(data.dishes.map((d) => d.category).filter(Boolean) as string[])]
  const filtered = categoryFilter
    ? data.dishes.filter((d) => d.category === categoryFilter)
    : data.dishes

  return (
    <div className="space-y-6">
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              !categoryFilter ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-surface-subtle'
            }`}
          >
            הכל
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                categoryFilter === cat ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:bg-surface-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {data.hasMissingSalesVolume && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-lg p-3">
          <span className="material-symbols-outlined text-warning text-base">info</span>
          <p className="text-sm text-warning">
            חלק מהמנות אין להן נתוני מכירות — ציר הפופולריות עלול להיות לא מייצג.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>מטריצת Menu Engineering</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuMatrix
              dishes={filtered}
              avgProfitability={data.avgProfitability}
              avgPopularity={data.avgPopularity}
              onSelectDish={setSelectedDish}
            />
          </CardContent>
        </Card>

        <DishDetailPanel dish={selectedDish} onClose={() => setSelectedDish(null)} />
      </div>

      {/* Quadrant summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['STAR', 'WORKHORSE', 'PUZZLE', 'DOG'] as const).map((q) => {
          const count = filtered.filter((d) => d.quadrant === q).length
          return (
            <Card key={q} padding="sm">
              <div className="flex items-center justify-between">
                <QuadrantLabel quadrant={q} />
                <Badge variant="default">{count}</Badge>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
