// Source helpers shared by Builder 3's days (15 to 21).
// These pictures also use facts from other days and from additions.json; extrasFrom() hands those sources to
// the shell's Sources panel (listed after the day's own, with `source-<id>` anchors), so every tag resolves.
import { confidenceInfo, resolveSources, sourceHome, type Confidence, type ReportedNumber, type Source } from '@/lib/data'
import type { ExtraSource } from '@/viz/types'
import styles from './kit.module.css'

export type Level = Confidence | 'conflict'

/** One item from an additions.json file. */
export interface AdditionItem {
  id: string
  kind: string
  text: string
  value?: number | string
  unit?: string
  date?: string
  from_days: number[]
  confidence: Confidence
  sources: Array<{ outlet: string; outlet_family: string; title: string; url: string; date: string }>
}

export interface AdditionsFile {
  day: number
  items: AdditionItem[]
}

/** Turn an additions item's sources into Source records with stable ids (add-<item id>-<n>). */
export function additionSources(item: AdditionItem, pool: Source[] = []): Source[] {
  return item.sources.map((s, i) => pool.find((p) => p.url === s.url) ?? ({
    id: `add-${item.id}-${i + 1}`,
    title: s.title,
    outlet: s.outlet,
    url: s.url,
    date: s.date,
    note: '',
    opened_this_pass: true,
  }))
}

export function findAddition(file: AdditionsFile, id: string): AdditionItem | undefined {
  return file.items.find((i) => i.id === id)
}

/** Sources for a reported number, from that number's own day. */
export function numSources(num: ReportedNumber, pool: Source[]): Source[] {
  return resolveSources(num, pool)
}

/** The lower of two levels; "conflict" stays conflict. */
export function lowest(a: Level, b: Level): Level {
  if (a === 'conflict' || b === 'conflict') return 'conflict'
  const order: Level[] = ['low', 'medium', 'high']
  return order.indexOf(a) <= order.indexOf(b) ? a : b
}

export function levelWords(level: Level): string {
  return confidenceInfo(level).label
}

function shortOutlet(s: Source): string {
  return s.outlet.split(/\s[(/]|\svia\s/)[0]
}

/** Source tags for any printed fact: numbered [n] for this day's sources, outlet name for others. */
export function SrcTags({ sources, pool }: { sources: Source[]; pool: Source[] }) {
  const unique = dedupe(sources)
  return (
    <span className={styles.srcTags} data-source-ids={unique.map((s) => s.id).join(' ')}>
      {unique.map((s) => {
        const i = pool.findIndex((p) => p.id === s.id)
        return (
          <a key={s.id} href={`#source-${s.id}`} className="source-ref" aria-label={`Source: ${s.outlet}`}>
            <sup>[{i >= 0 ? i + 1 : shortOutlet(s)}]</sup>
          </a>
        )
      })}
    </span>
  )
}

export function dedupe(sources: Source[]): Source[] {
  const seen = new Set<string>()
  return sources.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
}

/** Where a source comes from, in words, for the page's Sources panel. */
export function originOf(id: string): string {
  const home = sourceHome(id)
  if (home === 'verdict') return 'from the verdict record'
  if (typeof home === 'number') return `from the Day ${home} record`
  return 'added for this picture'
}

/**
 * Sources this picture uses that are not in the day's own list (other days, additions.json), for the shell's
 * Sources panel, which lists them after the day's own so the anchors are unique on the page.
 */
export function extrasFrom(sources: Source[], pool: Source[]): ExtraSource[] {
  const ids = new Set(pool.map((p) => p.id))
  return dedupe(sources)
    .filter((s) => !ids.has(s.id))
    .map((s) => ({ id: s.id, outlet: s.outlet, title: s.title, url: s.url, date: s.date, origin: originOf(s.id) }))
}

/** The small "calculated" tag DESIGN_29 puts on every number the app derives. */
export function Calc({ formula }: { formula?: string }) {
  return (
    <span className={styles.calc} title={formula ? `Calculated: ${formula}` : 'Calculated from the figures above'}>
      calculated
    </span>
  )
}

/**
 * Outlets named in a passage's parentheses ("(NBC; CNN.)", "(GMA; ABC 2:07 PM PDT)"), resolved against the
 * day's sources. Two or more named outlets that resolve means "two or more outlets"; one means "one outlet";
 * none falls back to `fallback`. A passage can lower a level, never raise one past what it names.
 */
export function citedIn(text: string, pool: Source[], fallback: Level): { sources: Source[]; level: Level } {
  const groups = [...text.matchAll(/\(([^()]*)\)/g)].map((m) => m[1])
  const names = new Set<string>()
  const found: Source[] = []
  for (const g of groups) {
    for (const part of g.split(/[;,/]|\band\b/)) {
      const name = part.trim().split(/\s+/)[0]?.replace(/[^A-Za-z0-9]/g, '')
      if (!name || name.length < 2 || /^\d/.test(name)) continue
      const hit = resolveSources({ source: name, outlets: [name] }, pool)
      if (hit.length > 0) {
        names.add(hit[0].outlet.split(/\s/)[0].toLowerCase())
        found.push(...hit)
      }
    }
  }
  if (found.length === 0) return { sources: [], level: fallback }
  return { sources: dedupe(found), level: names.size >= 2 ? 'high' : lowest('medium', fallback === 'low' ? 'low' : 'medium') }
}
