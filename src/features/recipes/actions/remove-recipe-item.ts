'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'

export async function removeRecipeItem(
  itemId: string,
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

  const item = await prisma.recipeItem.delete({ where: { id: itemId } })

  await prisma.recipe.update({
    where: { id: item.recipeId },
    data: { updatedAt: new Date() },
  })

  revalidateTag(`recipe:${item.recipeId}`)
  return { success: true, data: undefined }
}
