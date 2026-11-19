'use client'
// Opens a closed <details> (the lettered source list) when a source link points inside it.
import { useEffect } from 'react'

export function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const el = document.getElementById(id)
      const details = el?.closest('details')
      if (details && !details.open) {
        details.open = true
        el?.scrollIntoView({ block: 'center' })
      }
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])
  return null
}
