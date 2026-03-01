'use client'

import { useQuery } from '@tanstack/react-query'
import { getIngredients } from '../actions/get-ingredients'

export const ingredientKeys = {
  all: (workspaceId: string) => ['ingredients', workspaceId] as const,
  list: (workspaceId: string, search?: string) =>
    ['ingredients', workspaceId, search ?? ''] as const,
}

export function useIngredients(workspaceId: string, search?: string) {
  return useQuery({
    queryKey: ingredientKeys.list(workspaceId, search),
    queryFn: async () => {
      const result = await getIngredients({ workspaceId, search })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!workspaceId,
  })
}
