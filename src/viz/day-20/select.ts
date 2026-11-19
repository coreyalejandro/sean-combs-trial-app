// Day 20: the trial's legal fights, read from every day's legal events. Each entry below says where to find a
// fight in the record (which day, which words); its outcome is that text's own verb (denied, struck, reserved...).
// If the record does not hold the words, the entry is not drawn. The witness table supplies who got immunity.
import { formatDate, getDays, getGaps, getWitnesses, redactThirdParties, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { dayNumber } from '@/viz/kits/days-15-21/days'
import { citedIn, lowest, type Level } from '@/viz/kits/days-15-21/sources'
import { sourcesFor } from '../day-16/select'

export type Kind = 'mistrial' | 'immunity' | 'jurors' | 'warnings' | 'evidence'
export type Outcome = 'granted' | 'denied' | 'struck' | 'pending' | 'reserved' | 'warning' | 'kept' | 'no testimony'

export const KINDS: Array<{ id: Kind; name: string }> = [
  { id: 'mistrial', name: 'Mistrial and acquittal motions' },
  { id: 'immunity', name: 'Immunity and the Fifth Amendment' },
  { id: 'jurors', name: 'Juror issues' },
  { id: 'warnings', name: 'Warnings, leaks and identity protection' },
  { id: 'evidence', name: 'Evidence and media rulings' },
]

export const OUTCOMES: Outcome[] = ['granted', 'denied', 'struck', 'pending', 'reserved', 'warning', 'kept', 'no testimony']

export interface DocketEvent {
  id: string
  kind: Kind
  /** Trial-day position; the June 18 gap sits half a day after the day before it. */
  at: number
  dayLabel: string
  title: string
  outcome: Outcome
  text: string
  level: Level
  sources: Source[]
  fromDay: number | null
}

interface Rule { id: string; kind: Kind; day: string; match: RegExp; outcome: Outcome; title: string }

const RULES: Rule[] = [
  { id: 'mistrial-1', kind: 'mistrial', day: 'Day 11', match: /moved for a mistrial/i, outcome: 'denied', title: 'First mistrial motion, over the fingerprint evidence' },
  { id: 'mistrial-2-filed', kind: 'mistrial', day: 'Day 19', match: /seeking a mistrial/i, outcome: 'pending', title: 'Second mistrial motion filed, over the balcony date' },
  { id: 'mistrial-2', kind: 'mistrial', day: 'Day 20', match: /denied the defense's second mistrial/i, outcome: 'denied', title: 'Second mistrial motion, over the balcony date' },
  { id: 'acquittal', kind: 'mistrial', day: 'Day 28', match: /Rule 29 motion/i, outcome: 'reserved', title: 'Defense motion for a judgment of acquittal on every count' },
  { id: 'batson', kind: 'jurors', day: 'Day 1', match: /struck Black jurors/i, outcome: 'denied', title: 'Defense claim that prosecutors struck Black jurors unfairly' },
  { id: 'juror-move', kind: 'jurors', day: 'Day 21', match: /moved to remove Juror/i, outcome: 'pending', title: 'Prosecutors move to remove a juror for "lack of candor"' },
  { id: 'juror-postponed', kind: 'jurors', day: 'Day 22', match: /postponed (?:a )?decision/i, outcome: 'pending', title: 'Decision on removing the juror postponed' },
  { id: 'juror-removed', kind: 'jurors', day: 'Day 23', match: /announced removal of Juror/i, outcome: 'granted', title: 'Judge announces the juror will be removed' },
  { id: 'juror-dismissed', kind: 'jurors', day: 'Day 24', match: /formally dismissed/i, outcome: 'granted', title: 'Juror dismissed and replaced by an alternate' },
  { id: 'juror-overruled', kind: 'jurors', day: 'Day 24', match: /letter.*overruled/i, outcome: 'denied', title: "Defense objection to the juror's removal" },
  { id: 'juror-conference', kind: 'jurors', day: 'Day 25', match: /closed juror conference/i, outcome: 'pending', title: 'Closed conference about a juror' },
  { id: 'juror-kept', kind: 'jurors', day: 'Day 26', match: /kept a juror/i, outcome: 'kept', title: 'Juror with outside communications kept on the jury' },
  { id: 'caution-steel', kind: 'warnings', day: 'Day 14', match: /cautioned Steel/i, outcome: 'warning', title: 'Judge cautions a defense lawyer over his questions' },
  { id: 'sketches', kind: 'warnings', day: 'Day 12', match: /banned courtroom sketches/i, outcome: 'granted', title: 'Courtroom sketches of Mia banned' },
  { id: 'spectator', kind: 'warnings', day: 'Day 15', match: /spectator shouted/i, outcome: 'warning', title: "Spectator removed over a broadcast of Mia's identity" },
  { id: 'streamer', kind: 'warnings', day: 'Day 16', match: /streamer .*barred/i, outcome: 'granted', title: "Streamer who posted Mia's image barred from the courthouse" },
  { id: 'nodding', kind: 'warnings', day: 'Day 17', match: /threatened to remove Combs/i, outcome: 'warning', title: 'Judge warns Combs about nodding at jurors' },
  { id: 'gag-consider', kind: 'warnings', day: 'Day 18', match: /gag order/i, outcome: 'pending', title: "Judge says he will consider a gag order to protect Jane's identity" },
  { id: 'leaks', kind: 'warnings', day: 'Day 25', match: /gag order warning/i, outcome: 'warning', title: 'Judge threatens sanctions over leaks' },
  { id: 'video', kind: 'evidence', day: 'Day 1', match: /exclude the 2016 hotel video/i, outcome: 'denied', title: 'Defense bid to exclude the hotel video' },
  { id: 'media-1', kind: 'evidence', day: 'Day 2', match: /denied media requests/i, outcome: 'denied', title: 'Media requests to view sealed recordings' },
  { id: 'media-2', kind: 'evidence', day: 'Day 3', match: /denied media request/i, outcome: 'denied', title: 'Media request to show sealed recordings publicly' },
  { id: 'disclose', kind: 'evidence', day: 'Day 3', match: /disclose cross exhibits/i, outcome: 'denied', title: 'Prosecution request that the defense show its exhibits in advance' },
  { id: 'regina', kind: 'evidence', day: 'Day 7', match: /allowed Regina Ventura/i, outcome: 'denied', title: "Defense objection to Regina Ventura's testimony" },
  { id: 'cudi', kind: 'evidence', day: 'Day 9', match: /told to disregard/i, outcome: 'struck', title: "A witness's belief about the car fire struck" },
  { id: 'fingerprint', kind: 'evidence', day: 'Day 11', match: /struck the arson investigator/i, outcome: 'struck', title: "Arson investigator's fingerprint testimony struck" },
  { id: 'money-grab', kind: 'evidence', day: 'Day 14', match: /money grab/i, outcome: 'struck', title: 'A defense phrase struck; jury told to disregard' },
  { id: 'sealed', kind: 'evidence', day: 'Day 16', match: /filed under seal/i, outcome: 'granted', title: 'Private videos filed under seal (jury only)' },
  { id: 'ground-rules', kind: 'evidence', day: 'Day 22', match: /ground rules/i, outcome: 'granted', title: 'Closed hearing on limits to questioning: judge sides with prosecutors' },
]

export interface Day20Selection {
  events: DocketEvent[]
  counts: { total: number; motions: number; motionsDenied: number; deniedAfterVerdict: number; denied: number; immunity: number }
  used: ReportedNumber[]
  other: ReportedNumber[]
  pool: Source[]
  extraSources: Source[]
}

const textLevel = (d: TrialDay): Level => lowest(d.confidence.level, 'medium')

function sourced(d: TrialDay, text: string): { level: Level; sources: Source[] } {
  const c = citedIn(text, d.sources, textLevel(d))
  return c.sources.length > 0 ? c : { level: textLevel(d), sources: sourcesFor(d, /./) }
}

export function select(day: TrialDay): Day20Selection {
  const days = getDays().map((d) => (d.day === day.day ? day : d))
  const byNumber = new Map(days.map((d) => [d.day, d]))
  const events: DocketEvent[] = []

  for (const r of RULES) {
    const d = byNumber.get(dayNumber(r.day))
    const text = d?.legal_events.find((t) => r.match.test(t))
    if (!d || !text) continue
    const s = sourced(d, text)
    events.push({ id: r.id, kind: r.kind, at: d.day, dayLabel: `Day ${d.day}`, title: r.title, outcome: r.outcome, text: redactThirdParties(text), ...s, fromDay: d.day })
  }

  // Immunity: every witness the table marks, at the first day the record mentions their immunity order
  for (const w of getWitnesses().filter((x) => x.immunity)) {
    const surname = w.display_name.split(/\s+/).pop() ?? w.display_name
    const re = new RegExp(`${surname}[^.]*(immunity|Fifth)|(immunity|Fifth)[^.]*${surname}`, 'i')
    const hit =
      days.map((d) => ({ d, t: [...d.legal_events, ...d.key_points].find((t) => re.test(t) && /immunity/i.test(t)) })).find((x) => x.t) ??
      // a pseudonymous witness is not named in her own day's notes: look in the days she testified
      days.filter((d) => w.days.includes(d.day)).map((d) => ({ d, t: d.key_points.find((t) => /received immunity|immunity order/i.test(t)) })).find((x) => x.t)
    const d = hit?.d ?? byNumber.get(w.first_day)
    if (!d) continue
    const text = hit?.t ?? `${w.display_name}: ${w.role}`
    const s = hit?.t ? sourced(d, hit.t) : { level: lowest(textLevel(d), 'low'), sources: sourcesFor(d, new RegExp(surname, 'i')) }
    events.push({
      id: `immunity-${w.id}`, kind: 'immunity', at: d.day, dayLabel: `Day ${d.day}`, title: `${w.display_name} testifies under an immunity order`,
      outcome: 'granted', text: redactThirdParties(hit?.t ? (hit.t.split(/(?<=\.)\s+(?=[A-Z])|;\s+/).find((t) => /immunity/i.test(t)) ?? text) : `${text}. The witness table records an immunity order; the day files do not quote it.`),
      ...s, fromDay: d.day,
    })
  }

  // The day with no testimony (a juror was ill)
  for (const g of getGaps()) {
    const before = byNumber.get(g.afterDay)
    if (!before) continue
    events.push({
      id: `gap-${g.date}`, kind: 'jurors', at: g.afterDay + 1 / 2, dayLabel: `${formatDate(g.date, { year: false })} (no testimony)`,
      title: 'A juror is ill; no testimony that day', outcome: 'no testimony', text: g.note, level: textLevel(before), sources: sourcesFor(before, /June 18|juror|ill/i), fromDay: g.afterDay,
    })
  }

  events.sort((a, b) => a.at - b.at || KINDS.findIndex((k) => k.id === a.kind) - KINDS.findIndex((k) => k.id === b.kind))
  const motions = events.filter((e) => e.kind === 'mistrial' && e.outcome !== 'pending')
  const pool = day.sources
  const ids = new Set(pool.map((s) => s.id))
  return {
    events,
    counts: {
      total: events.length,
      motions: motions.length,
      motionsDenied: motions.filter((e) => e.outcome === 'denied').length,
      // A motion the judge reserved at trial and denied later (the Rule 29 motion, denied after the verdict), as its text says
      deniedAfterVerdict: motions.filter((e) => e.outcome === 'reserved' && /denied it/i.test(e.text)).length,
      denied: events.filter((e) => e.outcome === 'denied').length,
      immunity: events.filter((e) => e.kind === 'immunity').length,
    },
    used: [],
    other: day.numbers,
    pool,
    extraSources: events.flatMap((e) => e.sources).filter((s) => !ids.has(s.id)),
  }
}
