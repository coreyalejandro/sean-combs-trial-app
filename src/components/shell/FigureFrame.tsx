// The frame every visualization sits in (W3C complex-images pattern):
// <figure role="group"> with the question as heading, the picture, and a <figcaption> holding the caption,
// "How to read this" and the short description; then the "Text version" (long description and table),
// visible to everyone. Works without JavaScript (<details> is native).
import type { ReactNode } from 'react'
import type { VizMeta } from '@/viz/types'

export function FigureFrame({ meta, children, textVersion }: { meta: VizMeta; children: ReactNode; textVersion: ReactNode }) {
  const q = `viz-q-${meta.day}`
  const alt = `viz-alt-${meta.day}`
  return (
    <>
      <figure className="viz-figure" role="group" aria-labelledby={q} aria-describedby={alt} data-viz-day={meta.day} data-viz-status={meta.status}>
        <h2 id={q} className="viz-question">{meta.question}</h2>
        <div className="viz-slot">{children}</div>
        <figcaption className="viz-caption">
          <p className="caption-text">{meta.caption}</p>
          <p className="how-to-read"><strong>How to read this:</strong> {meta.howToRead}</p>
          <p id={alt} className="visually-hidden">{meta.altShort}</p>
        </figcaption>
      </figure>
      <details className="text-version" id="text-version">
        <summary>Text version</summary>
        <div className="text-version-body">{textVersion}</div>
      </details>
    </>
  )
}
