'use client'

import { Card } from '@/shared/components/ui/Card'
import { QuadrantLabel } from './QuadrantLabel'
import { formatILS } from '@/shared/lib/decimal'
import type { DishMatrixPoint } from '../types'

const RECOMMENDATIONS: Record<string, string> = {
  STAR: 'מנה מנצחת — שמר על המחיר ועל האיכות. שקול להציג אותה בצורה בולטת בתפריט.',
  WORKHORSE: 'פופולרי אך רווחיות נמוכה — בחן האם ניתן להעלות מחיר בלי לאבד לקוחות.',
  PUZZLE: 'רווחי אך לא פופולרי — שפר את ההצגה בתפריט או הצע מבצע כדי לגדל את המכירות.',
  DOG: 'מנה בעייתית — שקול הסרה מהתפריט או שינוי משמעותי במתכון/מחיר.',
}

interface DishDetailPanelProps {
  dish: DishMatrixPoint | null
  onClose?: () => void
}

export function DishDetailPanel({ dish, onClose }: DishDetailPanelProps) {
  if (!dish) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">בחר מנה מהמטריצה לפרטים</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground-secondary">{dish.name}</h3>
          {dish.category && <p className="text-sm text-muted-foreground">{dish.category}</p>}
        </div>
        <div className="flex items-center gap-2">
          <QuadrantLabel quadrant={dish.quadrant} />
          {onClose && (
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <MetricRow label="מחיר מכירה" value={formatILS(dish.sellingPrice)} />
        <MetricRow label="עלות" value={formatILS(dish.totalCost)} />
        <MetricRow label="Food Cost %" value={`${dish.foodCostPercent.toFixed(1)}%`} />
        <MetricRow label="מרווח גולמי" value={`${dish.grossMargin.toFixed(1)}%`} />
        <MetricRow label="כמות מכירות" value={dish.popularity > 0 ? dish.popularity.toString() : 'לא הוגדר'} />
      </div>

      <div className="mt-4 p-3 bg-surface-subtle rounded-lg">
        <p className="text-xs font-semibold text-muted-foreground mb-1">המלצה</p>
        <p className="text-sm text-foreground">{RECOMMENDATIONS[dish.quadrant]}</p>
      </div>
    </Card>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
