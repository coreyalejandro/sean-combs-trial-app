'use client'
// Left and right arrow keys move between days when focus is not inside a visualization or a control.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RailKeys({ prevHref, nextHref }: { prevHref: string | null; nextHref: string | null }) {
  const router = useRouter()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      if (t && t.closest('input, textarea, select, [contenteditable], [data-viz-day], [role="slider"], [role="grid"], details[open] .table-scroll')) return
      // Read the targets from the page at key time, so a key pressed during navigation uses the page now shown.
      const rel = e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : null
      if (!rel) return
      const href = document.querySelector<HTMLAnchorElement>(`.day-pager a[rel="${rel}"]`)?.getAttribute('href') ?? (rel === 'prev' ? prevHref : nextHref)
      if (href) router.push(href)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, prevHref, nextHref])
  return null
}

/** Opens the "Text version" <details> when the page is reached with #text-version. */
export function TextVersionHash() {
  useEffect(() => {
    const open = () => {
      if (window.location.hash === '#text-version') {
        const d = document.getElementById('text-version') as HTMLDetailsElement | null
        if (d) { d.open = true; d.scrollIntoView() }
      }
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])
  return null
}
