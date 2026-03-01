import Link from 'next/link'
import { prisma } from '@/shared/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { formatILS } from '@/shared/lib/decimal'
import { calculateRecipeCost } from '../actions/calculate-recipe-cost'
import type { WorkspaceRole } from '@/shared/types'

interface RecipeDetailPageProps {
  recipeId: string
  workspaceId: string
  workspaceSlug: string
  role: WorkspaceRole
}

export async function RecipeDetailPage({
  recipeId,
  workspaceId,
  workspaceSlug,
  role,
}: RecipeDetailPageProps) {
  const canViewCosts = ['OWNER', 'MANAGER'].includes(role)
  const canEdit = ['OWNER', 'MANAGER', 'CHEF'].includes(role)

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      items: {
        include: {
          ingredient: { select: { name: true, unit: true } },
          subRecipe: { select: { name: true } },
        },
      },
    },
  })

  if (!recipe || recipe.workspaceId !== workspaceId) {
    return <p className="text-destructive">מתכון לא נמצא</p>
  }

  let costResult = null
  if (canViewCosts && recipe.sellingPrice) {
    const res = await calculateRecipeCost(recipeId, workspaceId)
    if (res.success) costResult = res.data
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground-secondary">{recipe.name}</h1>
          {recipe.category && (
            <p className="text-muted-foreground">{recipe.category}</p>
          )}
        </div>
        {canEdit && (
          <Link
            href={`/${workspaceSlug}/recipes/${recipeId}/edit`}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-subtle transition-colors"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            ערוך
          </Link>
        )}
      </div>

      {recipe.costStaleSince && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-lg p-3">
          <span className="material-symbols-outlined text-warning text-base">warning</span>
          <p className="text-sm text-warning">עלות המתכון לא עדכנית — מחיר חומר גלם השתנה</p>
        </div>
      )}

      {/* Recipe items */}
      <Card>
        <CardHeader>
          <CardTitle>רכיבים ({recipe.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {recipe.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-muted-foreground text-base">
                    {item.ingredientId ? 'inventory_2' : 'restaurant_menu'}
                  </span>
                  <span className="text-sm font-medium">
                    {item.ingredient?.name ?? item.subRecipe?.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.quantity.toString()} {item.unit}
                </span>
              </div>
            ))}
            {recipe.items.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground text-center">אין רכיבים</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost summary */}
      {canViewCosts && costResult && (
        <Card>
          <CardHeader>
            <CardTitle>עלות ורווחיות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <MetricRow label="עלות חומרי גלם" value={formatILS(costResult.ingredientCost)} />
              <MetricRow label="סה״כ עלות" value={formatILS(costResult.totalCost)} />
              <MetricRow label="מחיר מכירה" value={formatILS(costResult.sellingPrice)} />
              <MetricRow
                label="Food Cost %"
                value={
                  <Badge
                    variant={costResult.foodCostPercent > 35 ? 'destructive' : costResult.foodCostPercent > 28 ? 'warning' : 'success'}
                  >
                    {costResult.foodCostPercent.toFixed(1)}%
                  </Badge>
                }
              />
              <MetricRow label="רווח גולמי" value={formatILS(costResult.grossProfit)} />
              <MetricRow label="מרווח גולמי" value={`${costResult.grossMargin.toFixed(1)}%`} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}
