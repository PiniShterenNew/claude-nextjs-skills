'use client'

import { useQuery } from '@tanstack/react-query'
import { getMenuEngineeringData } from '../actions/get-menu-engineering-data'

export function useMenuEngineering(workspaceId: string) {
  return useQuery({
    queryKey: ['menu-engineering', workspaceId],
    queryFn: async () => {
      const result = await getMenuEngineeringData(workspaceId)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!workspaceId,
  })
}
