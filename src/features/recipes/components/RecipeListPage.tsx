import Link from 'next/link'
import { prisma } from '@/shared/lib/prisma'
import { Card } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import type { WorkspaceRole } from '@/shared/types'

interface RecipeListPageProps {
  workspaceId: string
  workspaceSlug: string
  role: WorkspaceRole
  category?: string
}

export async function RecipeListPage({
  workspaceId,
  workspaceSlug,
  role,
  category,
}: RecipeListPageProps) {
  const canEdit = ['OWNER', 'MANAGER', 'CHEF'].includes(role)

  const recipes = await prisma.recipe.findMany({
    where: { workspaceId, ...(category && { category }) },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
    select: {
      id: true, name: true, category: true, yieldUnit: true, isSubRecipe: true,
      sellingPrice: true, costStaleSince: true, createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground-secondary">מתכונים</h1>
        {canEdit && (
          <Link
            href={`/${workspaceSlug}/recipes/new`}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            מתכון חדש
          </Link>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <span className="material-symbols-outlined text-5xl">restaurant_menu</span>
          <p className="text-lg font-medium">אין מתכונים עדיין</p>
          {canEdit && (
            <Link
              href={`/${workspaceSlug}/recipes/new`}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              צור מתכון ראשון
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/${workspaceSlug}/recipes/${recipe.id}`}>
              <Card className="cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{recipe.name}</h3>
                    {recipe.category && (
                      <p className="text-xs text-muted-foreground">{recipe.category}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {recipe.isSubRecipe && <Badge variant="info">משנה</Badge>}
                    {recipe.costStaleSince && (
                      <Badge variant="warning">עלות לא עדכנית</Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
