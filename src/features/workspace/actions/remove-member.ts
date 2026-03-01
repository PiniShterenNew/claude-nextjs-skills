'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'
import { RemoveMemberInputSchema } from '../types'

export async function removeMember(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = RemoveMemberInputSchema.safeParse(rawInput)
  if (!parsed.success) return { success: false, error: 'נתונים לא תקינים' }

  const { memberId, workspaceId } = parsed.data

  const callerMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!callerMember || callerMember.role !== 'OWNER') {
    return { success: false, error: 'פעולה זו מותרת לבעלים בלבד', code: 'FORBIDDEN' }
  }

  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } })
  if (!target) return { success: false, error: 'חבר לא נמצא' }
  if (target.userId === session.user.id) {
    return { success: false, error: 'לא ניתן להסיר את עצמך' }
  }

  // Soft-delete: set acceptedAt to null is not enough, we need a different strategy
  // WorkspaceMember has no deletedAt — we delete the record (it's a join table)
  await prisma.workspaceMember.delete({ where: { id: memberId } })
  return { success: true, data: undefined }
}
