import { prisma } from '@/shared/lib/prisma'
import { effectivePrice } from '../utils/effective-price'
import { IngredientListClient } from './IngredientListClient'
import type { IngredientRow } from '../types'
import type { WorkspaceRole } from '@/shared/types'

interface IngredientListPageProps {
  workspaceId: string
  role: WorkspaceRole
}

export async function IngredientListPage({ workspaceId, role }: IngredientListPageProps) {
  const canViewCosts = ['OWNER', 'MANAGER'].includes(role)
  const canEdit = ['OWNER', 'MANAGER'].includes(role)

  const ingredients = await prisma.ingredient.findMany({
    where: { workspaceId },
    orderBy: { name: 'asc' },
  })

  const rows: IngredientRow[] = ingredients.map((ing) => ({
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

  return (
    <IngredientListClient
      initialIngredients={rows}
      workspaceId={workspaceId}
      canViewCosts={canViewCosts}
      canEdit={canEdit}
    />
  )
}
