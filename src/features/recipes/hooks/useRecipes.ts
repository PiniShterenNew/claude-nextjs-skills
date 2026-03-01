'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecipes } from '../actions/get-recipes'

export const recipeKeys = {
  all: (workspaceId: string) => ['recipes', workspaceId] as const,
  list: (workspaceId: string, filters?: object) =>
    ['recipes', workspaceId, JSON.stringify(filters ?? {})] as const,
}

export function useRecipes(
  workspaceId: string,
  filters?: { category?: string; isSubRecipe?: boolean }
) {
  return useQuery({
    queryKey: recipeKeys.list(workspaceId, filters),
    queryFn: async () => {
      const result = await getRecipes({ workspaceId, ...filters })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!workspaceId,
  })
}
