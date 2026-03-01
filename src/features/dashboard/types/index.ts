export interface DashboardKPI {
  avgFoodCostPercent: number
  mostProfitableRecipe: { name: string; grossMargin: number } | null
  mostExpensiveRecipe: { name: string; totalCost: number } | null
  recipesOverThreshold: number
}

export type ThresholdStatus = 'ok' | 'warning' | 'alert'

export interface RecipeCostRow {
  id: string
  name: string
  category: string | null
  foodCostPercent: number
  grossMargin: number
  isStale: boolean
  thresholdStatus: ThresholdStatus
}

export interface AlertRow {
  ingredientId: string
  ingredientName: string
  changedAt: Date
  affectedRecipeCount: number
  actorName: string
  changeDescription: string
}

export interface DashboardData {
  kpis: DashboardKPI
  recipeCostRows: RecipeCostRow[]
  alerts: AlertRow[]
}
