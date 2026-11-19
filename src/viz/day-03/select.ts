// Day 3: the evidence matrix. Rows are the dated events from Day 3's figures; each cell lists the pieces of
// evidence the jury saw of that kind, found in the day records by what they say (never by position).
// A piece appears only while its day's record still contains the statement it rests on.
import { getDays, redactThirdParties, type TrialDay } from '@/lib/data'
import { buildIndex, findFact, findNumber, monthIn, monthName, numberRefs, uniqueRefs, yearIn, type Level, type Ref, type RefIndex } from '../day-01/kit/refs'

export const KINDS = [
  { id: 'testimony', label: 'Her testimony', short: 'Her' },
  { id: 'photo', label: 'Photograph', short: 'Photo' },
  { id: 'message', label: 'Text or email', short: 'Msg' },
  { id: 'video', label: 'Video', short: 'Video' },
  { id: 'witness', label: 'Another witness', short: 'Other' },
  { id: 'records', label: 'Records', short: 'Record' },
] as const
export type KindId = (typeof KINDS)[number]['id']

interface RowDef {
  id: string
  /** Finds the Day 3 figure that dates the event. */
  number: RegExp
  what: string
}
const ROWS: RowDef[] = [
  { id: 'cudi', number: /Kid Cudi/i, what: 'After Combs learned of her new relationship' },
  { id: 'eyebrow', number: /eyebrow/i, what: 'An injury that needed stitches' },
  { id: 'cannes', number: /Cannes/i, what: 'A dispute at Cannes' },
  { id: 'hotel', number: /hotel assault/i, what: 'The Los Angeles hotel' },
  { id: 'malibu', number: /Malibu/i, what: 'After a dinner in Malibu' },
]

interface PieceRule {
  row: string
  kind: KindId
  /** Which day's record holds it: found by matching `dayMatch` against the record, not typed. */
  find: { pattern: RegExp; onDay: (d: TrialDay) => boolean }
  label: string
}
const onStand = (name: RegExp) => (d: TrialDay) => d.witnesses.some((w) => name.test(w.name))
const RULES: PieceRule[] = [
  { row: 'cudi', kind: 'testimony', find: { pattern: /^Dec \d{4}: after Combs learned/, onDay: onStand(/Cassie/) }, label: 'Ventura described threats and an incident after Combs learned of her new relationship' },
  { row: 'cudi', kind: 'photo', find: { pattern: /injury photos/, onDay: onStand(/Cassie/) }, label: 'Injury photos from that month, shown during her testimony (not reproduced here)' },
  { row: 'cudi', kind: 'photo', find: { pattern: /photos of bruises.*taken Dec/i, onDay: onStand(/Regina/) }, label: 'Photos her mother said she took on Christmas Eve (shown here only as a date)' },
  { row: 'cudi', kind: 'message', find: { pattern: /email Ventura to (her )?mother/, onDay: onStand(/Regina/) }, label: 'An email from Ventura to her mother and an assistant' },
  { row: 'cudi', kind: 'witness', find: { pattern: /^Regina Ventura: Dec/, onDay: onStand(/Regina/) }, label: 'Regina Ventura, her mother, testified about a demand for money' },
  { row: 'cudi', kind: 'witness', find: { pattern: /^Cudi: in December/, onDay: onStand(/Cudi/) }, label: 'Kid Cudi testified that she called him frightened' },
  { row: 'cudi', kind: 'witness', find: { pattern: /^Clark: on Dec/, onDay: onStand(/Capricorn Clark/) }, label: 'Capricorn Clark testified that Combs came to her door that month' },
  { row: 'cudi', kind: 'records', find: { pattern: /^Ferguson: .*transfers/, onDay: onStand(/Ferguson/) }, label: 'Bank records of that month, walked through by Derek Ferguson' },
  { row: 'eyebrow', kind: 'testimony', find: { pattern: /injury to her eyebrow/, onDay: onStand(/Cassie/) }, label: 'Ventura described an injury that needed stitches' },
  { row: 'eyebrow', kind: 'photo', find: { pattern: /injury photos/, onDay: onStand(/Cassie/) }, label: 'Injury photos shown during her testimony (not reproduced here)' },
  { row: 'eyebrow', kind: 'message', find: { pattern: /so you can remember/i, onDay: onStand(/Cassie/) }, label: 'She said she texted him a photo of the injury' },
  { row: 'eyebrow', kind: 'photo', find: { pattern: /injury \(eyebrow\)/, onDay: onStand(/Nash/) }, label: 'Injury photos shown again during Deonte Nash’s testimony' },
  { row: 'cannes', kind: 'testimony', find: { pattern: /dispute at Cannes/, onDay: onStand(/Cassie/) }, label: 'Ventura described a dispute at Cannes and threats on the flight home' },
  { row: 'cannes', kind: 'testimony', find: { pattern: /flight home from France/, onDay: onStand(/Cassie/) }, label: 'On redirect she returned to the flight home' },
  { row: 'hotel', kind: 'video', find: { pattern: /hallway surveillance video/, onDay: onStand(/Florez/) }, label: 'The hotel hallway surveillance video, without audio (not shown here)' },
  { row: 'hotel', kind: 'witness', find: { pattern: /^Florez: received a call/, onDay: onStand(/Florez/) }, label: 'Israel Florez, then hotel security, described what he saw' },
  { row: 'hotel', kind: 'records', find: { pattern: /^Hotel incident report/, onDay: onStand(/Florez/) }, label: 'The hotel’s incident report' },
  { row: 'hotel', kind: 'testimony', find: { pattern: /InterContinental incident/, onDay: onStand(/Cassie/) }, label: 'Ventura began describing the hotel incident' },
  { row: 'hotel', kind: 'photo', find: { pattern: /Uber selfies/, onDay: onStand(/Cassie/) }, label: 'Two selfies from the ride home (not reproduced here)' },
  { row: 'hotel', kind: 'message', find: { pattern: /Message read five days after/, onDay: onStand(/Binda/) }, label: 'A message from Ventura, read in court, sent five days later' },
  { row: 'hotel', kind: 'witness', find: { pattern: /^Morgan:.*hotel incident/, onDay: onStand(/Morgan/) }, label: 'Kerry Morgan described the aftermath' },
  { row: 'hotel', kind: 'witness', find: { pattern: /^Garcia: the .*InterContinental incident/, onDay: onStand(/Garcia/) }, label: 'Eddy Garcia, hotel security, testified about the footage being bought' },
  { row: 'hotel', kind: 'records', find: { pattern: /^NDA covering the .*footage/, onDay: onStand(/Garcia/) }, label: 'A non-disclosure agreement covering the footage' },
  { row: 'hotel', kind: 'witness', find: { pattern: /^Piazza: authenticated/, onDay: onStand(/Piazza/) }, label: 'Frank Piazza, a video expert, testified the video was unaltered' },
  { row: 'hotel', kind: 'message', find: { pattern: /Khorram in \d{4} trying to keep/, onDay: (d) => d.key_points.some((k) => /Khorram in \d{4} trying to keep/.test(k)) }, label: 'Texts from Combs’s chief of staff about keeping the video private' },
  { row: 'malibu', kind: 'testimony', find: { pattern: /after a Malibu dinner/, onDay: onStand(/Cassie/) }, label: 'Ventura described what she alleged happened after the dinner' },
  { row: 'malibu', kind: 'testimony', find: { pattern: /month after the alleged August/, onDay: onStand(/Cassie/) }, label: 'On cross-examination she said she saw him about a month later' },
]

export interface Piece {
  id: string
  row: string
  kind: KindId
  day: number
  label: string
  source: string
  level: Level
  refs: Ref[]
}

export interface MatrixRow {
  id: string
  label: string
  what: string
  level: Level
  refs: Ref[]
}

export interface Day03Selection {
  rows: MatrixRow[]
  pieces: Piece[]
  firstDay: number
  lastDay: number
  /** Filled cells at the end of each day, firstDay..lastDay (calculated). */
  filledByDay: number[]
  views: { value: string; level: Level; refs: Ref[] } | null
  index: RefIndex
}

function rowLabel(value: string | number, what: string): string {
  const y = yearIn(value)
  const m = typeof value === 'string' && /^\d{4}-\d{2}/.test(value) ? Number(value.slice(String(y).length + 1, String(y).length + 1 + 2)) - 1 : monthIn(what)
  return `${m !== null && m >= 0 ? `${monthName(m)} ` : ''}${y ?? value}`
}

export function select(day: TrialDay): Day03Selection {
  const rows: MatrixRow[] = ROWS.flatMap((r) => {
    const num = findNumber(day, r.number)
    return num ? [{ id: r.id, label: rowLabel(num.value, num.what), what: r.what, level: num.confidence, refs: numberRefs(day, num) }] : []
  })
  const days = getDays()
  const pieces: Piece[] = []
  for (const rule of RULES) {
    if (!rows.some((r) => r.id === rule.row)) continue
    for (const d of days) {
      if (!rule.find.onDay(d)) continue
      // Day 3's own record is the one passed in (so a changed record changes the picture).
      const rec = d.day === day.day ? day : d
      const fact = findFact(rec, rule.find.pattern)
      if (!fact) continue
      pieces.push({ id: `${rule.row}-${rule.kind}-${d.day}`, row: rule.row, kind: rule.kind, day: d.day, label: rule.label, source: redactThirdParties(fact.text), level: fact.confidence, refs: fact.refs })
      break
    }
  }
  pieces.sort((a, b) => a.day - b.day)
  const firstDay = days[0].day
  const lastDay = days[days.length - 1].day
  const filledByDay: number[] = []
  for (let n = firstDay; n <= lastDay; n++) {
    const cells = new Set(pieces.filter((p) => p.day <= n).map((p) => `${p.row}:${p.kind}`))
    filledByDay.push(cells.size)
  }
  const viewsNum = findNumber(day, /times jury had watched/i)
  const views = viewsNum ? { value: String(viewsNum.value), level: viewsNum.confidence, refs: numberRefs(day, viewsNum) } : null
  const all = uniqueRefs([...rows.flatMap((r) => r.refs), ...pieces.flatMap((p) => p.refs), ...(views?.refs ?? []), ...day.numbers.flatMap((n) => numberRefs(day, n))])
  return { rows, pieces, firstDay, lastDay, filledByDay, views, index: buildIndex(day.sources, all) }
}
