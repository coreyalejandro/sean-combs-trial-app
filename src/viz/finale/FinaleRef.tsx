// A number with its numbered links to the finale's sources list (same look as the shell's Cite).
// No hooks and no data import, so both the server page and the client map can use it.
import type { ReactNode } from 'react'

export interface RefSource { id: string; outlet: string; n: number }

export function FinaleRef({ sources, children, calculated = false }: { sources: RefSource[]; children: ReactNode; calculated?: boolean }) {
  return (
    <span className="cite" data-source-ids={sources.map((s) => s.id).join(' ')}>
      <span className="num">{children}</span>
      {calculated ? <span className="fm-calc">estimate</span> : null}
      {sources.map((s) => (
        <a key={s.id} href={`#source-${s.id}`} className="source-ref" aria-label={`Source: ${s.outlet}`}>
          <sup>[{s.n}]</sup>
        </a>
      ))}
    </span>
  )
}
