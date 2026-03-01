'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { useIngredientMutations } from '../hooks/useIngredientMutations'
import { CreateIngredientInputSchema, INGREDIENT_UNITS, type IngredientRow } from '../types'
import { effectivePrice } from '../utils/effective-price'
import { formatILS } from '@/shared/lib/decimal'
import { z } from 'zod'

type FormValues = z.input<typeof CreateIngredientInputSchema>

const UNIT_OPTIONS = INGREDIENT_UNITS.map((u) => ({ value: u, label: u }))

interface IngredientFormProps {
  workspaceId: string
  ingredient?: IngredientRow | null
  onSuccess?: () => void
}

export function IngredientForm({ workspaceId, ingredient, onSuccess }: IngredientFormProps) {
  const { createIngredient, updateIngredient } = useIngredientMutations(workspaceId)
  const isEdit = !!ingredient

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateIngredientInputSchema),
    defaultValues: isEdit
      ? {
          workspaceId,
          name: ingredient.name,
          unit: ingredient.unit as FormValues['unit'],
          pricePerUnit: ingredient.pricePerUnit.toString(),
          wastePercent: ingredient.wastePercent.toNumber(),
          supplier: ingredient.supplier ?? undefined,
        }
      : { workspaceId, wastePercent: 0 },
  })

  const priceValue = watch('pricePerUnit')
  const wasteValue = watch('wastePercent') ?? 0

  let previewPrice: string | null = null
  try {
    previewPrice = formatILS(effectivePrice(priceValue ?? '0', wasteValue))
  } catch {
    previewPrice = null
  }

  async function onSubmit(data: FormValues) {
    const mutation = isEdit ? updateIngredient : createIngredient
    const payload = isEdit ? { ...data, id: ingredient.id } : data
    await mutation.mutateAsync(payload)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register('workspaceId')} />

      <Input
        label="שם חומר גלם"
        error={errors.name?.message}
        {...register('name')}
      />

      <Controller
        name="unit"
        control={control}
        render={({ field }) => (
          <Select
            label="יחידת מידה"
            options={UNIT_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.unit?.message}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="מחיר ליחידה (₪)"
          type="number"
          step="0.0001"
          min="0"
          error={errors.pricePerUnit?.message}
          {...register('pricePerUnit')}
        />
        <Input
          label="% בזבוז"
          type="number"
          step="0.1"
          min="0"
          max="100"
          error={errors.wastePercent?.message}
          {...register('wastePercent', { valueAsNumber: true })}
        />
      </div>

      {previewPrice && wasteValue > 0 && (
        <p className="text-sm text-muted-foreground">
          מחיר אפקטיבי (כולל בזבוז): <strong>{previewPrice}</strong>
        </p>
      )}

      <Input
        label="ספק (אופציונלי)"
        error={errors.supplier?.message}
        {...register('supplier')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? 'שמור שינויים' : 'הוסף חומר גלם'}
        </Button>
      </div>
    </form>
  )
}
