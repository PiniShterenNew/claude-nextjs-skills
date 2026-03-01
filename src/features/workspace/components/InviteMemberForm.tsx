'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { toast } from '@/shared/components/ui/Toast'
import { inviteMember } from '../actions/invite-member'
import { InviteMemberInputSchema, type InviteMemberInput } from '../types'

const ROLE_OPTIONS = [
  { value: 'MANAGER', label: 'מנהל' },
  { value: 'CHEF', label: 'שף' },
  { value: 'VIEWER', label: 'צופה' },
]

interface InviteMemberFormProps {
  workspaceId: string
  onSuccess?: () => void
}

export function InviteMemberForm({ workspaceId, onSuccess }: InviteMemberFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(InviteMemberInputSchema),
    defaultValues: { workspaceId, role: 'CHEF' },
  })

  async function onSubmit(data: InviteMemberInput) {
    const result = await inviteMember(data)
    if (result.success) {
      toast.success('הזמנה נשלחה בהצלחה')
      reset()
      onSuccess?.()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end" noValidate>
      <div className="flex-1">
        <Input
          label="כתובת אימייל"
          type="email"
          placeholder="chef@restaurant.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <div className="w-36">
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              label="תפקיד"
              options={ROLE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.role?.message}
            />
          )}
        />
      </div>
      <Button type="submit" loading={isSubmitting}>
        שלח הזמנה
      </Button>
    </form>
  )
}
