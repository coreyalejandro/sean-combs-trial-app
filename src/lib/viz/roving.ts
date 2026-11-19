'use client'
// Roving focus for explorable marks (DESIGN_29 "Keyboard"): Tab enters the chart, arrow keys move
// between marks, Enter opens the detail, Escape leaves. Give every mark tabIndex={i === active ? 0 : -1}.
import { useCallback, useState, type KeyboardEvent } from 'react'

export function useRovingFocus(count: number, opts: { onSelect?: (i: number) => void; onExit?: () => void } = {}) {
  const [active, setActive] = useState(0)
  const onKeyDown = useCallback(
    (e: KeyboardEvent<Element>) => {
      if (count <= 0) return
      let next = active
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (active + 1) % count
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (active - 1 + count) % count
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = count - 1
      else if (e.key === 'Enter' || e.key === ' ') { opts.onSelect?.(active); e.preventDefault(); return }
      else if (e.key === 'Escape') { opts.onExit?.(); (e.currentTarget as HTMLElement).blur?.(); return }
      else return
      e.preventDefault()
      e.stopPropagation() // keep day-to-day arrow navigation from firing inside a chart
      setActive(next)
      const container = e.currentTarget as HTMLElement
      const target = container.querySelector<HTMLElement>(`[data-roving-index="${next}"]`)
      target?.focus()
    },
    [active, count, opts],
  )
  return { active, setActive, onKeyDown, tabIndexFor: (i: number) => (i === active ? 0 : -1) }
}
