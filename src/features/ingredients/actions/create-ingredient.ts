'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { revalidateTag } from 'next/cache'
import type { ApiResponse } from '@/shared/types'
import { CreateIngredientInputSchema } from '../types'

export async function createIngredient(
  rawInput: unknown
): Promise<ApiResponse<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = CreateIngredientInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: 'נתונים לא תקינים',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { workspaceId, name, unit, pricePerUnit, wastePercent, supplier } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    return { success: false, error: 'אין הרשאה', code: 'FORBIDDEN' }
  }

  const ingredient = await prisma.ingredient.create({
    data: { workspaceId, name, unit, pricePerUnit, wastePercent, supplier },
  })

  await prisma.auditLog.create({
    data: {
      workspaceId,
      entityType: 'Ingredient',
      entityId: ingredient.id,
      action: 'CREATE',
      changes: { before: null, after: { name, unit, pricePerUnit, wastePercent } },
      actorId: session.user.id,
    },
  })

  revalidateTag(`workspace:${workspaceId}`)
  return { success: true, data: { id: ingredient.id } }
}
