'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card } from '@/shared/components/ui/Card'
import { toast } from '@/shared/components/ui/Toast'
import { RecipeItemRow } from './RecipeItemRow'
import { RecipeItemSearch } from './RecipeItemSearch'
import { RecipeCostSummary } from './RecipeCostSummary'
import { useRecipeMutations } from '../hooks/useRecipeMutations'
import { useRecipeCost } from '../hooks/useRecipeCost'
import { CreateRecipeInputSchema, type CreateRecipeInput, type RecipeWithItems } from '../types'
import type { RecipeCostResult } from '@/shared/types'

interface RecipeBuilderProps {
  workspaceId: string
  workspaceSlug: string
  initialRecipe?: RecipeWithItems
  canViewCosts: boolean
}

type ItemState = {
  tempId: string
  ingredientId?: string
  subRecipeId?: string
  quantity: number
  unit: string
  name: string
}

export function RecipeBuilder({
  workspaceId,
  workspaceSlug,
  initialRecipe,
  canViewCosts,
}: RecipeBuilderProps) {
  const router = useRouter()
  const { createRecipe, updateRecipe } = useRecipeMutations(workspaceId)
  const { mutateAsync: computeCost, isPending: isCostLoading } = useRecipeCost()
  const [items, setItems] = useState<ItemState[]>(
    initialRecipe?.items.map((i) => ({
      tempId: i.id,
      ingredientId: i.ingredientId ?? undefined,
      subRecipeId: i.subRecipeId ?? undefined,
      quantity: i.quantity,
      unit: i.unit,
      name: i.ingredientName ?? i.subRecipeName ?? '',
    })) ?? []
  )
  const [cost, setCost] = useState<RecipeCostResult | null>(null)
  const costTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEdit = !!initialRecipe

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRecipeInput>({
    resolver: zodResolver(CreateRecipeInputSchema),
    defaultValues: initialRecipe
      ? {
          workspaceId,
          name: initialRecipe.name,
          category: initialRecipe.category ?? undefined,
          yield: initialRecipe.yield,
          yieldUnit: initialRecipe.yieldUnit,
          isSubRecipe: initialRecipe.isSubRecipe,
          sellingPrice: initialRecipe.sellingPrice ?? undefined,
          vatPercent: initialRecipe.vatPercent ?? undefined,
          laborCost: initialRecipe.laborCost ?? undefined,
          overheadCost: initialRecipe.overheadCost ?? undefined,
          salesVolume: initialRecipe.salesVolume ?? undefined,
        }
      : { workspaceId, isSubRecipe: false },
  })

  const scheduleCostCalc = useCallback(() => {
    if (!isEdit || !initialRecipe) return
    if (costTimerRef.current) clearTimeout(costTimerRef.current)
    costTimerRef.current = setTimeout(async () => {
      const result = await computeCost({ recipeId: initialRecipe.id, workspaceId })
      setCost(result)
    }, 500)
  }, [isEdit, initialRecipe, computeCost, workspaceId])

  useEffect(() => {
    if (isEdit) scheduleCostCalc()
    return () => { if (costTimerRef.current) clearTimeout(costTimerRef.current) }
  }, [items, scheduleCostCalc, isEdit])

  async function onSubmit(data: CreateRecipeInput) {
    const result = isEdit
      ? await updateRecipe.mutateAsync({ ...data, id: initialRecipe.id })
      : await createRecipe.mutateAsync(data)

    if (result.success) {
      toast.success(isEdit ? 'מתכון עודכן' : 'מתכון נוצר')
      const id = isEdit ? initialRecipe.id : (result as { data: { id: string } }).data?.id
      if (id) router.push(`/${workspaceSlug}/recipes/${id}`)
    }
  }

  function addItem(selected: { id: string; name: string; type: 'ingredient' | 'subRecipe'; unit: string }) {
    const item: ItemState = {
      tempId: crypto.randomUUID(),
      ingredientId: selected.type === 'ingredient' ? selected.id : undefined,
      subRecipeId: selected.type === 'subRecipe' ? selected.id : undefined,
      quantity: 1,
      unit: selected.unit,
      name: selected.name,
    }
    setItems((prev) => [...prev, item])
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId))
  }

  function updateItem(tempId: string, quantity: number, unit: string) {
    setItems((prev) =>
      prev.map((i) => i.tempId === tempId ? { ...i, quantity, unit } : i)
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Form + Items */}
      <div className="xl:col-span-2 space-y-6">
        <Card>
          <h2 className="text-lg font-bold text-foreground-secondary mb-4">
            {isEdit ? 'עריכת מתכון' : 'מתכון חדש'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <input type="hidden" {...register('workspaceId')} />
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="שם המתכון" error={errors.name?.message} {...register('name')} />
              </div>
              <Input label="קטגוריה (אופציונלי)" error={errors.category?.message} {...register('category')} />
              <Input label="מחיר מכירה (₪)" type="number" step="0.01" error={errors.sellingPrice?.message} {...register('sellingPrice')} />
              <Input label="תפוקה (כמות)" type="number" step="0.001" error={errors.yield?.message} {...register('yield', { valueAsNumber: true })} />
              <Input label="יחידת תפוקה" error={errors.yieldUnit?.message} {...register('yieldUnit')} />
              <Input label="מע״מ %" type="number" step="0.1" error={errors.vatPercent?.message} {...register('vatPercent', { valueAsNumber: true })} />
              <Input label="עלות עבודה (₪)" type="number" step="0.01" error={errors.laborCost?.message} {...register('laborCost')} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting}>
                {isEdit ? 'שמור שינויים' : 'צור מתכון'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Items */}
        <Card>
          <h2 className="text-lg font-bold text-foreground-secondary mb-4">חומרי גלם ומתכוני-משנה</h2>
          {items.length > 0 && (
            <div className="mb-4">
              {items.map((item) => (
                <RecipeItemRow
                  key={item.tempId}
                  item={{
                    id: item.tempId,
                    recipeId: initialRecipe?.id ?? '',
                    ingredientId: item.ingredientId ?? null,
                    subRecipeId: item.subRecipeId ?? null,
                    quantity: item.quantity,
                    unit: item.unit,
                    ingredientName: item.ingredientId ? item.name : undefined,
                    subRecipeName: item.subRecipeId ? item.name : undefined,
                  }}
                  onQuantityChange={(q, u) => updateItem(item.tempId, q, u)}
                  onRemove={() => removeItem(item.tempId)}
                />
              ))}
            </div>
          )}
          <RecipeItemSearch
            workspaceId={workspaceId}
            currentRecipeId={initialRecipe?.id ?? ''}
            onSelect={addItem}
          />
        </Card>
      </div>

      {/* Right: Cost summary */}
      <div>
        <RecipeCostSummary
          cost={cost}
          isLoading={isCostLoading}
          canViewCosts={canViewCosts}
        />
      </div>
    </div>
  )
}
