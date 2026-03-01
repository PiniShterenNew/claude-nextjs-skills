'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'
import { RecipeItemInputSchema } from '../types'
import { detectCircularRef } from '../utils/circular-check'
import type { RecipeWithItems } from '../types'

export async function addRecipeItem(
  recipeId: string,
  workspaceId: string,
  rawInput: unknown
): Promise<ApiResponse<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = RecipeItemInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: 'נתונים לא תקינים' }
  }

  const { ingredientId, subRecipeId, quantity, unit } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER', 'CHEF'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  // Circular reference check for sub-recipes
  if (subRecipeId) {
    const allRecipes = await prisma.recipe.findMany({
      where: { workspaceId },
      include: { items: true },
    })

    const recipesForCheck: RecipeWithItems[] = allRecipes.map((r) => ({
      id: r.id,
      workspaceId: r.workspaceId,
      name: r.name,
      category: r.category,
      yield: r.yield.toNumber(),
      yieldUnit: r.yieldUnit,
      isSubRecipe: r.isSubRecipe,
      sellingPrice: r.sellingPrice?.toString() ?? null,
      vatPercent: r.vatPercent?.toNumber() ?? null,
      laborCost: r.laborCost?.toString() ?? null,
      overheadCost: r.overheadCost?.toString() ?? null,
      salesVolume: r.salesVolume,
      costStaleSince: r.costStaleSince,
      items: r.items.map((item) => ({
        id: item.id,
        recipeId: item.recipeId,
        ingredientId: item.ingredientId,
        subRecipeId: item.subRecipeId,
        quantity: item.quantity.toNumber(),
        unit: item.unit,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))

    if (detectCircularRef(recipeId, subRecipeId, recipesForCheck)) {
      return { success: false, error: 'לא ניתן להוסיף — נוצרת תלות מעגלית בין המתכונים' }
    }
  }

  const item = await prisma.recipeItem.create({
    data: {
      recipeId,
      ingredientId: ingredientId ?? null,
      subRecipeId: subRecipeId ?? null,
      quantity,
      unit,
    },
  })

  await prisma.recipe.update({
    where: { id: recipeId },
    data: { updatedAt: new Date() },
  })

  revalidateTag(`recipe:${recipeId}`)
  return { success: true, data: { id: item.id } }
}
