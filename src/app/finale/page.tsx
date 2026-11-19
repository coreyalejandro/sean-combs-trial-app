// Day 29, the finale: the Sexual Assault Migration Map, ported from
// /mnt/user-data/outputs/migration-map/build/ (viewer/app.js) onto the app's deck.gl 9.1.14.
// The page is static HTML (cover, content note, still map, tables, method, sources); the animated map
// loads on the client only (src/viz/finale/FinaleViewer.tsx), with its data in public/finale-data/.
import Link from 'next/link'
import { SupportResources } from '@/components/shell/SupportResources'
import { TrialRail } from '@/components/shell/TrialRail'
import { DAY_COUNT } from '@/lib/data'
import { FinaleViewer, NoteActions } from '@/viz/finale/FinaleViewer'
import { FinaleAtAGlance, FinaleMethod, FinaleSources, FinaleTextVersion, finaleRefs, finaleShortText } from '@/viz/finale/FinaleParts'
import { fmtInt, fmtPeople } from '@/viz/finale/format'
import { summary } from '@/viz/finale/summary'
import '@/viz/finale/finale.css'

export const metadata = { title: 'If every survivor walked to Washington' }

export default function FinalePage() {
  const refs = finaleRefs()
  return (
    <div className="page-dark finale-page">
      <header className="day-cover">
        <div className="wrap cover-inner">
          <span className="cover-number" aria-hidden="true">{DAY_COUNT + 1}</span>
          <div className="cover-text">
            <p className="cover-eyebrow mono">Visualization {DAY_COUNT + 1} · The finale · a simulation</p>
            <h1 className="cover-title">If every survivor walked to Washington</h1>
            <p className="cover-dek">
              About {fmtPeople(summary.totals.central)} adults in America have survived contact sexual violence. On one morning, they all
              leave home and walk to Washington, D.C. 1 dot = {fmtInt(summary.people_per_dot)} people. Every walker is invented.
            </p>
          </div>
        </div>
      </header>
      <TrialRail current="finale" />
      <div className="wrap day-body">
        <aside className="content-note on-dark fm-note" aria-label="Content note">
          <p>
            <strong>Content note.</strong> This page is about sexual violence. It shows counts, not stories or images. No real person is
            shown, tracked or named; each dot stands for {fmtInt(summary.people_per_dot)} people, built only from published totals.
          </p>
          <p className="content-note-choices">
            <NoteActions />
            <a href="#text-version" className="btn">Show the text version</a>
          </p>
          <SupportResources compact />
        </aside>

        <figure className="viz-figure on-dark fm-figure" role="group" aria-labelledby="finale-q" aria-describedby="finale-alt" data-viz-day="finale" data-viz-status="in-progress" id="march">
          <h2 id="finale-q" className="viz-question">What would it look like if every adult survivor of contact sexual violence in the United States walked to Washington?</h2>
          <div className="viz-slot">
            <FinaleViewer refs={refs} />
            <noscript>
              <p className="fm-loading">The animated map needs JavaScript. The still map, the counters on four days and the text version below show the same march.</p>
            </noscript>
          </div>
          <figcaption className="viz-caption">
            <p className="caption-text">
              Each dot is {fmtInt(summary.people_per_dot)} invented people walking real roads from their home county. Grey dots are at home,
              pale dots are walking, red dots wait at a full road, white dots have arrived. Estimates from published averages, not forecasts.
            </p>
            <p className="how-to-read">
              <strong>How to read this:</strong> press Play, or drag the day bar (arrow keys move one day; Shift moves a week). The three
              buttons under the map turn on the leaving, the passing through and the arriving.
            </p>
            <p id="finale-alt" className="visually-hidden">{finaleShortText()}</p>
          </figcaption>
        </figure>

        <FinaleTextVersion />
        <FinaleAtAGlance />
        <FinaleMethod />

        <section className="fm-closing" aria-labelledby="closing-heading">
          <p className="mono fm-version">Version 1</p>
          <h2 id="closing-heading">This is the march <em>to</em> Washington.</h2>
          <p className="measure">
            The march <em>on</em> Washington, what everyone does once they are there, is in development and is not defined yet. The start
            date is not chosen either, so the map counts &ldquo;Day 1&rdquo;, &ldquo;Day 2&rdquo; and so on.
          </p>
        </section>

        <FinaleSources />
        <nav className="day-pager" aria-label="Previous and next">
          <Link href="/verdict/" className="btn" rel="prev">
            <span>Back to the verdict</span>
          </Link>
          <Link href="/support/" className="btn">
            <span>Get support</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
