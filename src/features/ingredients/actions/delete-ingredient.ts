'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'

export async function deleteIngredient(
  id: string,
  workspaceId: string
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  // Check if ingredient is used in active recipes
  const activeUsage = await prisma.recipeItem.findMany({
    where: { ingredientId: id },
    include: { recipe: { select: { name: true, deletedAt: true } } },
  })

  const activeRecipeNames = activeUsage
    .filter((ri) => !ri.recipe.deletedAt)
    .map((ri) => ri.recipe.name)

  if (activeRecipeNames.length > 0) {
    return {
      success: false,
      error: `לא ניתן למחוק — חומר גלם זה משמש במתכונים: ${activeRecipeNames.join(', ')}`,
    }
  }

  await prisma.ingredient.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      workspaceId,
      entityType: 'Ingredient',
      entityId: id,
      action: 'DELETE',
      changes: { before: { id }, after: null },
      actorId: session.user.id,
    },
  })

  revalidateTag(`workspace:${workspaceId}`)
  return { success: true, data: undefined }
}
