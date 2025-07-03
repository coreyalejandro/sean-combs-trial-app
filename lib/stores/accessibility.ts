
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccessibilityState {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReaderMode: boolean
  setReducedMotion: (value: boolean) => void
  setHighContrast: (value: boolean) => void
  setLargeText: (value: boolean) => void
  setScreenReaderMode: (value: boolean) => void
  resetSettings: () => void
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderMode: false,
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setHighContrast: (value) => set({ highContrast: value }),
      setLargeText: (value) => set({ largeText: value }),
      setScreenReaderMode: (value) => set({ screenReaderMode: value }),
      resetSettings: () => set({
        reducedMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderMode: false,
      }),
    }),
    {
      name: 'accessibility-settings',
    }
  )
)
