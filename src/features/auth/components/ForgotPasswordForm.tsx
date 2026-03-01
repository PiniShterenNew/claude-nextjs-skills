'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { forgotPassword } from '../actions/forgot-password'
import { ForgotPasswordInputSchema, type ForgotPasswordInput } from '../types'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordInputSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    await forgotPassword(data)
    setSubmitted(true) // Always show success (don't reveal if email exists)
  }

  if (submitted) {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">הודעה נשלחה</p>
        <p className="text-sm text-muted-foreground">
          אם כתובת האימייל רשומה במערכת, תקבל קישור לאיפוס הסיסמה בקרוב.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="כתובת אימייל"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        hint="הכנס את האימייל שרשמת בהרשמה"
        {...register('email')}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        שלח קישור לאיפוס סיסמה
      </Button>
    </form>
  )
}
