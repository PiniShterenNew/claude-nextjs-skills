import { Table } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/Badge'
import { CostThresholdBadge } from './CostThresholdBadge'
import type { RecipeCostRow } from '../types'

interface RecipeCostTableProps {
  rows: RecipeCostRow[]
  threshold: number
  canViewCosts: boolean
}

export function RecipeCostTable({ rows, threshold, canViewCosts }: RecipeCostTableProps) {
  return (
    <Table
      caption="טבלת עלויות מתכונים"
      keyExtractor={(r) => r.id}
      data={rows}
      emptyState="אין מתכונים עם מחיר מכירה"
      columns={[
        { key: 'name', header: 'שם מתכון', render: (r) => (
          <div>
            <p className="font-medium text-foreground">{r.name}</p>
            {r.category && <p className="text-xs text-muted-foreground">{r.category}</p>}
          </div>
        )},
        ...(canViewCosts
          ? [
              {
                key: 'foodCostPercent' as keyof RecipeCostRow,
                header: 'Food Cost %',
                render: (r: RecipeCostRow) => (
                  <CostThresholdBadge foodCostPercent={r.foodCostPercent} threshold={threshold} />
                ),
              },
              {
                key: 'grossMargin' as keyof RecipeCostRow,
                header: 'מרווח גולמי',
                render: (r: RecipeCostRow) => (
                  <span className="text-sm font-medium">{r.grossMargin.toFixed(1)}%</span>
                ),
              },
            ]
          : []),
        {
          key: 'isStale' as keyof RecipeCostRow,
          header: 'סטטוס',
          render: (r: RecipeCostRow) =>
            r.isStale ? <Badge variant="warning">לא עדכני</Badge> : null,
        },
      ]}
    />
  )
}
