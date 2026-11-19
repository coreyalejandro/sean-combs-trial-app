// The trial rail: 28 numbered ticks, the June 18 grey gap, and end marks for the verdict and the march.
import Link from 'next/link'
import { formatDate, getDays, getGaps } from '@/lib/data'

export function dayHref(n: number) {
  return `/day/${n}/`
}

export function TrialRail({ current }: { current: number | 'verdict' | 'finale' | null }) {
  const days = getDays()
  const gaps = getGaps()
  return (
    <nav className="trial-rail" aria-label="Trial days">
      <ol className="rail-list">
        {days.map((d) => (
          <RailItems key={d.day} d={d} current={current} gaps={gaps.filter((g) => g.afterDay === d.day)} />
        ))}
        <li className="rail-end">
          <Link href="/verdict/" aria-current={current === 'verdict' ? 'page' : undefined} className={current === 'verdict' ? 'is-current' : ''}>
            Verdict
          </Link>
        </li>
        <li className="rail-end">
          <Link href="/finale/" aria-current={current === 'finale' ? 'page' : undefined} className={current === 'finale' ? 'is-current' : ''}>
            March
          </Link>
        </li>
      </ol>
    </nav>
  )
}

function RailItems({ d, current, gaps }: { d: { day: number; date: string }; current: number | string | null; gaps: ReturnType<typeof getGaps> }) {
  const isCurrent = current === d.day
  return (
    <>
      <li className="rail-day">
        <Link
          href={dayHref(d.day)}
          aria-current={isCurrent ? 'page' : undefined}
          className={isCurrent ? 'is-current' : ''}
          aria-label={`Day ${d.day}, ${formatDate(d.date, { year: false })}`}
        >
          {d.day}
        </Link>
      </li>
      {gaps.map((g) => (
        <li key={g.date} className="rail-gap" title={g.note}>
          <span aria-label={`${formatDate(g.date, { year: false })}: no testimony`}>no testimony</span>
        </li>
      ))}
    </>
  )
}
