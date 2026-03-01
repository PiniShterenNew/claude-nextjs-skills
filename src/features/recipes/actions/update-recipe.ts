'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'
import { UpdateRecipeInputSchema } from '../types'

export async function updateRecipe(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = UpdateRecipeInputSchema.safeParse(rawInput)
  if (!parsed.success) return { success: false, error: 'נתונים לא תקינים' }

  const { id, workspaceId, sellingPrice, items: _items, ...rest } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER', 'CHEF'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const existing = await prisma.recipe.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'מתכון לא נמצא' }

  await prisma.recipe.update({
    where: { id },
    data: {
      ...rest,
      ...(sellingPrice !== undefined && { sellingPrice }),
    },
  })

  await prisma.auditLog.create({
    data: {
      workspaceId,
      entityType: 'Recipe',
      entityId: id,
      action: 'UPDATE',
      changes: { before: { sellingPrice: existing.sellingPrice?.toString() }, after: { sellingPrice } },
      actorId: session.user.id,
    },
  })

  revalidateTag(`recipe:${id}`)
  revalidateTag(`workspace:${workspaceId}`)
  return { success: true, data: undefined }
}
