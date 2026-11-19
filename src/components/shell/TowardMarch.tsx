// The quiet thread from each trial day to the finale: one line on what the day shows about how a survivor's
// account is heard, and the way to the march. Same place, same look, on all 28 days. Lines: src/data/shared/arc.json.
import Link from 'next/link'
import arc from '@/data/shared/arc.json'
import { fmtPeople } from '@/viz/finale/format'
import { summary } from '@/viz/finale/summary'

export function arcLine(n: number): string | undefined {
  return (arc as { lines: Array<{ day: number; line: string }> }).lines.find((l) => l.day === n)?.line
}

export function TowardMarch({ n }: { n: number }) {
  const line = arcLine(n)
  if (!line) return null
  return (
    <aside className="toward-march" aria-labelledby={`toward-${n}`}>
      <h2 id={`toward-${n}`} className="toward-label">Toward the march</h2>
      <p className="toward-line">{line}</p>
      <p className="toward-link">
        <Link href="/finale/">
          Where this leads: about {fmtPeople(summary.totals.central)} adult survivors walk to Washington
        </Link>
      </p>
    </aside>
  )
}
