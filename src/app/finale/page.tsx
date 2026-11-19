// Day 29, the finale: the Sexual Assault Migration Map. PLACEHOLDER until the finale port lands.
// Owned by the finale porter (see BUILDER_BRIEF.md): wrap the viewer from
// /mnt/user-data/outputs/migration-map/build/viewer/ as a client-only component on deck.gl 9.1.14,
// with its data in public/march/data/.
import Link from 'next/link'
import { TrialRail } from '@/components/shell/TrialRail'
import { DAY_COUNT } from '@/lib/data'

export const metadata = { title: 'If every survivor walked to Washington' }

export default function FinalePage() {
  return (
    <div className="page-dark finale-page">
      <header className="day-cover">
        <div className="wrap cover-inner">
          <span className="cover-number" aria-hidden="true">{DAY_COUNT + 1}</span>
          <div className="cover-text">
            <p className="cover-eyebrow mono">The finale</p>
            <h1 className="cover-title">If every survivor walked to Washington</h1>
          </div>
        </div>
      </header>
      <TrialRail current="finale" />
      <div className="wrap day-body">
        <figure className="viz-figure on-dark" role="group" aria-labelledby="finale-q" data-viz-day="finale" data-viz-status="placeholder">
          <h2 id="finale-q" className="viz-question">What would it look like if every adult survivor of contact sexual violence in the United States walked to Washington?</h2>
          <div className="viz-slot">
            <div className="viz-placeholder on-dark" data-placeholder="true">
              <p className="ph-label mono">The march is being brought into this site</p>
              <p className="ph-form">Planned form: <strong>animated map of walkers on real roads, with counters and three views</strong></p>
            </div>
          </div>
          <figcaption className="viz-caption">
            <p className="caption-text">Every walker is invented, built from published totals. No real survivor is shown, tracked or named.</p>
          </figcaption>
        </figure>
        <p className="measure">
          This is version 1: the march <em>to</em> Washington. What happens <em>on</em> Washington is in development.
        </p>
        <p><Link href="/verdict/" className="btn">Back to the verdict</Link></p>
      </div>
    </div>
  )
}
