'use client'
// Same contract as useQuietMotion() in '@/lib/viz/motion' (quiet mode switch or prefers-reduced-motion), but safe
// where window.matchMedia is missing (jsdom in the shared registry test). See ../SHARED_REQUEST.md.
import { useEffect, useState } from 'react'

export function useQuiet(): boolean {
  const [quiet, setQuiet] = useState(true) // the still frame first (also the no-JavaScript state)
  useEffect(() => {
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const update = () => setQuiet(Boolean(mq?.matches) || document.documentElement.dataset.quiet === 'true')
    update()
    mq?.addEventListener('change', update)
    window.addEventListener('quietmodechange', update)
    return () => {
      mq?.removeEventListener('change', update)
      window.removeEventListener('quietmodechange', update)
    }
  }, [])
  return quiet
}
