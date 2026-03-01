export type Quadrant = 'STAR' | 'WORKHORSE' | 'PUZZLE' | 'DOG'

export interface DishMatrixPoint {
  recipeId: string
  name: string
  category: string | null
  profitability: number   // gross margin %
  popularity: number      // sales volume (or 0 if null)
  quadrant: Quadrant
  grossMargin: number
  foodCostPercent: number
  totalCost: number
  sellingPrice: number
}

export interface MenuEngineeringData {
  dishes: DishMatrixPoint[]
  avgProfitability: number
  avgPopularity: number
  hasMissingSalesVolume: boolean
}
