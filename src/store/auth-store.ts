'use client'

import { create } from 'zustand'

export interface UserPublic {
  id: string
  email: string
  name: string
  emailVerified: boolean
}

interface AuthState {
  user: UserPublic | null
  setUser: (user: UserPublic) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
