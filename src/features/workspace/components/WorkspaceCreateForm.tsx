'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { toast } from '@/shared/components/ui/Toast'
import { createWorkspace } from '../actions/create-workspace'
import { CreateWorkspaceInputSchema, type CreateWorkspaceInput } from '../types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export function WorkspaceCreateForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(CreateWorkspaceInputSchema),
  })

  const name = watch('name') ?? ''

  useEffect(() => {
    setValue('slug', slugify(name), { shouldValidate: false })
  }, [name, setValue])

  async function onSubmit(data: CreateWorkspaceInput) {
    const result = await createWorkspace(data)
    if (result.success) {
      toast.success('סביבת עבודה נוצרה בהצלחה!')
      router.push(`/${result.data.slug}/dashboard`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="שם המסעדה / העסק"
        type="text"
        placeholder="מסעדת הים"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="כתובת URL (Slug)"
        type="text"
        placeholder="masadat-hayam"
        hint='אותיות לטיניות, מספרים ומקפים בלבד — לא ניתן לשנות לאחר מכן'
        error={errors.slug?.message}
        {...register('slug')}
      />
      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        צור סביבת עבודה
      </Button>
    </form>
  )
}
