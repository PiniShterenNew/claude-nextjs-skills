import { z } from 'zod'
import type Decimal from 'decimal.js'

export const INGREDIENT_UNITS = [
  'kg', 'g', 'mg',
  'liter', 'ml', 'cl',
  'unit',
  'tbsp', 'tsp', 'cup',
] as const

export type IngredientUnit = typeof INGREDIENT_UNITS[number]

export const CreateIngredientInputSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1, 'שם חומר גלם נדרש').max(200),
  unit: z.enum(INGREDIENT_UNITS),
  pricePerUnit: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'מחיר לא תקין')
    .transform(Number)
    .refine((v) => v >= 0, 'מחיר חייב להיות חיובי'),
  wastePercent: z.number().min(0).max(100).default(0),
  supplier: z.string().max(200).optional(),
})
export type CreateIngredientInput = z.infer<typeof CreateIngredientInputSchema>

export const UpdateIngredientInputSchema = CreateIngredientInputSchema.extend({
  id: z.string(),
}).partial().extend({ id: z.string(), workspaceId: z.string() })
export type UpdateIngredientInput = z.infer<typeof UpdateIngredientInputSchema>

export interface IngredientRow {
  id: string
  name: string
  unit: string
  pricePerUnit: Decimal
  wastePercent: Decimal
  supplier: string | null
  pricedAt: Date
  effectivePrice: Decimal   // computed: pricePerUnit * (1 + wastePercent/100)
  createdAt: Date
  updatedAt: Date
}

export interface ImpactRecipeItem {
  id: string
  name: string
  foodCostBefore: number
  foodCostAfter: number
  sellingPrice: number
}

export interface ImpactResult {
  recipesAffected: number
  avgFoodCostBefore: number
  avgFoodCostAfter: number
  recipes: ImpactRecipeItem[]
}
