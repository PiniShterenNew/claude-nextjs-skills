'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'
import { UpdateIngredientInputSchema } from '../types'

export async function updateIngredient(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = UpdateIngredientInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: 'נתונים לא תקינים' }
  }

  const { id, workspaceId, pricePerUnit, ...rest } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const existing = await prisma.ingredient.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'חומר גלם לא נמצא' }

  const priceChanged = pricePerUnit !== undefined

  await prisma.ingredient.update({
    where: { id },
    data: {
      ...rest,
      ...(pricePerUnit !== undefined && {
        pricePerUnit,
        pricedAt: new Date(),
      }),
    },
  })

  await prisma.auditLog.create({
    data: {
      workspaceId,
      entityType: 'Ingredient',
      entityId: id,
      action: 'UPDATE',
      changes: {
        before: { pricePerUnit: existing.pricePerUnit.toString() },
        after: { pricePerUnit: pricePerUnit?.toString() ?? existing.pricePerUnit.toString(), ...rest },
      },
      actorId: session.user.id,
    },
  })

  // If price changed, mark all recipes using this ingredient as stale
  if (priceChanged) {
    const affectedRecipeItems = await prisma.recipeItem.findMany({
      where: { ingredientId: id },
      select: { recipeId: true },
    })
    const recipeIds = [...new Set(affectedRecipeItems.map((ri) => ri.recipeId))]

    if (recipeIds.length > 0) {
      await prisma.recipe.updateMany({
        where: { id: { in: recipeIds } },
        data: { costStaleSince: new Date() },
      })
      for (const recipeId of recipeIds) {
        revalidateTag(`recipe:${recipeId}`)
      }
    }
  }

  revalidateTag(`workspace:${workspaceId}`)
  return { success: true, data: undefined }
}
