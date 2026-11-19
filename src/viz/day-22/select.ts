// Day 22: Jane's time on the stand, read from the day records of every day she testified.
// Clock times, who was questioning and the lunch breaks are all parsed from the records' own text
// (witness entries, legal events, numbers). Nothing here is typed by hand.
import {
  getDay,
  getWitnesses,
  lowerConfidence,
  resolveSources,
  type Confidence,
  type ReportedNumber,
  type Source,
  type TrialDay,
} from '@/lib/data'
import { utcMinute } from 'd3'
import { clockTokens, MINUTES_PER_HOUR, minutesBetween, toDate, type ClockToken } from './clock'
import { redact } from '@/viz/kits/days-22-28/kit'

export type Exam = 'direct' | 'cross' | 'redirect' | 're-cross' | 'closed'

export const EXAM_LABEL: Record<Exam, string> = {
  direct: 'Direct examination (prosecution)',
  cross: 'Cross-examination (defense)',
  redirect: 'Redirect (prosecution)',
  're-cross': 'Re-cross (defense)',
  closed: 'Closed conference (no jury, no public)',
}
export const EXAM_SIDE: Record<Exam, 'prosecution' | 'defense' | 'court'> = {
  direct: 'prosecution',
  cross: 'defense',
  redirect: 'prosecution',
  're-cross': 'defense',
  closed: 'court',
}

export interface TimeFact {
  date: Date
  raw: string
  confidence: Confidence
  sources: Source[]
}

export interface Segment {
  exam: Exam
  /** Who asked, as written in the record ("Maurene Comey"), when stated. */
  by: string | null
  start: TimeFact | null
  end: TimeFact | null
  /** True when the record gives no times for this part of the day. */
  timesNotReported: boolean
  /** Approximate placement (e.g. "the first two hours"), drawn dashed. */
  approximate: boolean
  /** Topics of this part of the day, when the record separates them. */
  topics?: Topic[]
}

export interface Topic {
  label: string
  count: number
}

export interface Row {
  n: number
  date: string
  weekday: string
  segments: Segment[]
  lunch: { start: TimeFact; end: TimeFact } | null
  /** A return-from-lunch time when the start of lunch was not reported. */
  lunchReturn: TimeFact | null
  topics: Topic[]
  /** Minutes on the stand that day when both ends are reported (lunch removed when known). */
  minutes: number | null
  minutesFormula: string
  sources: Source[]
  confidence: Confidence
}

export interface Day22Selection {
  rows: Row[]
  /** Jane's last answer, quoted in the record. */
  finalAnswer: { text: string; day: number; sources: Source[] } | null
  /** The court-record count of days on the stand (a reported number), and the count of rows (calculated). */
  daysReported: ReportedNumber | null
  daysCounted: number
  daysDiscrepancy: string | null
  totalMinutes: number
  rowsWithTimes: number
  numbers: ReportedNumber[]
  sources: Source[]
}

const JANE = /\bJane\b/

function janeEntryText(day: TrialDay): string {
  const w = day.witnesses.find((x) => JANE.test(x.name))
  return w ? `${w.role ?? ''} ${w.exam ?? ''}` : ''
}

/** Clauses that mention an examination that did NOT happen that day. */
const NOT_THIS_DAY = /No (cross|redirect)[^.;]*|(Redirect|Re-cross) not reported[^.;]*|direct testimony had run since[^;]*/gi
const EXAM_RE = /\b(re-cross|redirect|cross|direct)\b/gi
const BY_RE = /\bby\s+(?:defense attorney\s+|prosecutor\s+)?([A-Z][a-z]+\s[A-Z][a-z]+)/

function examsIn(text: string): Array<{ exam: Exam; by: string | null }> {
  const clean = text.replace(NOT_THIS_DAY, '')
  const out: Array<{ exam: Exam; by: string | null }> = []
  for (const m of clean.matchAll(EXAM_RE)) {
    const exam = m[1].toLowerCase() as Exam
    if (out.length > 0 && out[out.length - 1].exam === exam) continue
    const after = clean.slice((m.index ?? 0) + m[0].length)
    const clause = after.split(/[,;]|\bthen\b/)[0]
    const by = clause.match(BY_RE)?.[1] ?? null
    out.push({ exam, by })
  }
  // Re-cross and redirect inherit the lawyer of the matching earlier examination when not named.
  for (const e of out) {
    if (e.by) continue
    const side = EXAM_SIDE[e.exam]
    e.by = out.find((o) => o.by && EXAM_SIDE[o.exam] === side)?.by ?? null
  }
  return out
}

/** The reported number on that day that states one of these times, if any (for its confidence and sources). */
function numberStating(day: TrialDay, raws: string[]): ReportedNumber | undefined {
  const keys = raws.map((r) => r.replace(/\s*(a\.m\.|p\.m\.|am|pm)$/i, '').trim())
  return day.numbers.find((n) => keys.some((k) => `${n.value} ${n.unit} ${n.what}`.includes(k)))
}

function nbcSources(day: TrialDay): Source[] {
  const nbc = resolveSources({ source: 'NBC', outlets: ['NBC'] }, day.sources)
  return nbc.length > 0 ? nbc : day.sources
}

function fact(day: TrialDay, tok: ClockToken, num: ReportedNumber | undefined): TimeFact {
  // A time with no reported number behind it rests on one live-blog entry: "one outlet, unconfirmed".
  const confidence: Confidence = num ? lowerConfidence(num.confidence, 'medium') : 'low'
  return { date: toDate(tok), raw: tok.raw, confidence, sources: num ? resolveSources(num, day.sources) : nbcSources(day) }
}

const TOPIC_RULES: Array<[string, RegExp]> = [
  ['The relationship and how it began', /relationship|love|boyfriend|first date|\bmet\b|affection|jealous|girls' trip/i],
  ['Money, rent and support', /\$|rent|money|allowance|wired|credit card|income|child support|paid/i],
  ['Messages, voice notes and recordings', /\btexts?\b|message|voice|recording|audio|voicemail|\bnote\b/i],
  ['Trips and travel', /\btrips?\b|travel|Turks|Miami|flight/i],
  ["The 'hotel nights' (no detail shown)", /hotel night|encounter|entertainer|escort|sobriety party/i],
  ['Drug use', /drug|ecstasy|sobriety|rehab/i],
  ['Violence she described (no detail shown)', /violen|struck|dragg|kick|fight|welt|slap/i],
  ['Her health and wellbeing (no detail shown)', /therapy|suicid|toll|infection|pain\b|nearly fainted/i],
  ['The lawsuit and the investigation', /lawsuit|raid|agent|immunity|grand jury|investigation|lawyer|defense team/i],
  ['Closed conference on questioning rules', /closed-door|closed hearing|ground rules/i],
]

function topicsFor(points: string[]): Topic[] {
  return TOPIC_RULES.map(([label, re]) => ({ label, count: points.filter((p) => re.test(p)).length })).filter((t) => t.count > 0)
}

/** Key points about Jane's testimony that day (on her first day the record also covers other witnesses). */
function janePoints(day: TrialDay, firstDay: boolean): string[] {
  return day.key_points.filter((k) => !firstDay || /^Jane\b|\bJane \(/.test(k))
}

const SEGMENT_PREFIX: Array<[Exam, RegExp]> = [
  ['closed', /closed-door|closed hearing/i],
  ['re-cross', /^Re-cross/i],
  ['redirect', /^Redirect/i],
  ['cross', /^Cross|on cross/i],
]

export function selectDay22(today: TrialDay): Day22Selection {
  const jane = getWitnesses().find((w) => w.id === 'jane')
  const dayNums = jane ? jane.days : []
  const days = dayNums.map((n) => (n === today.day ? today : getDay(n)))
  const rows: Row[] = days.map((day, i) => {
    const text = janeEntryText(day)
    const toks = clockTokens(text)
    const exams = examsIn(text)
    const legal = day.legal_events.join(' ')
    const segments: Segment[] = []
    let lunch: Row['lunch'] = null
    let lunchReturn: TimeFact | null = null
    const lunchMatch = legal.match(/Lunch\s+([\d:]+\s*-\s*[\d:]+\s*(?:AM|PM|a\.m\.|p\.m\.)?)/i)
    if (lunchMatch) {
      const lt = clockTokens(lunchMatch[1].replace('-', ' - '))
      if (lt.length >= 2) {
        const num = numberStating(day, [lt[0].raw, lt[1].raw])
        lunch = { start: fact(day, lt[0], num), end: fact(day, lt[1], num) }
      }
    }
    const back = legal.match(/due back\s+([\d:]+\s*(?:AM|PM|a\.m\.|p\.m\.))/i)
    if (back) {
      const bt = clockTokens(back[1])
      if (bt.length > 0) lunchReturn = fact(day, bt[0], numberStating(day, [bt[0].raw]))
    }

    if (toks.length >= 1 && exams.length === 1) {
      let endTok: ClockToken | undefined = toks[1]
      if (!endTok) {
        // Only a start was given: the session ran to the day's adjournment.
        const adj = day.legal_events.find((l) => /adjourned/i.test(l))
        endTok = adj ? clockTokens(adj).find((t) => /adjourned about\s*$|adjourned\s*$/i.test(adj.slice(0, t.index))) ?? clockTokens(adj)[0] : undefined
      }
      const num = numberStating(day, [toks[0].raw, endTok?.raw ?? ''].filter(Boolean))
      segments.push({
        exam: exams[0].exam,
        by: exams[0].by,
        start: fact(day, toks[0], num),
        end: endTok ? fact(day, endTok, num) : null,
        timesNotReported: false,
        approximate: false,
      })
    } else {
      // No times for the examinations: say so. A closed conference with a reported length comes first.
      const conf = day.numbers.find((n) => /closed-door conference/i.test(n.what))
      if (conf) {
        const prev = getDay(day.day - 1)
        const due = [...prev.numbers.map((n) => `${n.value} ${n.unit} ${n.what}`), ...prev.legal_events]
          .map((s) => s.match(/due before\s+(\d{1,2}(?::\d{2})?\s*(?:AM|a\.m\.))/i)?.[1])
          .find(Boolean)
        const dueTok = due ? clockTokens(due)[0] : undefined
        const hours = Number(String(conf.value).replace(/[^\d.]/g, ''))
        const startF: TimeFact | null = dueTok ? { ...fact(prev, dueTok, undefined), confidence: 'low' } : null
        const endF: TimeFact | null = startF && hours
          ? { date: utcMinute.offset(startF.date, hours * MINUTES_PER_HOUR), raw: `${conf.value} ${conf.unit}`, confidence: lowerConfidence(conf.confidence, 'low'), sources: resolveSources(conf, day.sources) }
          : null
        segments.push({ exam: 'closed', by: null, start: startF, end: endF, timesNotReported: !startF, approximate: true })
      }
      for (const e of exams) segments.push({ exam: e.exam, by: e.by, start: null, end: null, timesNotReported: true, approximate: true })
    }

    const timed = segments.filter((s) => s.exam !== 'closed' && s.start && s.end)
    let minutes: number | null = null
    let minutesFormula = 'not calculated: the reporting gives no times for the questioning this day'
    if (timed.length > 0) {
      minutes = timed.reduce((sum, s) => sum + minutesBetween((s.start as TimeFact).date, (s.end as TimeFact).date), 0)
      minutesFormula = 'end time minus start time'
      if (lunch) {
        minutes -= minutesBetween(lunch.start.date, lunch.end.date)
        minutesFormula += ', minus the reported lunch break'
      } else if (lunchReturn) {
        minutesFormula += '; includes a lunch break whose start was not reported'
      }
    }
    const points = janePoints(day, i === 0)
    const allFacts = segments.flatMap((s) => [s.start, s.end]).filter((f): f is TimeFact => Boolean(f))
    const sources = [...new Map(allFacts.flatMap((f) => f.sources).map((s) => [s.id, s])).values()]
    const confidence = allFacts.reduce<Confidence>((c, f) => lowerConfidence(c, f.confidence), 'high')
    return {
      n: day.day,
      date: day.date,
      weekday: day.weekday,
      segments,
      lunch,
      lunchReturn,
      topics: topicsFor(points),
      minutes,
      minutesFormula,
      sources: sources.length > 0 ? sources : nbcSources(day),
      confidence: allFacts.length > 0 ? confidence : 'low',
    }
  })

  // The topics of each part of the last day, by how the record introduces each point.
  const last = days[days.length - 1]
  if (last && rows.length > 0) {
    const lastRow = rows[rows.length - 1]
    lastRow.topics = topicsFor(janePoints(last, false))
    for (const seg of lastRow.segments) {
      const pts = last.key_points.filter((k) => SEGMENT_PREFIX.find(([, re]) => re.test(k))?.[0] === seg.exam)
      seg.topics = topicsFor(pts)
    }
  }

  const finalDay = [...days].reverse().find((d) => d.key_points.some((k) => /final answer/i.test(k)))
  const finalText = finalDay?.key_points.find((k) => /final answer/i.test(k))?.match(/final answer:\s*'(.+)'\.?\s*$/i)?.[1]
  const finalNum = finalDay ? resolveSources({ source: 'GMA', outlets: ['ABC'] }, finalDay.sources) : []

  const daysReported = today.numbers.find((n) => /days jane was on the stand/i.test(n.what)) ?? null
  const daysDiscrepancy = today.discrepancies.find((d) => /days on the stand/i.test(d)) ?? null
  const withTimes = rows.filter((r) => r.minutes !== null)

  return {
    rows,
    finalAnswer: finalText && finalDay ? { text: redact(finalText), day: finalDay.day, sources: finalNum.length ? finalNum : finalDay.sources } : null,
    daysReported,
    daysCounted: rows.length,
    daysDiscrepancy: daysDiscrepancy ? redact(daysDiscrepancy) : null,
    totalMinutes: withTimes.reduce((s, r) => s + (r.minutes ?? 0), 0),
    rowsWithTimes: withTimes.length,
    numbers: today.numbers,
    sources: today.sources,
  }
}
