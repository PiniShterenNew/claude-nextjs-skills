'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'

export async function deleteRecipe(
  id: string,
  workspaceId: string
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER', 'CHEF'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  // Check if this recipe is used as a sub-recipe
  const usageItems = await prisma.recipeItem.findMany({
    where: { subRecipeId: id },
    include: { recipe: { select: { name: true, deletedAt: true } } },
  })
  const activeParentNames = usageItems
    .filter((ri) => !ri.recipe.deletedAt)
    .map((ri) => ri.recipe.name)

  if (activeParentNames.length > 0) {
    return {
      success: false,
      error: `לא ניתן למחוק — מתכון זה משמש כמתכון-משנה ב: ${activeParentNames.join(', ')}`,
    }
  }

  await prisma.recipe.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidateTag(`recipe:${id}`)
  revalidateTag(`workspace:${workspaceId}`)
  return { success: true, data: undefined }
}
