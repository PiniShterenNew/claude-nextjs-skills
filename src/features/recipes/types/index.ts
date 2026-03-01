import { z } from 'zod'

export const RecipeItemInputSchema = z
  .object({
    ingredientId: z.string().optional(),
    subRecipeId: z.string().optional(),
    quantity: z.number().positive('כמות חייבת להיות חיובית'),
    unit: z.string().min(1, 'יחידה נדרשת'),
  })
  .superRefine((data, ctx) => {
    const hasIngredient = !!data.ingredientId
    const hasSubRecipe = !!data.subRecipeId
    if (hasIngredient === hasSubRecipe) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'יש לבחור חומר גלם או מתכון-משנה — לא שניהם ולא אף אחד',
      })
    }
  })
export type RecipeItemInput = z.infer<typeof RecipeItemInputSchema>

export const CreateRecipeInputSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1, 'שם מתכון נדרש').max(200),
  category: z.string().max(100).optional(),
  yield: z.number().positive('כמות תפוקה חייבת להיות חיובית'),
  yieldUnit: z.string().min(1, 'יחידת תפוקה נדרשת'),
  isSubRecipe: z.boolean().default(false),
  sellingPrice: z.string().optional().transform((v) => v === '' ? undefined : v),
  vatPercent: z.number().min(0).max(100).optional(),
  laborCost: z.string().optional().transform((v) => v === '' ? undefined : v),
  overheadCost: z.string().optional().transform((v) => v === '' ? undefined : v),
  salesVolume: z.number().int().positive().optional(),
  items: z.array(RecipeItemInputSchema).optional().default([]),
})
export type CreateRecipeInput = z.infer<typeof CreateRecipeInputSchema>

export const UpdateRecipeInputSchema = CreateRecipeInputSchema.extend({
  id: z.string(),
}).partial().extend({ id: z.string(), workspaceId: z.string() })
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeInputSchema>

export interface RecipeRow {
  id: string
  name: string
  category: string | null
  yield: number
  yieldUnit: string
  isSubRecipe: boolean
  sellingPrice: string | null
  costStaleSince: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface RecipeItemResolved {
  id: string
  recipeId: string
  ingredientId: string | null
  subRecipeId: string | null
  quantity: number
  unit: string
  // Resolved names
  ingredientName?: string
  subRecipeName?: string
}

export interface RecipeWithItems {
  id: string
  workspaceId: string
  name: string
  category: string | null
  yield: number
  yieldUnit: string
  isSubRecipe: boolean
  sellingPrice: string | null
  vatPercent: number | null
  laborCost: string | null
  overheadCost: string | null
  salesVolume: number | null
  costStaleSince: Date | null
  items: RecipeItemResolved[]
  createdAt: Date
  updatedAt: Date
}
