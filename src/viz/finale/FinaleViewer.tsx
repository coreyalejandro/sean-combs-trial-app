'use client'
// Client entry for the finale map. deck.gl and the march data load only here (next/dynamic, ssr: false),
// after the page's intro has painted; until then the reader sees the still map with a progress line.
import dynamic from 'next/dynamic'
import type { RefSource } from './FinaleRef'

const MarchMap = dynamic(() => import('./MarchMap'), {
  ssr: false,
  loading: () => (
    <div className="fm-app">
      <div className="fm-stage">
        <div className="fm-map fm-poster">
          <p className="fm-loading" aria-live="polite">Loading the map…</p>
        </div>
      </div>
    </div>
  ),
})

export function FinaleViewer({ refs }: { refs: Record<string, RefSource> }) {
  return <MarchMap refs={refs} />
}

/** "Start the march" and "Skip to the arrival": links (they work without JavaScript) that also drive the map. */
export function NoteActions() {
  const send = (cmd: 'start' | 'skip') => {
    const w = window as unknown as { __march?: { ready?: boolean }; __finalePending?: string }
    if (!w.__march?.ready) w.__finalePending = cmd
    window.dispatchEvent(new CustomEvent('finale:command', { detail: cmd }))
  }
  return (
    <>
      <a href="#march" className="btn btn-red" onClick={() => send('start')}>Start the march</a>
      <a href="#march" className="btn" onClick={() => send('skip')}>Skip to the arrival</a>
    </>
  )
}
