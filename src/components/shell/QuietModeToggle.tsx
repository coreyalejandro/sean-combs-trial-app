'use client'
// The app-wide "Quiet mode (no motion)" switch. A native button with aria-pressed.
import { useEffect, useState } from 'react'
import { readQuietSetting, writeQuietSetting } from '@/lib/viz/motion'

export function QuietModeToggle() {
  const [on, setOn] = useState(false)
  useEffect(() => setOn(readQuietSetting()), [])
  return (
    <button
      type="button"
      className="quiet-toggle"
      aria-pressed={on}
      onClick={() => {
        const next = !on
        setOn(next)
        writeQuietSetting(next)
      }}
    >
      Quiet mode (no motion): {on ? 'on' : 'off'}
    </button>
  )
}

/** Inline script for <head>: applies the saved setting before first paint. */
export const quietModeInitScript = `try{if(localStorage.getItem('combs-trial-quiet-mode')==='true'){document.documentElement.dataset.quiet='true'}}catch(e){}`
