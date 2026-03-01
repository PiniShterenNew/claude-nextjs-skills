'use client'

import { useState } from 'react'
import { Input } from '@/shared/components/ui/Input'
import { useIngredients } from '@/features/ingredients/hooks/useIngredients'
import { useRecipes } from '../hooks/useRecipes'
import { useDebounce } from '@/shared/hooks/useDebounce'

interface SearchResultItem {
  id: string
  name: string
  type: 'ingredient' | 'subRecipe'
  unit: string
}

interface RecipeItemSearchProps {
  workspaceId: string
  currentRecipeId: string
  onSelect: (item: SearchResultItem) => void
}

export function RecipeItemSearch({
  workspaceId,
  currentRecipeId,
  onSelect,
}: RecipeItemSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const { data: ingredientsData } = useIngredients(workspaceId, debouncedQuery || undefined)
  const { data: subRecipesData } = useRecipes(workspaceId, { isSubRecipe: true })

  const ingredients = (ingredientsData?.items ?? []).filter((i) =>
    i.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  )
  const subRecipes = (subRecipesData ?? []).filter(
    (r) => r.id !== currentRecipeId && r.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  )

  const hasResults = ingredients.length > 0 || subRecipes.length > 0

  function handleSelect(item: SearchResultItem) {
    onSelect(item)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Input
        placeholder="חפש חומר גלם או מתכון-משנה..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        startIcon={<span className="material-symbols-outlined text-base">add</span>}
      />

      {isOpen && query.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">לא נמצאו תוצאות</p>
          ) : (
            <>
              {ingredients.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground bg-surface-subtle">
                    חומרי גלם
                  </p>
                  {ingredients.map((ing) => (
                    <button
                      key={ing.id}
                      onMouseDown={() =>
                        handleSelect({ id: ing.id, name: ing.name, type: 'ingredient', unit: ing.unit })
                      }
                      className="w-full text-start px-4 py-2 text-sm hover:bg-surface-subtle flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base text-muted-foreground">inventory_2</span>
                      <span>{ing.name}</span>
                      <span className="text-muted-foreground text-xs ms-auto">{ing.unit}</span>
                    </button>
                  ))}
                </div>
              )}
              {subRecipes.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground bg-surface-subtle">
                    מתכוני-משנה
                  </p>
                  {subRecipes.map((r) => (
                    <button
                      key={r.id}
                      onMouseDown={() =>
                        handleSelect({ id: r.id, name: r.name, type: 'subRecipe', unit: r.yieldUnit })
                      }
                      className="w-full text-start px-4 py-2 text-sm hover:bg-surface-subtle flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base text-muted-foreground">restaurant_menu</span>
                      <span>{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
