'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'
import { UpdateWorkspaceInputSchema } from '../types'

export async function updateWorkspace(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = UpdateWorkspaceInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: 'נתונים לא תקינים' }
  }

  const { id: workspaceId, name, foodCostThreshold } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || member.role !== 'OWNER') {
    return { success: false, error: 'פעולה זו מותרת לבעלים בלבד', code: 'FORBIDDEN' }
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(name && { name }),
      ...(foodCostThreshold !== undefined && { foodCostThreshold }),
    },
  })

  return { success: true, data: undefined }
}
