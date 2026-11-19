import Link from 'next/link'

export interface PagerLink { href: string; label: string }

export function DayPager({ prev, next, position }: { prev: PagerLink | null; next: PagerLink | null; position: 'top' | 'bottom' }) {
  return (
    <nav className={`day-pager pager-${position}`} aria-label={position === 'top' ? 'Previous and next day' : 'Previous and next day (end of page)'}>
      {prev ? <Link href={prev.href} className="btn" rel="prev">Previous day<span className="pager-sub">{prev.label}</span></Link> : <span />}
      {next ? <Link href={next.href} className="btn btn-red" rel="next">Next day<span className="pager-sub">{next.label}</span></Link> : <span />}
    </nav>
  )
}
