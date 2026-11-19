import Link from 'next/link'
import { DAY_COUNT, getCaseName } from '@/lib/data'
import { CONTENT_NOTES } from '@/components/shell/ContentNote'

export default function Home() {
  return (
    <div className="page-dark home">
      <section className="wrap home-cover">
        <p className="home-kicker mono">{getCaseName()}</p>
        <h1 className="home-title">The Combs Trial</h1>
        <p className="home-dek measure">
          One picture for each of the {DAY_COUNT} days the jury heard testimony, then the verdict, then the pull-back:
          what it would look like if every survivor walked to Washington.
        </p>
        <aside className="content-note on-dark" aria-label="Content note">
          <p>
            <strong>Content note.</strong> This site covers a criminal trial about sexual coercion and violence. {CONTENT_NOTES[2]} Each day
            page says what it shows before it shows it, and every picture has a text version.
          </p>
        </aside>
        <p className="home-actions">
          <Link href="/day/1/" className="btn btn-red">Start with Day 1</Link>
          <Link href="/days/" className="btn">See all days</Link>
          <Link href="/finale/" className="btn">Go to the march</Link>
        </p>
        <p className="home-support">
          Support is always one tap away: <Link href="/support/">Get support</Link>.
        </p>
      </section>
    </div>
  )
}
