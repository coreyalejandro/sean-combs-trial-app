'use client'
// Same contract as useQuietMotion() in src/lib/viz/motion.ts (quiet mode OR prefers-reduced-motion; the
// still frame first), plus a guard for environments without window.matchMedia (jsdom in the shared
// registry test), where the shared hook throws. Requested upstream in SHARED_REQUEST.md; when the shared
// hook gains the guard, swap this back to useQuietMotion.
import { useEffect, useState } from 'react'

export function useQuiet(): boolean {
  const [quiet, setQuiet] = useState(true)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setQuiet(mq.matches || document.documentElement.dataset.quiet === 'true')
    update()
    mq.addEventListener('change', update)
    window.addEventListener('quietmodechange', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('quietmodechange', update)
    }
  }, [])
  return quiet
}
