'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Modal } from '@/shared/components/ui/Modal'
import { IngredientCard } from './IngredientCard'
import { IngredientForm } from './IngredientForm'
import { useIngredients } from '../hooks/useIngredients'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { IngredientRow } from '../types'

interface IngredientListClientProps {
  initialIngredients: IngredientRow[]
  workspaceId: string
  canViewCosts: boolean
  canEdit: boolean
}

export function IngredientListClient({
  initialIngredients,
  workspaceId,
  canViewCosts,
  canEdit,
}: IngredientListClientProps) {
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<IngredientRow | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const { data, isPending } = useIngredients(workspaceId, debouncedSearch || undefined)
  const ingredients = data?.items ?? initialIngredients

  function openEdit(ingredient: IngredientRow) {
    setEditingIngredient(ingredient)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingIngredient(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="חיפוש חומרי גלם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<span className="material-symbols-outlined text-base">search</span>}
          />
        </div>
        {canEdit && (
          <Button onClick={() => setIsFormOpen(true)}>
            <span className="material-symbols-outlined text-base">add</span>
            הוסף חומר גלם
          </Button>
        )}
      </div>

      {/* List */}
      {isPending && debouncedSearch ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : ingredients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <span className="material-symbols-outlined text-5xl">inventory_2</span>
          <p className="text-lg font-medium">אין חומרי גלם</p>
          {canEdit && (
            <Button onClick={() => setIsFormOpen(true)}>הוסף חומר גלם ראשון</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              canViewCosts={canViewCosts}
              canEdit={canEdit}
              onEdit={() => openEdit(ingredient)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={editingIngredient ? 'עריכת חומר גלם' : 'הוספת חומר גלם'}
        size="md"
      >
        <IngredientForm
          workspaceId={workspaceId}
          ingredient={editingIngredient}
          onSuccess={closeForm}
        />
      </Modal>
    </div>
  )
}
