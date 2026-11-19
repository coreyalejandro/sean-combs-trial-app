// The index of 29: all 28 testimony days, the June 18 gap, the verdict and the march.
import Link from 'next/link'
import { DAY_COUNT, formatDate, getDays, getGaps } from '@/lib/data'
import { getDayModule } from '@/viz/registry'

export const metadata = { title: 'All days' }

export default function DaysIndex() {
  const gaps = getGaps()
  return (
    <div className="wrap index-page">
      <h1>All {DAY_COUNT} days, the verdict and the march</h1>
      <p className="measure">
        Day N is the Nth day the jury heard testimony. Outlets number some days differently; each day page lists their labels in its sources.
      </p>
      <ol className="index-grid">
        {getDays().map((d) => {
          const { meta } = getDayModule(d.day)
          const gap = gaps.find((g) => g.afterDay === d.day)
          return (
            <li key={d.day} className="index-li">
              <Link href={`/day/${d.day}/`} className="index-card">
                <span className="index-num">{d.day}</span>
                <span className="index-date mono">{formatDate(d.date, { weekday: true, year: false })}</span>
                <span className="index-title">{meta.title}</span>
                <span className="index-form">{meta.question}</span>
              </Link>
              {gap ? (
                <div className="index-gap" aria-label="Calendar note">
                  <span className="mono">{formatDate(gap.date, { weekday: true, year: false })}</span> No testimony
                </div>
              ) : null}
            </li>
          )
        })}
        <li className="index-li">
          <Link href="/verdict/" className="index-card is-dark">
            <span className="index-num is-word">Verdict</span>
            <span className="index-date mono">June 25, 2025 to April 9, 2026</span>
            <span className="index-title">The verdict and the sentence</span>
          </Link>
        </li>
        <li className="index-li">
          <Link href="/finale/" className="index-card is-dark is-red">
            <span className="index-num">{DAY_COUNT + 1}</span>
            <span className="index-date mono">The finale: the march</span>
            <span className="index-title">If every survivor walked to Washington</span>
          </Link>
        </li>
      </ol>
    </div>
  )
}
