// Day 1: the fields the claim diff needs, picked by what they are (never by array position).
import { getCharges, getDays, getVerdict, getWitnesses, redactThirdParties, type ReportedNumber, type TrialDay, type WitnessRecord } from '@/lib/data'
import { buildIndex, findNumber, numberRefs, toRef, uniqueRefs, type Fact, type Ref, type RefIndex } from '@/viz/kits/days-01-07/refs'

export type Side = 'prosecution' | 'defense'

export interface Opening {
  side: Side
  /** Who gave it, as the record names them ("AUSA Emily Johnson"). */
  speaker: string
  clauses: string[]
  fact: Fact
}

export interface Claim {
  text: string
  /** Reported figures that appear in the claim ($100,000, ~20 years), with their sources. */
  figures: Array<{ num: ReportedNumber; refs: Ref[] }>
}

export interface TopicRow {
  id: string
  label: string
  prosecution: Claim | null
  defense: Claim | null
  /** Later testimony days whose record returns to this topic. */
  laterDays: number[]
}

export interface Stake {
  id: string
  num: ReportedNumber
  refs: Ref[]
  label: string
  detail?: string
}

export interface Day01Selection {
  openings: Opening[]
  rows: TopicRow[]
  unplaced: Array<{ side: Side; text: string }>
  stakes: Stake[]
  witnesses: WitnessRecord[]
  litIds: string[]
  dayCount: number
  verdict: Array<{ count: number; short: string; plain: string; outcome: string; refs: Ref[] }>
  index: RefIndex
  allRefs: Ref[]
}

/** The four topics DESIGN_29 names, plus the searches (which only the prosecution's opening raised, as reported). */
const TOPICS: Array<{ id: string; label: string; prosecution: RegExp; defense: RegExp; later: RegExp }> = [
  { id: 'payment', label: 'The hotel video payment', prosecution: /paid for|hotel video|\bNDA\b/i, defense: /payment|guard|publicity/i, later: /brown paper bag|only copy|\bNDA\b.*(footage|video)|(footage|video).*\bNDA\b|authenticated .*video/i },
  { id: 'men', label: 'The men who were paid', prosecution: /\bmen\b|escort|performer/i, defense: /\bmen\b.*paid|porn/i, later: /\bescorts?\b|male (performer|dancer)|sex workers?\b|exotic dancer/i },
  { id: 'violence', label: 'The violence', prosecution: /violen|assault|\bhit\b/i, defense: /violence|temper/i, later: /saw Combs (hit|attack|assault|be violent|drag)|violence toward|swollen eye|kicked/i },
  { id: 'years', label: 'The years', prosecution: /years|enterprise/i, defense: /love|jealousy|infidelity/i, later: /enterprise|racketeering/i },
  { id: 'searches', label: 'What the searches found', prosecution: /search/i, defense: /search/i, later: /\bsearch|\braid\b/i },
]

function readOpening(day: TrialDay, side: Side): Opening | null {
  const re = side === 'prosecution' ? /^Prosecution opening/i : /^Defense opening/i
  const text = day.key_points.find((k) => re.test(k))
  if (!text) return null
  const m = text.match(/^[^(:]*\(([^)]*)\)\s*:\s*(.*)$/)
  const speaker = m ? m[1] : side === 'prosecution' ? 'Prosecution' : 'Defense'
  const body = m ? m[2] : text.replace(/^[^:]*:\s*/, '')
  const clauses = body.split(/;\s*/).map((c) => redactThirdParties(c.replace(/\.$/, '').trim())).filter(Boolean)
  const refs = day.sources.map((s) => toRef(s, day.day))
  return { side, speaker, clauses, fact: { text: redactThirdParties(text), refs, confidence: 'medium', day: day.day, wholeRecord: true } }
}

const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Reported figures that a claim mentions ("$100,000", "~20 years"). */
function figuresIn(text: string, day: TrialDay): Claim['figures'] {
  const out: Claim['figures'] = []
  for (const num of day.numbers) {
    if (typeof num.value !== 'number') continue
    const v = escapeRe(num.value.toLocaleString('en-US'))
    const usd = /usd/i.test(num.unit)
    const re = usd ? new RegExp(`\\$${v}(?![\\d,])`) : new RegExp(`(?<![\\d,.$])${v}\\s*${escapeRe(num.unit.split(' ')[0])}`, 'i')
    if (re.test(text)) out.push({ num, refs: numberRefs(day, num) })
  }
  return out
}

export function select(day: TrialDay): Day01Selection {
  const openings = (['prosecution', 'defense'] as Side[]).map((s) => readOpening(day, s)).filter((o): o is Opening => o !== null)
  const used = new Map<Side, Set<string>>([['prosecution', new Set()], ['defense', new Set()]])
  const laterDays = getDays().filter((d) => d.day > day.day)

  const rows: TopicRow[] = TOPICS.map((t) => {
    const pick = (side: Side): Claim | null => {
      const o = openings.find((x) => x.side === side)
      const c = o?.clauses.find((cl) => t[side].test(cl) && !used.get(side)?.has(cl))
      if (!c) return null
      used.get(side)?.add(c)
      return { text: c, figures: figuresIn(c, day) }
    }
    const prosecution = pick('prosecution')
    const defense = pick('defense')
    return {
      id: t.id,
      label: t.label,
      prosecution,
      defense,
      laterDays: laterDays.filter((d) => [...d.key_points, ...d.exhibits].some((k) => t.later.test(k))).map((d) => d.day),
    }
  }).filter((r) => r.prosecution || r.defense)

  const unplaced = openings.flatMap((o) => o.clauses.filter((c) => !used.get(o.side)?.has(c)).map((text) => ({ side: o.side, text })))

  const stakeDefs: Array<{ id: string; what: RegExp; unit?: RegExp; label: (n: ReportedNumber) => string; detail?: (n: ReportedNumber) => string | undefined }> = [
    { id: 'counts', what: /indictment counts/i, unit: /count/i, label: () => 'counts in the indictment' },
    { id: 'minimum', what: /mandatory minimum/i, label: () => 'mandatory minimum if convicted on all counts', detail: (n) => (/maximum life/i.test(n.what) ? 'Maximum: life' : undefined) },
    { id: 'jurors', what: /seated jurors/i, unit: /^jurors$/i, label: () => 'jurors', detail: (n) => n.what.match(/\d+ men, \d+ women/)?.[0] },
    { id: 'alternates', what: /alternate/i, unit: /alternate/i, label: () => 'alternate jurors' },
    { id: 'span', what: /span of alleged conduct/i, label: () => 'span of conduct the prosecution alleged' },
  ]
  const stakes: Stake[] = stakeDefs.flatMap((sd) => {
    const num = findNumber(day, sd.what, sd.unit)
    return num ? [{ id: sd.id, num, refs: numberRefs(day, num), label: sd.label(num), detail: sd.detail?.(num) }] : []
  })

  const witnesses = [...getWitnesses()].sort((a, b) => a.first_day - b.first_day)
  const litIds = witnesses.filter((w) => w.first_day <= day.day).map((w) => w.id)

  const verdictRec = getVerdict()
  const verdict = getCharges().map((c) => ({
    count: c.count,
    short: c.short,
    plain: c.plain,
    outcome: c.outcome,
    refs: verdictRec.sources.filter((s) => c.source_ids.includes(s.id)).map((s) => ({ ...toRef(s), origin: 'from the verdict record' })),
  }))

  const allRefs = uniqueRefs([
    ...openings.flatMap((o) => o.fact.refs),
    ...rows.flatMap((r) => [...(r.prosecution?.figures ?? []), ...(r.defense?.figures ?? [])].flatMap((f) => f.refs)),
    ...stakes.flatMap((s) => s.refs),
    ...verdict.flatMap((v) => v.refs),
    ...day.numbers.flatMap((n) => numberRefs(day, n)),
  ])
  return { openings, rows, unplaced, stakes, witnesses, litIds, dayCount: getDays().length, verdict, index: buildIndex(day.sources, allRefs), allRefs }
}
