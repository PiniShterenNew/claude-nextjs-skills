'use client'

import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { formatILS } from '@/shared/lib/decimal'
import type { RecipeCostResult } from '@/shared/types'

interface RecipeCostSummaryProps {
  cost: RecipeCostResult | null
  isLoading?: boolean
  canViewCosts: boolean
}

export function RecipeCostSummary({ cost, isLoading, canViewCosts }: RecipeCostSummaryProps) {
  if (!canViewCosts) return null

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </Card>
    )
  }

  if (!cost) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground text-center py-4">
          הוסף חומרי גלם כדי לחשב עלות
        </p>
      </Card>
    )
  }

  const foodCostColor = cost.foodCostPercent > 35 ? 'destructive' : cost.foodCostPercent > 28 ? 'warning' : 'success'

  return (
    <Card>
      <h3 className="font-bold text-foreground-secondary mb-4">סיכום עלויות</h3>
      <div className="space-y-3">
        <Row label="עלות חומרי גלם" value={formatILS(cost.ingredientCost)} />
        {cost.laborCost > 0 && <Row label="עלות עבודה" value={formatILS(cost.laborCost)} />}
        {cost.overheadCost > 0 && <Row label="עלות תקורה" value={formatILS(cost.overheadCost)} />}
        <div className="pt-2 border-t border-border">
          <Row label="סה״כ עלות" value={formatILS(cost.totalCost)} bold />
        </div>
        {cost.sellingPrice > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            <Row label="מחיר מכירה (לפני מע״מ)" value={formatILS(cost.sellingPrice)} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Food Cost %</span>
              <Badge variant={foodCostColor}>{cost.foodCostPercent.toFixed(1)}%</Badge>
            </div>
            <Row label="רווח גולמי" value={formatILS(cost.grossProfit)} />
            <Row label="מרווח גולמי" value={`${cost.grossMargin.toFixed(1)}%`} />
          </div>
        )}
      </div>
    </Card>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <span className={`text-sm ${bold ? 'font-bold text-foreground' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}
