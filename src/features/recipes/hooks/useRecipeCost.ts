'use client'

import { useMutation } from '@tanstack/react-query'
import { calculateRecipeCost } from '../actions/calculate-recipe-cost'
import type { RecipeCostResult } from '@/shared/types'

export function useRecipeCost() {
  return useMutation<RecipeCostResult | null, Error, { recipeId: string; workspaceId: string }>({
    mutationFn: async ({ recipeId, workspaceId }) => {
      const result = await calculateRecipeCost(recipeId, workspaceId)
      if (!result.success) return null
      return result.data
    },
  })
}
