// Day 28: the whole cast. Every star is a row of the shared 34-row witness table; faint lines join witnesses
// whose own records mention the same event (rules below, matched against each witness's record text).
import {
  getDay,
  getDays,
  getWitnesses,
  resolveSources,
  type Confidence,
  type ReportedNumber,
  type Source,
  type TrialDay,
  type WitnessGroup,
  type WitnessRecord,
} from '@/lib/data'
import { redact } from '@/viz/day-22/kit'

export const GROUP_LABEL: Record<WitnessGroup, string> = {
  'named-in-charges': 'The two women named in the charges',
  'described-harm': 'Others who described harm',
  eyewitness: 'Eyewitnesses',
  'former-staff': 'Former staff',
  'police-and-agents': 'Police and agents',
  'records-and-analysis': 'Record keepers and analysts',
  expert: 'The expert',
}
export const GROUPS = Object.keys(GROUP_LABEL) as WitnessGroup[]

export const EVENTS: Array<{ id: string; label: string; re: RegExp }> = [
  { id: 'hotel-video', label: 'the Los Angeles hotel hallway video', re: /InterContinental|hallway|March 5, 2016|2016 hotel|hotel (surveillance )?video/i },
  { id: 'cudi', label: 'the Kid Cudi break-in, his car, and what followed', re: /Cudi|Porsche|Dec(ember|\.)? 2011/i },
  { id: 'date-dispute', label: 'the disputed hotel-bill date and the balcony account', re: /Sept(ember)?\.? \d*,? ?2016|balcony/i },
  { id: 'searches', label: 'the searches and the arrest', re: /\bsearch|seiz|\braid|arrest\b/i },
]

export interface Star {
  w: WitnessRecord
  order: number
  role: string
  events: string[]
}

export interface Day28Selection {
  stars: Star[]
  total: number
  totalNum: ReportedNumber | null
  totalPool: Source[]
  daysNum: ReportedNumber | null
  defenseLength: ReportedNumber | null
  defenseRested: ReportedNumber | null
  declined: string | null
  declinedSources: Source[]
  defenseRead: string | null
  rule29: string | null
  confidence: Confidence
  lastDay: number
}

function surname(w: WitnessRecord): string {
  if (w.pseudonym) return w.display_name
  const n = w.display_name.replace(/\(.*\)/, '').trim().split(' ')
  return n[n.length - 1]
}

function textsFor(w: WitnessRecord, days: TrialDay[]): string[] {
  const out = [w.role]
  const sn = surname(w)
  for (const d of days.filter((x) => w.days.includes(x.day))) {
    for (const e of d.witnesses) if (w.raw_names.includes(e.name)) out.push(`${e.name} ${e.role ?? ''} ${e.exam ?? ''}`)
    for (const k of d.key_points) if (sn.length > 2 && k.includes(sn)) out.push(k)
  }
  return out
}

export function selectDay28(today: TrialDay): Day28Selection {
  const days = getDays().map((d) => (d.day === today.day ? today : d))
  const table = getWitnesses()
  const dayOrder = (w: WitnessRecord) => {
    const d = days.find((x) => x.day === w.first_day)
    const idx = d ? d.witnesses.findIndex((e) => w.raw_names.includes(e.name)) : 0
    return w.first_day * days.length + Math.max(idx, 0)
  }
  const stars: Star[] = [...table]
    .sort((a, b) => dayOrder(a) - dayOrder(b))
    .map((w, i) => {
      const texts = textsFor(w, days)
      return {
        w,
        order: i + 1,
        role: redact(w.role.split(/:\s/)[0]).replace(/\s*\([^)]*$/, ''),
        events: EVENTS.filter((e) => texts.some((t) => e.re.test(t))).map((e) => e.id),
      }
    })
  const totalNum = today.numbers.find((n) => /prosecution witnesses in total/i.test(n.what)) ?? null
  const daysNum = today.numbers.find((n) => /days of testimony/i.test(n.what)) ?? null
  const defenseLength = today.numbers.find((n) => /length of defense case/i.test(n.what)) ?? null
  const defenseRested = today.numbers.find((n) => /defense rested/i.test(n.what)) ?? null
  const declined = today.legal_events.find((l) => /will not testify/i.test(l)) ?? null
  const read = today.key_points.find((k) => /defense case lasted/i.test(k)) ?? null
  const rule29 = today.legal_events.find((l) => /Rule 29/i.test(l)) ?? null
  return {
    stars,
    total: stars.length,
    totalNum,
    totalPool: today.sources,
    daysNum,
    defenseLength,
    defenseRested,
    declined,
    declinedSources: resolveSources({ source: 'NBC; NPR; Fox News; GMA', outlets: ['NBC', 'NPR', 'Fox', 'ABC'] }, today.sources),
    defenseRead: read ? redact(read.split(/(?<=\.)\s+/).slice(0, 2).join(' ')) : null,
    rule29,
    confidence: today.confidence.level,
    lastDay: days[days.length - 1]?.day ?? getDay(today.day).day,
  }
}
