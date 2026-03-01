'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { calculateRecipeCost } from '@/shared/lib/cost-engine'
import type { ApiResponse } from '@/shared/types'
import type { MenuEngineeringData, DishMatrixPoint } from '../types'
import { classifyDish } from '../utils/classify-dish'
import type { CostEngineRecipe, CostEngineIngredient } from '@/shared/lib/cost-engine'

export async function getMenuEngineeringData(
  workspaceId: string
): Promise<ApiResponse<MenuEngineeringData>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const [allRecipes, allIngredients, conversions] = await Promise.all([
    prisma.recipe.findMany({ where: { workspaceId }, include: { items: true } }),
    prisma.ingredient.findMany({ where: { workspaceId } }),
    prisma.unitConversion.findMany(),
  ])

  const mainRecipes = allRecipes.filter((r) => !r.isSubRecipe && r.sellingPrice)

  const recipesMap = new Map<string, CostEngineRecipe>(
    allRecipes.map((r) => [r.id, {
      ...r,
      items: r.items.map((i) => ({ ...i, quantity: i.quantity })),
    }])
  )
  const ingredientsMap = new Map<string, CostEngineIngredient>(
    allIngredients.map((i) => [i.id, i])
  )

  const points: Array<Omit<DishMatrixPoint, 'quadrant'>> = []
  let hasMissingSalesVolume = false

  for (const recipe of mainRecipes) {
    try {
      const cost = calculateRecipeCost(recipe.id, recipesMap, ingredientsMap, conversions)
      const popularity = recipe.salesVolume ?? 0
      if (!recipe.salesVolume) hasMissingSalesVolume = true

      points.push({
        recipeId: recipe.id,
        name: recipe.name,
        category: recipe.category,
        profitability: cost.grossMargin,
        popularity,
        grossMargin: cost.grossMargin,
        foodCostPercent: cost.foodCostPercent,
        totalCost: cost.totalCost,
        sellingPrice: cost.sellingPrice,
      })
    } catch {
      // Skip
    }
  }

  const avgProfitability = points.length
    ? points.reduce((s, p) => s + p.profitability, 0) / points.length
    : 0
  const avgPopularity = points.length
    ? points.reduce((s, p) => s + p.popularity, 0) / points.length
    : 0

  const dishes: DishMatrixPoint[] = points.map((p) => ({
    ...p,
    quadrant: classifyDish(p.profitability, avgProfitability, p.popularity, avgPopularity),
  }))

  return {
    success: true,
    data: { dishes, avgProfitability, avgPopularity, hasMissingSalesVolume },
  }
}
