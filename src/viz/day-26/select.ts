// Day 26: who did what, as witnesses described it. A link is drawn ONLY when a day record holds text that
// matches the rule for that link (the rule names the person, the task or director, and the words that must
// appear). The text that matched is shown as the evidence. If the record changes, the links change.
import {
  getDays,
  getWitnesses,
  lowerConfidence,
  resolveSources,
  type Confidence,
  type Source,
  type TrialDay,
} from '@/lib/data'
import { redact } from '@/viz/day-22/kit'

export type TaskId = 'hotels' | 'stock' | 'drugs' | 'clean' | 'travel' | 'cash' | 'schedule'

export const TASKS: Array<{ id: TaskId; label: string }> = [
  { id: 'hotels', label: 'Booking hotel rooms, often under an alias' },
  { id: 'stock', label: 'Stocking rooms with supplies' },
  { id: 'drugs', label: 'Buying or picking up drugs' },
  { id: 'clean', label: 'Cleaning rooms afterward' },
  { id: 'travel', label: 'Arranging travel and rides' },
  { id: 'cash', label: 'Carrying cash or arranging payments' },
  { id: 'schedule', label: 'Long hours, on call, schedules' },
]

export type DirectorId = 'combs' | 'khorram'

export interface PersonNode {
  id: string
  label: string
  note: string | null
  days: number[]
}

export interface Link {
  key: string
  kind: 'did' | 'directed-person' | 'directed-task'
  from: string
  to: string
  day: number
  evidence: string
  sources: Source[]
  confidence: Confidence
}

export interface Day26Selection {
  people: PersonNode[]
  tasks: typeof TASKS
  directors: Array<{ id: DirectorId; label: string }>
  links: Link[]
  /** People with no task links, and why (e.g. a witness who said he never saw any of it). */
  unlinked: Array<{ id: string; label: string; evidence: string | null; day: number | null; sources: Source[] }>
}

type Rule = { kind: Link['kind']; from: string; to: string; re: RegExp; scope: RegExp }

// scope: the record text must also name this person (or the director's texts) for the rule to apply.
const RULES: Rule[] = [
  { kind: 'did', from: 'james', to: 'stock', re: /stocked hotel rooms/i, scope: /James/ },
  { kind: 'did', from: 'james', to: 'hotels', re: /booked under 'Frank Black'/i, scope: /James/ },
  { kind: 'did', from: 'james', to: 'cash', re: /\$[\d,]+ cash/i, scope: /James/ },
  { kind: 'did', from: 'james', to: 'schedule', re: /\d+-hour workdays/i, scope: /James/ },
  { kind: 'did', from: 'kaplan', to: 'hotels', re: /set up hotel rooms[^;]*Frank Black/i, scope: /Kaplan/ },
  { kind: 'did', from: 'kaplan', to: 'clean', re: /cleaned rooms/i, scope: /Kaplan/ },
  { kind: 'did', from: 'kaplan', to: 'drugs', re: /picked up MDMA/i, scope: /Kaplan/ },
  { kind: 'did', from: 'mia', to: 'schedule', re: /24\/7 job|schedule/i, scope: /Mia/ },
  { kind: 'did', from: 'mia', to: 'clean', re: /cleaning hotel rooms/i, scope: /Mia/ },
  { kind: 'did', from: 'mia', to: 'stock', re: /supplying baby oil/i, scope: /Mia/ },
  { kind: 'did', from: 'perez', to: 'drugs', re: /bought illegal drugs/i, scope: /Perez/ },
  { kind: 'did', from: 'perez', to: 'hotels', re: /set up hotel rooms/i, scope: /Perez/ },
  { kind: 'did', from: 'perez', to: 'cash', re: /arrange a \$[\d,]+ [a-z]+ payment/i, scope: /Perez/ },
  { kind: 'did', from: 'paul', to: 'drugs', re: /buying marijuana/i, scope: /Paul/ },
  { kind: 'did', from: 'paul', to: 'schedule', re: /without sleep|away from family/i, scope: /Paul/ },
  { kind: 'directed-person', from: 'combs', to: 'kaplan', re: /at Combs's direction/i, scope: /Kaplan/ },
  { kind: 'directed-person', from: 'combs', to: 'clark', re: /made her go with him/i, scope: /Clark/ },
  { kind: 'directed-person', from: 'combs', to: 'perez', re: /bought illegal drugs for Combs/i, scope: /Perez/ },
  { kind: 'directed-person', from: 'combs', to: 'paul', re: /marijuana strains for Combs/i, scope: /Paul/ },
  { kind: 'directed-person', from: 'khorram', to: 'paul', re: /Khorram 'basically ran the enterprise'/i, scope: /Paul/ },
  { kind: 'directed-task', from: 'khorram', to: 'stock', re: /Khorram texts \([^)]*stock a [^)]*room/i, scope: /Khorram/ },
  { kind: 'directed-task', from: 'khorram', to: 'cash', re: /Khorram texts \([^)]*fetch \$[\d,]+ cash/i, scope: /Khorram/ },
  { kind: 'directed-task', from: 'khorram', to: 'travel', re: /Khorram texts about Ubers/i, scope: /Khorram/ },
  { kind: 'directed-task', from: 'khorram', to: 'hotels', re: /Khorram texts about[^;.]*hotel/i, scope: /Khorram/ },
]

const OUTLET_TOKEN = /\b(NBC|CBS|ABC|GMA|Fox|CNN|AP|NPR|Global)\b/g

function clauseMatching(text: string, re: RegExp): string {
  const clauses = text.split(/;\s+/)
  return clauses.find((c) => re.test(c)) ?? text
}

function evidenceSources(clause: string, day: TrialDay): Source[] {
  const tokens = [...new Set(clause.match(OUTLET_TOKEN) ?? [])]
  if (tokens.length === 0) return day.sources
  const found = resolveSources({ source: tokens.join(';'), outlets: tokens }, day.sources)
  return found.length > 0 ? found : day.sources
}

/** Strip quoted message text that is not the person's own reported words about the work. */
function tidy(s: string): string {
  return redact(s).replace(/\s+/g, ' ').trim()
}

export function selectDay26(today: TrialDay): Day26Selection {
  const days = getDays().map((d) => (d.day === today.day ? today : d))
  const table = getWitnesses()
  const staffIds = ['james', 'kaplan', 'clark', 'mia', 'perez', 'paul', 'ferguson']
  const people: PersonNode[] = staffIds
    .map((id) => table.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))
    .map((w) => ({ id: w.id, label: w.display_name, note: w.pseudonym ? 'pseudonym' : null, days: w.days }))
  const textsOf = (d: TrialDay) => [...d.key_points, ...d.exhibits]

  const links: Link[] = []
  for (const r of RULES) {
    const personDays = people.find((p) => p.id === r.to || p.id === r.from)?.days
    const pool = r.kind === 'directed-task' ? days : days.filter((d) => personDays?.includes(d.day))
    for (const d of pool) {
      const hit = textsOf(d).find((t) => r.scope.test(t) && r.re.test(t))
      if (hit) {
        const clause = clauseMatching(hit, r.re)
        links.push({
          key: `${r.from}-${r.to}-${d.day}`,
          kind: r.kind,
          from: r.from,
          to: r.to,
          day: d.day,
          evidence: tidy(clause),
          sources: evidenceSources(clause, d),
          confidence: lowerConfidence(d.confidence.level, 'medium'),
        })
        break
      }
    }
  }

  // Security staff appear in the record (a witness said security carried weapons) but with no task from this list.
  const securityDay = days.find((d) => d.key_points.some((k) => /security carried weapons/i.test(k)))
  const khorramLabel = days
    .flatMap((d) => d.people)
    .find((p) => /Khorram \(chief of staff; not charged/i.test(p))
  const directors: Day26Selection['directors'] = [
    { id: 'combs', label: 'Sean Combs' },
    { id: 'khorram', label: khorramLabel ? `${khorramLabel.split(' (')[0]} (chief of staff; not charged, did not testify)` : 'Chief of staff' },
  ]
  if (securityDay) people.push({ id: 'security', label: 'Security staff (unnamed)', note: null, days: [securityDay.day] })

  const linked = new Set(links.flatMap((l) => [l.from, l.to]))
  const unlinked = people
    .filter((p) => !links.some((l) => l.kind === 'did' && l.from === p.id))
    .map((p) => {
      const d = days.find((x) => p.days.includes(x.day))
      const ev =
        p.id === 'ferguson'
          ? days.flatMap((x) => x.key_points.map((k) => ({ k, x }))).find(({ k }) => /Ferguson cross/i.test(k) && /never saw/i.test(k))
          : p.id === 'security' && securityDay
            ? { k: securityDay.key_points.find((k) => /security carried weapons/i.test(k)) as string, x: securityDay }
            : undefined
      const clause = ev ? clauseMatching(ev.k, /never saw|security carried/i) : null
      return {
        id: p.id,
        label: p.label,
        evidence: clause ? tidy(clause) : linked.has(p.id) ? 'described being directed, but no task from this list' : null,
        day: ev ? ev.x.day : d?.day ?? null,
        sources: ev ? ev.x.sources : [],
      }
    })
  return { people, tasks: TASKS, directors, links, unlinked }
}
