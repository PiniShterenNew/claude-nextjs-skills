'use server'

import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'

export async function verifyEmail(token: string): Promise<ApiResponse<void>> {
  if (!token) {
    return { success: false, error: 'טוקן לא תקין', code: 'TOKEN_NOT_FOUND' }
  }

  // Must query without soft-delete filter since emailVerifyToken is unique
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  })

  if (!user) {
    return { success: false, error: 'טוקן לא נמצא או כבר שומש', code: 'TOKEN_NOT_FOUND' }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  })

  return { success: true, data: undefined }
}
