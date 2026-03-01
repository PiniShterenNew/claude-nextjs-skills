'use client'

import { useState } from 'react'
import { Input } from '@/shared/components/ui/Input'
import { INGREDIENT_UNITS } from '@/features/ingredients/types'
import type { RecipeItemResolved } from '../types'

interface RecipeItemRowProps {
  item: RecipeItemResolved
  onQuantityChange: (quantity: number, unit: string) => void
  onRemove: () => void
}

export function RecipeItemRow({ item, onQuantityChange, onRemove }: RecipeItemRowProps) {
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [unit, setUnit] = useState(item.unit)

  const name = item.ingredientName ?? item.subRecipeName ?? 'לא ידוע'
  const icon = item.ingredientId ? 'inventory_2' : 'restaurant_menu'

  function handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuantity(val)
    const num = parseFloat(val)
    if (!isNaN(num) && num > 0) {
      onQuantityChange(num, unit)
    }
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newUnit = e.target.value
    setUnit(newUnit)
    const num = parseFloat(quantity)
    if (!isNaN(num) && num > 0) {
      onQuantityChange(num, newUnit)
    }
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="material-symbols-outlined text-muted-foreground text-base shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium text-foreground truncate">{name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <Input
          type="number"
          className="w-20 text-center"
          value={quantity}
          onChange={handleQuantityChange}
          min="0.001"
          step="0.001"
        />
        <select
          className="h-9 rounded-lg border border-border bg-surface text-sm px-2 focus:outline-none focus:ring-2 focus:ring-border-focus/20"
          value={unit}
          onChange={handleUnitChange}
        >
          {INGREDIENT_UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <button
          onClick={onRemove}
          className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
          aria-label="הסר פריט"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  )
}
