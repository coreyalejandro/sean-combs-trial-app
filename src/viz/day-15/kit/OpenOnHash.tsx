'use client'
// Opens a closed <details> when a source link (#source-...) points inside it, so the cited source is visible.
import { useEffect } from 'react'

export function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id.startsWith('source-')) return
      const el = document.getElementById(id)
      const box = el?.closest('details')
      if (box && !box.open) {
        box.open = true
        el?.scrollIntoView({ block: 'center' })
      }
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])
  return null
}
