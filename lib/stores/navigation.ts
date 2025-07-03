
'use client'

import { create } from 'zustand'

interface NavigationState {
  currentDay: number
  isMenuOpen: boolean
  searchQuery: string
  setCurrentDay: (day: number) => void
  setMenuOpen: (isOpen: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentDay: 1,
  isMenuOpen: false,
  searchQuery: '',
  setCurrentDay: (day) => set({ currentDay: day }),
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
