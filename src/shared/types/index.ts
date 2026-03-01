// ─── Base Entity ────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

// ─── API Response (discriminated union) ─────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export type WorkspaceRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'

// ─── Cost Calculation ─────────────────────────────────────────────────────────

export interface RecipeCostResult {
  recipeId: string
  totalCostILS: number
  costPerPortionILS: number
  foodCostPercent: number | null
  breakdown: RecipeCostLineItem[]
}

export interface RecipeCostLineItem {
  ingredientId: string | null
  subRecipeId: string | null
  name: string
  quantity: number
  unit: string
  unitCostILS: number
  totalCostILS: number
}

// ─── Utility types ───────────────────────────────────────────────────────────

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
