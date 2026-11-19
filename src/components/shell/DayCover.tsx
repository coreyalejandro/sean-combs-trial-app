'use client'
// The black LIFE-style cover band. A slow parallax drift (the big day number moves at a different
// speed from the headline), switched off under reduced motion and quiet mode.
import { useEffect, useRef, type ReactNode } from 'react'
import { useQuietMotion } from '@/lib/viz/motion'

const DRIFT = 0.25

export function DayCover({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: ReactNode }) {
  const numRef = useRef<HTMLSpanElement>(null)
  const quiet = useQuietMotion()
  useEffect(() => {
    const el = numRef.current
    if (!el) return
    if (quiet) { el.style.transform = ''; return }
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => { el.style.transform = `translateY(${window.scrollY * DRIFT}px)` })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [quiet])
  return (
    <header className="day-cover">
      <div className="wrap cover-inner">
        <span className="cover-number" ref={numRef} aria-hidden="true">{number}</span>
        <div className="cover-text">
          <p className="cover-eyebrow mono">{eyebrow}</p>
          <h1 className="cover-title">{title}</h1>
          {children}
        </div>
      </div>
    </header>
  )
}
