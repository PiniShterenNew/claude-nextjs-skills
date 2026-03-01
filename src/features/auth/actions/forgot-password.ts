'use server'

import { randomUUID } from 'crypto'
import { prisma } from '@/shared/lib/prisma'
import { sendPasswordResetEmail } from '@/shared/lib/resend'
import { env } from '@/shared/lib/env'
import type { ApiResponse } from '@/shared/types'
import { ForgotPasswordInputSchema } from '../types'

export async function forgotPassword(
  rawInput: unknown
): Promise<ApiResponse<void>> {
  const parsed = ForgotPasswordInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: 'כתובת אימייל לא תקינה' }
  }

  const { email } = parsed.data

  // Always return success — never reveal if email exists
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const token = randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
    })

    const resetUrl = `${env.NEXTAUTH_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail({ to: email, resetUrl }).catch(() => {
      // Silent fail — don't expose error to user
    })
  }

  return { success: true, data: undefined }
}
