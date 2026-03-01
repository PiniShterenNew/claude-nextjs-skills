'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'
import { z } from 'zod'

const UpdateItemSchema = z.object({
  quantity: z.number().positive('כמות חייבת להיות חיובית'),
  unit: z.string().min(1),
})

export async function updateRecipeItem(
  itemId: string,
  workspaceId: string,
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = UpdateItemSchema.safeParse(rawInput)
  if (!parsed.success) return { success: false, error: 'נתונים לא תקינים' }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER', 'CHEF'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const item = await prisma.recipeItem.update({
    where: { id: itemId },
    data: parsed.data,
  })

  await prisma.recipe.update({
    where: { id: item.recipeId },
    data: { updatedAt: new Date() },
  })

  revalidateTag(`recipe:${item.recipeId}`)
  return { success: true, data: undefined }
}
