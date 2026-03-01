'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'
import { UpdateMemberRoleInputSchema } from '../types'

export async function updateMemberRole(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = UpdateMemberRoleInputSchema.safeParse(rawInput)
  if (!parsed.success) return { success: false, error: 'נתונים לא תקינים' }

  const { memberId, workspaceId, role } = parsed.data

  const callerMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!callerMember || callerMember.role !== 'OWNER') {
    return { success: false, error: 'פעולה זו מותרת לבעלים בלבד', code: 'FORBIDDEN' }
  }

  const targetMember = await prisma.workspaceMember.findUnique({ where: { id: memberId } })
  if (!targetMember) return { success: false, error: 'חבר לא נמצא' }
  if (targetMember.userId === session.user.id) {
    return { success: false, error: 'לא ניתן לשנות את התפקיד שלך' }
  }

  await prisma.workspaceMember.update({ where: { id: memberId }, data: { role } })
  return { success: true, data: undefined }
}
