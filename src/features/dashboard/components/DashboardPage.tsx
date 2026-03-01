import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/Card'
import { FoodCostKPICard } from './FoodCostKPICard'
import { RecipeCostTable } from './RecipeCostTable'
import { PriceAlertFeed } from './PriceAlertFeed'
import { getDashboardData } from '../actions/get-dashboard-data'
import type { WorkspaceRole } from '@/shared/types'

interface DashboardPageProps {
  workspaceId: string
  workspaceSlug: string
  role: WorkspaceRole
  threshold: number
}

export async function DashboardPage({
  workspaceId,
  workspaceSlug,
  role,
  threshold,
}: DashboardPageProps) {
  const canViewCosts = ['OWNER', 'MANAGER'].includes(role)
  const result = await getDashboardData(workspaceId)

  if (!result.success) {
    return <p className="text-destructive">{result.error}</p>
  }

  const { kpis, recipeCostRows, alerts } = result.data

  if (recipeCostRows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-muted-foreground">monitoring</span>
        <p className="text-lg font-medium text-foreground-secondary">ה-Dashboard ריק</p>
        <p className="text-sm text-muted-foreground">הוסף מתכונים עם מחיר מכירה כדי לראות נתוני רווחיות</p>
        <Link
          href={`/${workspaceSlug}/recipes/new`}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          צור מתכון ראשון
        </Link>
      </div>
    )
  }

  const avgCostHighlight =
    kpis.avgFoodCostPercent > threshold ? 'bad'
    : kpis.avgFoodCostPercent > threshold - 5 ? 'warning'
    : 'good'

  return (
    <div className="space-y-8">
      {/* KPI grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <FoodCostKPICard
          label="ממוצע Food Cost"
          value={`${kpis.avgFoodCostPercent.toFixed(1)}%`}
          highlight={avgCostHighlight}
          subtext={`סף: ${threshold}%`}
        />
        <FoodCostKPICard
          label="מתכונים מעל הסף"
          value={String(kpis.recipesOverThreshold)}
          highlight={kpis.recipesOverThreshold > 0 ? 'bad' : 'good'}
          unit="מתכונים"
        />
        <FoodCostKPICard
          label="הכי רווחי"
          value={kpis.mostProfitableRecipe?.name ?? '—'}
          subtext={
            kpis.mostProfitableRecipe
              ? `מרווח: ${kpis.mostProfitableRecipe.grossMargin.toFixed(1)}%`
              : undefined
          }
          highlight="good"
        />
        <FoodCostKPICard
          label="Food Cost גבוה"
          value={kpis.mostExpensiveRecipe?.name ?? '—'}
          highlight={kpis.mostExpensiveRecipe ? 'bad' : undefined}
        />
      </div>

      {/* Recipe cost table */}
      <Card>
        <CardHeader>
          <CardTitle>עלות מתכונים</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipeCostTable rows={recipeCostRows} threshold={threshold} canViewCosts={canViewCosts} />
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>עדכוני מחיר אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceAlertFeed alerts={alerts} />
        </CardContent>
      </Card>
    </div>
  )
}
