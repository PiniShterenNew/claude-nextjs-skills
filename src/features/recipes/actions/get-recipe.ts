'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'
import type { RecipeWithItems } from '../types'

export async function getRecipe(
  recipeId: string,
  workspaceId: string
): Promise<ApiResponse<RecipeWithItems>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member) return { success: false, error: 'אין גישה', code: 'FORBIDDEN' }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      items: {
        include: {
          ingredient: { select: { name: true } },
          subRecipe: { select: { name: true } },
        },
      },
    },
  })

  if (!recipe || recipe.workspaceId !== workspaceId) {
    return { success: false, error: 'מתכון לא נמצא' }
  }

  return {
    success: true,
    data: {
      id: recipe.id,
      workspaceId: recipe.workspaceId,
      name: recipe.name,
      category: recipe.category,
      yield: recipe.yield.toNumber(),
      yieldUnit: recipe.yieldUnit,
      isSubRecipe: recipe.isSubRecipe,
      sellingPrice: recipe.sellingPrice?.toString() ?? null,
      vatPercent: recipe.vatPercent?.toNumber() ?? null,
      laborCost: recipe.laborCost?.toString() ?? null,
      overheadCost: recipe.overheadCost?.toString() ?? null,
      salesVolume: recipe.salesVolume,
      costStaleSince: recipe.costStaleSince,
      items: recipe.items.map((item) => ({
        id: item.id,
        recipeId: item.recipeId,
        ingredientId: item.ingredientId,
        subRecipeId: item.subRecipeId,
        quantity: item.quantity.toNumber(),
        unit: item.unit,
        ingredientName: item.ingredient?.name,
        subRecipeName: item.subRecipe?.name,
      })),
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    },
  }
}
