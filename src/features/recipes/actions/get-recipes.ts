'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'
import type { RecipeRow } from '../types'

interface GetRecipesInput {
  workspaceId: string
  category?: string
  isSubRecipe?: boolean
}

export async function getRecipes(
  input: GetRecipesInput
): Promise<ApiResponse<RecipeRow[]>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const { workspaceId, category, isSubRecipe } = input

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member) return { success: false, error: 'אין גישה לסביבת עבודה זו', code: 'FORBIDDEN' }

  const recipes = await prisma.recipe.findMany({
    where: {
      workspaceId,
      ...(category && { category }),
      ...(isSubRecipe !== undefined && { isSubRecipe }),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: {
      id: true, name: true, category: true, yield: true, yieldUnit: true,
      isSubRecipe: true, sellingPrice: true, costStaleSince: true,
      createdAt: true, updatedAt: true,
    },
  })

  return {
    success: true,
    data: recipes.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      yield: r.yield.toNumber(),
      yieldUnit: r.yieldUnit,
      isSubRecipe: r.isSubRecipe,
      sellingPrice: r.sellingPrice?.toString() ?? null,
      costStaleSince: r.costStaleSince,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  }
}
