'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { toast } from '@/shared/components/ui/Toast'
import { signup } from '../actions/signup'
import { SignupInputSchema, type SignupInput } from '../types'

interface SignupFormProps {
  inviteToken?: string
}

export function SignupForm({ inviteToken }: SignupFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupInputSchema),
    defaultValues: { inviteToken },
  })

  const password = watch('password') ?? ''
  const strength = password.length < 8 ? 'weak' : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'strong' : 'medium'

  async function onSubmit(data: SignupInput) {
    const result = await signup(data)
    if (result.success) {
      toast.success('נרשמת בהצלחה! בדוק את תיבת האימייל שלך לאישור.')
      router.push('/verify-email')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="שם מלא"
        type="text"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="כתובת אימייל"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="space-y-1.5">
        <Input
          label="סיסמה"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {password.length > 0 && (
          <div className="flex gap-1">
            {(['weak', 'medium', 'strong'] as const).map((level, i) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  (strength === 'weak' && i === 0) ||
                  (strength === 'medium' && i <= 1) ||
                  (strength === 'strong' && i <= 2)
                    ? strength === 'strong' ? 'bg-success' : strength === 'medium' ? 'bg-warning' : 'bg-destructive'
                    : 'bg-surface-subtle'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <Button type="submit" loading={isSubmitting} className="w-full">
        הרשמה
      </Button>
    </form>
  )
}
