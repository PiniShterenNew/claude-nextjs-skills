'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import type { ApiResponse } from '@/shared/types'
import { CreateWorkspaceInputSchema } from '../types'

export async function createWorkspace(
  rawInput: unknown
): Promise<ApiResponse<{ slug: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const parsed = CreateWorkspaceInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: 'נתונים לא תקינים',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { name, slug } = parsed.data

  const existing = await prisma.workspace.findUnique({ where: { slug } })
  if (existing) {
    return { success: false, error: `Slug "${slug}" כבר תפוס. בחר slug אחר.` }
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId: session.user.id,
          role: 'OWNER',
          acceptedAt: new Date(),
        },
      },
    },
  })

  return { success: true, data: { slug: workspace.slug } }
}
