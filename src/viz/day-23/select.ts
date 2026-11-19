// Day 23: what agents testified they seized in three searches, read from Days 5, 7, 8 and 23.
// Each figure is picked by what it is (never by position) and keeps its own confidence and sources.
import { getDays, getWitnessesOnDay, lowerConfidence, resolveSources, type Confidence, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { toNumber } from '@/lib/viz/format'

export type BottleKind = 'baby oil' | 'lubricant'

export interface Bottles {
  kind: BottleKind
  count: number
  num: ReportedNumber
  day: number
  sources: Source[]
  confidence: Confidence
}

export interface Item {
  label: string
  num: ReportedNumber
  day: number
  sources: Source[]
}

export interface Site {
  id: 'arrest' | 'miami' | 'la'
  name: string
  /** The day the agent described the search (the bottle counts' day). */
  day: number
  agent: string | null
  date: { num: ReportedNumber; day: number; sources: Source[] } | null
  bottles: Bottles[]
  items: Item[]
  /** Text-only notes from the record (no count reported). */
  notes: Array<{ text: string; day: number; sources: Source[] }>
  total: number
  confidence: Confidence
}

export interface Day23Selection {
  sites: Site[]
  defenseQuestion: { text: string; day: number } | null
  verification: string | null
}

function pick(day: TrialDay, re: RegExp): ReportedNumber | undefined {
  return day.numbers.find((n) => re.test(`${n.what} ${n.unit}`))
}

/** One outlet family can only support "one outlet": a "high" with a single outlet family is lowered. */
function honest(num: ReportedNumber): Confidence {
  return num.outlets.length >= 2 ? num.confidence : lowerConfidence(num.confidence, 'medium')
}

function bottles(day: TrialDay, kind: BottleKind, re: RegExp): Bottles[] {
  const num = pick(day, re)
  const count = num ? toNumber(num.value) : null
  if (!num || count === null) return []
  return [{ kind, count, num, day: day.day, sources: resolveSources(num, day.sources), confidence: honest(num) }]
}

/** label null: use the reported unit as the label ("AR-15 receivers"). */
function item(day: TrialDay, re: RegExp, label: string | null): Item[] {
  const num = pick(day, re)
  return num ? [{ label: label ?? `rifle parts: ${num.unit}`, num, day: day.day, sources: resolveSources(num, day.sources) }] : []
}

function agentOn(n: number): string | null {
  return getWitnessesOnDay(n).find((w) => w.group === 'police-and-agents')?.display_name ?? null
}

function dated(day: TrialDay, re: RegExp): Site['date'] {
  const num = pick(day, re)
  return num ? { num, day: day.day, sources: resolveSources(num, day.sources) } : null
}

export function selectDay23(today: TrialDay): Day23Selection {
  // Find each search's day by what its record holds, not by number.
  const days = getDays().map((x) => (x.day === today.day ? today : x))
  const has = (re: RegExp) => days.find((x) => x.numbers.some((n) => re.test(`${n.what} ${n.unit}`))) ?? today
  const arrestDay = has(/baby oil bottles in bathtub/i) // the arrest-room search
  const miamiDay = has(/bottles recovered, miami/i) // the Miami search counts
  const miamiParts = has(/AR-15|receivers/i) // the Miami rifle parts
  const site = (s: Omit<Site, 'total' | 'confidence'>): Site => ({
    ...s,
    total: s.bottles.reduce((t, b) => t + b.count, 0),
    confidence: s.bottles.reduce<Confidence>((c, b) => lowerConfidence(c, b.confidence), 'high'),
  })
  const firearmNote = today.key_points.find((k) => /security room/i.test(k))
  const sites: Site[] = [
    site({
      id: 'arrest',
      name: 'Arrest hotel room, New York',
      day: arrestDay.day,
      agent: agentOn(arrestDay.day),
      date: dated(arrestDay, /arrest date/i),
      bottles: bottles(arrestDay, 'baby oil', /baby oil bottles/i),
      items: item(arrestDay, /cash found/i, 'cash in the room'),
      notes: arrestDay.key_points.some((k) => /lubricant/i.test(k) && /Park Hyatt|arrest/i.test(k))
        ? [{ text: 'lubricant (no count reported)', day: arrestDay.day, sources: bottles(arrestDay, 'baby oil', /baby oil bottles/i).flatMap((b) => b.sources) }]
        : [],
    }),
    site({
      id: 'miami',
      name: 'Miami home (Star Island)',
      day: miamiDay.day,
      agent: agentOn(miamiDay.day),
      date: dated(miamiDay, /raid on miami/i),
      bottles: [...bottles(miamiDay, 'baby oil', /baby oil bottles recovered/i), ...bottles(miamiDay, 'lubricant', /lubricant bottles recovered/i)],
      items: [...item(miamiDay, /high heels/i, 'pairs of high heels'), ...item(miamiParts, /parts found/i, null)],
      notes: [],
    }),
    site({
      id: 'la',
      name: 'Los Angeles home',
      day: today.day,
      agent: agentOn(today.day),
      date: dated(miamiDay, /los angeles homes/i),
      bottles: [...bottles(today, 'baby oil', /baby oil seized/i), ...bottles(today, 'lubricant', /astroglide seized/i)],
      items: [...item(today, /lubricant boxes/i, 'boxes of lubricant in photos'), ...item(today, /drum magazine/i, 'drum magazine (capacity in rounds)')],
      notes: firearmNote ? [{ text: 'firearms, all kept in a security room, the agent said on cross-examination', day: today.day, sources: resolveSources({ source: 'ABC', outlets: ['ABC'] }, today.sources) }] : [],
    }),
  ]
  const defense = today.key_points.find((k) => /defense questioned why lubricant/i.test(k))
  const verification = today.discrepancies.find((x) => /agent name/i.test(x)) ?? null
  return {
    sites,
    defenseQuestion: defense ? { text: 'The defense questioned why lubricant would be relevant to a trafficking investigation.', day: today.day } : null,
    verification,
  }
}
