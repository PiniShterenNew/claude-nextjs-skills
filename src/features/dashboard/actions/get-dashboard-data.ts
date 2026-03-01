'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { calculateRecipeCost } from '@/shared/lib/cost-engine'
import type { ApiResponse } from '@/shared/types'
import type { DashboardData, RecipeCostRow, AlertRow, ThresholdStatus } from '../types'
import type { CostEngineRecipe, CostEngineIngredient } from '@/shared/lib/cost-engine'

export async function getDashboardData(
  workspaceId: string
): Promise<ApiResponse<DashboardData>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  const threshold = workspace?.foodCostThreshold.toNumber() ?? 30

  const [allRecipes, allIngredients, conversions, recentAuditLogs] = await Promise.all([
    prisma.recipe.findMany({ where: { workspaceId }, include: { items: true } }),
    prisma.ingredient.findMany({ where: { workspaceId } }),
    prisma.unitConversion.findMany(),
    prisma.auditLog.findMany({
      where: { workspaceId, entityType: 'Ingredient', action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { actor: { select: { name: true } } },
    }),
  ])

  const mainRecipes = allRecipes.filter((r) => !r.isSubRecipe)

  const recipesMap = new Map<string, CostEngineRecipe>(
    allRecipes.map((r) => [r.id, {
      ...r,
      items: r.items.map((i) => ({ ...i, quantity: i.quantity })),
    }])
  )
  const ingredientsMap = new Map<string, CostEngineIngredient>(
    allIngredients.map((i) => [i.id, i])
  )

  const recipeCostRows: RecipeCostRow[] = []

  for (const recipe of mainRecipes) {
    if (!recipe.sellingPrice) continue
    try {
      const cost = calculateRecipeCost(recipe.id, recipesMap, ingredientsMap, conversions)
      const status: ThresholdStatus =
        cost.foodCostPercent > threshold ? 'alert'
        : cost.foodCostPercent > threshold - 5 ? 'warning'
        : 'ok'

      recipeCostRows.push({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        foodCostPercent: cost.foodCostPercent,
        grossMargin: cost.grossMargin,
        isStale: cost.isStale,
        thresholdStatus: status,
      })
    } catch {
      // Skip recipes with calculation errors
    }
  }

  const avgFoodCost = recipeCostRows.length
    ? recipeCostRows.reduce((s, r) => s + r.foodCostPercent, 0) / recipeCostRows.length
    : 0

  const sorted = [...recipeCostRows].sort((a, b) => b.grossMargin - a.grossMargin)
  const mostProfitable = sorted[0] ?? null
  const mostExpensive = [...recipeCostRows].sort(
    (a, b) => b.foodCostPercent - a.foodCostPercent
  )[0] ?? null

  // Build alerts from audit logs
  const ingredientMap = new Map(allIngredients.map((i) => [i.id, i.name]))
  const usageMap = new Map<string, number>()
  for (const item of await prisma.recipeItem.findMany({ where: {} })) {
    if (item.ingredientId) {
      usageMap.set(item.ingredientId, (usageMap.get(item.ingredientId) ?? 0) + 1)
    }
  }

  const alerts: AlertRow[] = recentAuditLogs.map((log) => ({
    ingredientId: log.entityId,
    ingredientName: ingredientMap.get(log.entityId) ?? log.entityId,
    changedAt: log.createdAt,
    affectedRecipeCount: usageMap.get(log.entityId) ?? 0,
    actorName: log.actor.name,
    changeDescription: 'עדכון מחיר',
  }))

  return {
    success: true,
    data: {
      kpis: {
        avgFoodCostPercent: avgFoodCost,
        mostProfitableRecipe: mostProfitable
          ? { name: mostProfitable.name, grossMargin: mostProfitable.grossMargin }
          : null,
        mostExpensiveRecipe: mostExpensive
          ? { name: mostExpensive.name, totalCost: mostExpensive.foodCostPercent }
          : null,
        recipesOverThreshold: recipeCostRows.filter((r) => r.thresholdStatus === 'alert').length,
      },
      recipeCostRows,
      alerts,
    },
  }
}
