'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkspaceRole } from '@/shared/types'

interface ActiveWorkspace {
  id: string
  slug: string
  name: string
  role: WorkspaceRole
  foodCostThreshold: number
}

interface WorkspaceState {
  workspace: ActiveWorkspace | null
  sidebarCollapsed: boolean
  setWorkspace: (workspace: ActiveWorkspace) => void
  clearWorkspace: () => void
  toggleSidebar: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspace: null,
      sidebarCollapsed: false,
      setWorkspace: (workspace) => set({ workspace }),
      clearWorkspace: () => set({ workspace: null }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'menucost-workspace',
      // Only persist sidebar preference, not sensitive workspace data
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
