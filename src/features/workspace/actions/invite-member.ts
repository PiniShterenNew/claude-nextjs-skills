'use server'

import { randomUUID } from 'crypto'
import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { sendInvitationEmail } from '@/shared/lib/resend'
import { env } from '@/shared/lib/env'
import type { ApiResponse } from '@/shared/types'
import { InviteMemberInputSchema } from '../types'

export async function inviteMember(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = InviteMemberInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: 'נתונים לא תקינים' }
  }

  const { workspaceId, email, role } = parsed.data

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member || member.role !== 'OWNER') {
    return { success: false, error: 'פעולה זו מותרת לבעלים בלבד', code: 'FORBIDDEN' }
  }

  // Check if user is already a member
  const invitedUser = await prisma.user.findUnique({ where: { email } })
  if (invitedUser) {
    const alreadyMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: invitedUser.id } },
    })
    if (alreadyMember) {
      return { success: false, error: 'משתמש זה כבר חבר בסביבת העבודה' }
    }
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) return { success: false, error: 'סביבת עבודה לא נמצאה' }

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

  await prisma.workspaceInvitation.create({
    data: { workspaceId, invitedByUserId: session.user.id, email, role, token, expiresAt },
  })

  const inviteUrl = `${env.NEXTAUTH_URL}/api/invitations/${token}`
  await sendInvitationEmail({ to: email, workspaceName: workspace.name, role, inviteUrl })

  return { success: true, data: undefined }
}
