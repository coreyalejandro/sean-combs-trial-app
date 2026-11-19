'use client'
// Quiet mode (the app-wide "Quiet mode (no motion)" switch) and prefers-reduced-motion.
// Every animation must check useQuietMotion() and show its final frame plus step buttons when true.
import { useEffect, useState } from 'react'

export const QUIET_KEY = 'combs-trial-quiet-mode'

export function readQuietSetting(): boolean {
  try {
    return window.localStorage.getItem(QUIET_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeQuietSetting(on: boolean): void {
  try {
    window.localStorage.setItem(QUIET_KEY, on ? 'true' : 'false')
  } catch {
    /* storage blocked: the setting lasts for this page only */
  }
  document.documentElement.dataset.quiet = on ? 'true' : 'false'
  window.dispatchEvent(new CustomEvent('quietmodechange', { detail: on }))
}

/** True when the viewer turned on quiet mode OR their system asks for reduced motion. */
export function useQuietMotion(): boolean {
  const [quiet, setQuiet] = useState(true) // render the still frame first (also the no-JS state)
  useEffect(() => {
    // Some environments (jsdom in unit tests, very old browsers) have no matchMedia: fall back to the switch alone.
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    const update = () => setQuiet(Boolean(mq?.matches) || document.documentElement.dataset.quiet === 'true')
    update()
    mq?.addEventListener?.('change', update)
    window.addEventListener('quietmodechange', update)
    return () => {
      mq?.removeEventListener?.('change', update)
      window.removeEventListener('quietmodechange', update)
    }
  }, [])
  return quiet
}

/** matchMedia breakpoint hook (DESIGN_29: check the breakpoint in JS with the same query as CSS). */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(query)
    const update = () => setMatch(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [query])
  return match
}

/** Viewport height in pixels (never `vh`, which jumps as the phone browser bar moves). */
export function useViewportHeight(): number {
  const [h, setH] = useState(0)
  useEffect(() => {
    const update = () => setH(window.innerHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return h
}
