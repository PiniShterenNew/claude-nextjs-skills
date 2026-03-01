import { z } from 'zod'

export const LoginInputSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים'),
})
export type LoginInput = z.infer<typeof LoginInputSchema>

export const SignupInputSchema = z.object({
  name: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים').max(100),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z
    .string()
    .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
    .regex(/[A-Z]/, 'הסיסמה חייבת להכיל אות גדולה אחת לפחות')
    .regex(/[0-9]/, 'הסיסמה חייבת להכיל ספרה אחת לפחות'),
  inviteToken: z.string().optional(),
})
export type SignupInput = z.infer<typeof SignupInputSchema>

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
})
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
    .regex(/[A-Z]/, 'הסיסמה חייבת להכיל אות גדולה אחת לפחות')
    .regex(/[0-9]/, 'הסיסמה חייבת להכיל ספרה אחת לפחות'),
})
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_TAKEN'
  | 'UNVERIFIED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_NOT_FOUND'
  | 'SERVER_ERROR'

export interface AuthError {
  code: AuthErrorCode
  message: string
}
