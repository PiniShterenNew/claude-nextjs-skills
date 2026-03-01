'use server'

import { auth } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'
import { effectivePrice } from '../utils/effective-price'
import type { ApiResponse, PaginatedResponse } from '@/shared/types'
import type { IngredientRow } from '../types'

interface GetIngredientsInput {
  workspaceId: string
  search?: string
  page?: number
  pageSize?: number
}

export async function getIngredients(
  input: GetIngredientsInput
): Promise<ApiResponse<PaginatedResponse<IngredientRow>>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'לא מחובר', code: 'UNAUTHENTICATED' }

  const { workspaceId, search, page = 1, pageSize = 50 } = input

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  })
  if (!member) return { success: false, error: 'אין גישה לסביבת עבודה זו', code: 'FORBIDDEN' }

  const where = {
    workspaceId,
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
  }

  const [total, items] = await Promise.all([
    prisma.ingredient.count({ where }),
    prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const rows: IngredientRow[] = items.map((ing) => ({
    id: ing.id,
    name: ing.name,
    unit: ing.unit,
    pricePerUnit: ing.pricePerUnit,
    wastePercent: ing.wastePercent,
    supplier: ing.supplier,
    pricedAt: ing.pricedAt,
    effectivePrice: effectivePrice(ing.pricePerUnit, ing.wastePercent),
    createdAt: ing.createdAt,
    updatedAt: ing.updatedAt,
  }))

  return {
    success: true,
    data: {
      items: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    },
  }
}
