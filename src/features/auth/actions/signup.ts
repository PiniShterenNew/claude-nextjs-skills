'use server'

import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import { prisma } from '@/shared/lib/prisma'
import { sendVerificationEmail } from '@/shared/lib/resend'
import { env } from '@/shared/lib/env'
import type { ApiResponse } from '@/shared/types'
import { SignupInputSchema } from '../types'

export async function signup(
  rawInput: unknown
): Promise<ApiResponse<{ userId: string }>> {
  const parsed = SignupInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: 'נתונים לא תקינים',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { name, email, password, inviteToken } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { success: false, error: 'כתובת האימייל כבר רשומה במערכת', code: 'EMAIL_TAKEN' }
    }

    const passwordHash = await hash(password, 12)
    const emailVerifyToken = randomUUID()

    const user = await prisma.user.create({
      data: { name, email, passwordHash, emailVerifyToken },
    })

    const verifyUrl = `${env.NEXTAUTH_URL}/verify-email?token=${emailVerifyToken}`
    await sendVerificationEmail({ to: email, verifyUrl })

    // If invite token exists, store it temporarily in session flow
    void inviteToken // consumed in onboarding flow

    return { success: true, data: { userId: user.id } }
  } catch {
    return { success: false, error: 'שגיאת שרת. נסה שנית.', code: 'SERVER_ERROR' }
  }
}
