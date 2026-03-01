'use server'

import { unstable_cache } from 'next/cache'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { calculateRecipeCost as costEngine } from '@/shared/lib/cost-engine'
import type { ApiResponse } from '@/shared/types'
import type { RecipeCostResult } from '@/shared/types'
import type { CostEngineRecipe, CostEngineIngredient } from '@/shared/lib/cost-engine'

async function fetchAndCalculate(
  recipeId: string,
  workspaceId: string
): Promise<RecipeCostResult> {
  const [allRecipes, allIngredients, conversions] = await Promise.all([
    prisma.recipe.findMany({
      where: { workspaceId },
      include: { items: true },
    }),
    prisma.ingredient.findMany({ where: { workspaceId } }),
    prisma.unitConversion.findMany(),
  ])

  const recipesMap = new Map<string, CostEngineRecipe>(
    allRecipes.map((r) => [r.id, {
      id: r.id,
      name: r.name,
      yield: r.yield,
      yieldUnit: r.yieldUnit,
      isSubRecipe: r.isSubRecipe,
      sellingPrice: r.sellingPrice,
      vatPercent: r.vatPercent,
      laborCost: r.laborCost,
      overheadCost: r.overheadCost,
      salesVolume: r.salesVolume,
      costStaleSince: r.costStaleSince,
      items: r.items.map((item) => ({
        id: item.id,
        ingredientId: item.ingredientId,
        subRecipeId: item.subRecipeId,
        quantity: item.quantity,
        unit: item.unit,
      })),
    }])
  )

  const ingredientsMap = new Map<string, CostEngineIngredient>(
    allIngredients.map((ing) => [ing.id, ing])
  )

  return costEngine(recipeId, recipesMap, ingredientsMap, conversions)
}

export async function calculateRecipeCost(
  recipeId: string,
  workspaceId: string
): Promise<ApiResponse<RecipeCostResult>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  try {
    const result = await unstable_cache(
      () => fetchAndCalculate(recipeId, workspaceId),
      [`recipe-cost-${recipeId}`],
      { tags: [`recipe:${recipeId}`, `workspace:${workspaceId}`] }
    )()

    return { success: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'שגיאת חישוב עלות'
    return { success: false, error: message }
  }
}
