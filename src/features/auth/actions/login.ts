'use server'

import { signIn } from '@/shared/lib/auth'
import { LoginInputSchema } from '../types'
import type { ApiResponse } from '@/shared/types'
import { AuthError } from 'next-auth'

export async function login(rawInput: unknown): Promise<ApiResponse<void>> {
  const parsed = LoginInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: 'כתובת אימייל או סיסמה לא תקינים',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { email, password } = parsed.data

  try {
    await signIn('credentials', { email, password, redirect: false })
    return { success: true, data: undefined }
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'אימייל או סיסמה שגויים', code: 'INVALID_CREDENTIALS' }
        default:
          return { success: false, error: 'שגיאת שרת. נסה שנית.', code: 'SERVER_ERROR' }
      }
    }
    return { success: false, error: 'שגיאת שרת. נסה שנית.', code: 'SERVER_ERROR' }
  }
}
