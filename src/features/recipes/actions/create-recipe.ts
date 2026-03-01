'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'
import { CreateRecipeInputSchema } from '../types'

export async function createRecipe(
  rawInput: unknown
): Promise<ApiResponse<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = CreateRecipeInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: 'נתונים לא תקינים',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    workspaceId,
    name,
    category,
    yield: yieldQty,
    yieldUnit,
    isSubRecipe,
    sellingPrice,
    vatPercent,
    laborCost,
    overheadCost,
    salesVolume,
  } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER', 'CHEF'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const recipe = await prisma.recipe.create({
    data: {
      workspaceId,
      name,
      category,
      yield: yieldQty,
      yieldUnit,
      isSubRecipe,
      sellingPrice: sellingPrice ?? null,
      vatPercent: vatPercent ?? null,
      laborCost: laborCost ?? null,
      overheadCost: overheadCost ?? null,
      salesVolume: salesVolume ?? null,
    },
  })

  await prisma.auditLog.create({
    data: {
      workspaceId,
      entityType: 'Recipe',
      entityId: recipe.id,
      action: 'CREATE',
      changes: { before: null, after: { name, category, yieldQty, yieldUnit } },
      actorId: session.user.id,
    },
  })

  revalidateTag(`workspace:${workspaceId}`)
  return { success: true, data: { id: recipe.id } }
}
