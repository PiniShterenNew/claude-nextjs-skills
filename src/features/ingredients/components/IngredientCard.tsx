import { Card } from '@/shared/components/ui/Card'
import { formatILS } from '@/shared/lib/decimal'
import type { IngredientRow } from '../types'

interface IngredientCardProps {
  ingredient: IngredientRow
  canViewCosts: boolean
  canEdit: boolean
  onEdit?: () => void
}

export function IngredientCard({
  ingredient,
  canViewCosts,
  canEdit,
  onEdit,
}: IngredientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{ingredient.name}</h3>
          <p className="text-sm text-muted-foreground">{ingredient.unit}</p>
          {ingredient.supplier && (
            <p className="text-xs text-muted-foreground mt-1">ספק: {ingredient.supplier}</p>
          )}
        </div>
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            aria-label="ערוך חומר גלם"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
        )}
      </div>

      {canViewCosts && (
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">מחיר ל{ingredient.unit}</p>
            <p className="font-medium text-foreground">{formatILS(ingredient.pricePerUnit)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">מחיר אפקטיבי (עם בזבוז)</p>
            <p className="font-medium text-foreground">{formatILS(ingredient.effectivePrice)}</p>
          </div>
          {ingredient.wastePercent.greaterThan(0) && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">
                בזבוז: {ingredient.wastePercent.toString()}%
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
