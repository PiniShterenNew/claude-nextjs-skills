'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { calculateRecipeCost } from '@/shared/lib/cost-engine'
import Decimal from 'decimal.js'
import type { ApiResponse } from '@/shared/types'
import type { ImpactResult } from '../types'
import type { CostEngineRecipe, CostEngineIngredient } from '@/shared/lib/cost-engine'

export async function getIngredientImpact(
  ingredientId: string,
  newPricePerUnit: string,
  workspaceId: string
): Promise<ApiResponse<ImpactResult>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  // Find all recipes using this ingredient
  const usageItems = await prisma.recipeItem.findMany({
    where: { ingredientId },
    select: { recipeId: true },
  })
  const affectedRecipeIds = [...new Set(usageItems.map((ri) => ri.recipeId))]

  if (affectedRecipeIds.length === 0) {
    return {
      success: true,
      data: { recipesAffected: 0, avgFoodCostBefore: 0, avgFoodCostAfter: 0, recipes: [] },
    }
  }

  // Fetch all workspace data for cost engine
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
      ...r,
      yield: r.yield,
      items: r.items.map((item) => ({ ...item, quantity: item.quantity })),
    }])
  )

  // Build ingredients map for "before" scenario
  const ingredientsMapBefore = new Map<string, CostEngineIngredient>(
    allIngredients.map((ing) => [ing.id, ing])
  )

  // Build ingredients map for "after" scenario (with new price)
  const ingredientsMapAfter = new Map<string, CostEngineIngredient>(
    allIngredients.map((ing) => [
      ing.id,
      ing.id === ingredientId
        ? { ...ing, pricePerUnit: new Decimal(newPricePerUnit) }
        : ing,
    ])
  )

  const results = affectedRecipeIds.map((recipeId) => {
    const recipe = recipesMap.get(recipeId)
    if (!recipe?.sellingPrice) return null

    try {
      const before = calculateRecipeCost(recipeId, recipesMap, ingredientsMapBefore, conversions)
      const after = calculateRecipeCost(recipeId, recipesMap, ingredientsMapAfter, conversions)
      return {
        id: recipeId,
        name: recipe.name,
        sellingPrice: Number(recipe.sellingPrice.toString()),
        foodCostBefore: before.foodCostPercent,
        foodCostAfter: after.foodCostPercent,
      }
    } catch {
      return null
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)

  const avgBefore = results.reduce((s, r) => s + r.foodCostBefore, 0) / (results.length || 1)
  const avgAfter = results.reduce((s, r) => s + r.foodCostAfter, 0) / (results.length || 1)

  return {
    success: true,
    data: {
      recipesAffected: results.length,
      avgFoodCostBefore: avgBefore,
      avgFoodCostAfter: avgAfter,
      recipes: results,
    },
  }
}
