'use client'
// One citation style everywhere (review, Nov 2026): every source link on a day page reads [n], the number of
// the source in the page's own Sources list. Pictures built by different hands label their links in different
// ways (numbers, outlet names); once the page is interactive this renumbers them all from the list itself, and
// keeps doing so as panels open. Without JavaScript the links still work and name the outlet.
import { useEffect } from 'react'

function numbering(): Map<string, number> {
  const map = new Map<string, number>()
  document.querySelectorAll<HTMLOListElement>('.sources-panel ol.sources-list').forEach((ol) => {
    const start = Number(ol.getAttribute('start') || '1')
    Array.from(ol.children).forEach((li, i) => {
      const n = start + i
      if (li.id) map.set(li.id.replace(/^source-/, ''), n)
      li.querySelectorAll<HTMLElement>('.source-alias[id]').forEach((a) => map.set(a.id.replace(/^source-/, ''), n))
    })
  })
  return map
}

function renumber() {
  const map = numbering()
  document.querySelectorAll<HTMLAnchorElement>('a.source-ref[href^="#source-"]').forEach((a) => {
    const n = map.get((a.getAttribute('href') ?? '').slice('#source-'.length))
    if (!n) return
    const target = a.querySelector('sup') ?? a
    const want = `[${n}]`
    if (target.textContent !== want) target.textContent = want
  })
}

export function SourceNumbers() {
  useEffect(() => {
    renumber()
    const root = document.querySelector('.day-body') ?? document.body
    const mo = new MutationObserver(() => renumber())
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])
  return null
}
