// Day 25: every exhibit named in coverage across all testimony days, sorted into kinds by the words the
// record uses. The kind, "sealed" and side tags are computed here from each exhibit's own text
// (the scaffold did not tag them), so the rules below are the method, and the README lists them.
import { getDays, type TrialDay } from '@/lib/data'
import { redact } from '@/viz/kits/days-22-28/kit'

export type Kind =
  | 'financial'
  | 'travel'
  | 'hotel'
  | 'audio'
  | 'video'
  | 'photo'
  | 'text'
  | 'seized'
  | 'document'

export const KIND_LABEL: Record<Kind, string> = {
  video: 'Video',
  audio: 'Audio',
  text: 'Texts, messages and email',
  photo: 'Photographs',
  financial: 'Financial records',
  hotel: 'Hotel records',
  travel: 'Travel records',
  seized: 'Seized items',
  document: 'Documents and charts',
}

/** First matching rule wins. Order matters: "flight and hotel records" is a travel record, not a hotel record. */
const KIND_RULES: Array<[Kind, RegExp]> = [
  ['document', /\bNDA\b/],
  ['text', /^Texts?\b|^Text messages|^Text chain/i],
  ['travel', /flight record|flight and hotel|airline|travel record/i],
  ['financial', /\bbank\b|wire records|credit-card|card bill|\bAmex\b|financial/i],
  ['hotel', /hotel bill|Hotel bill|Tower bill|incident report|reservation records|damage record|alias activity/i],
  ['audio', /\baudio\b|voicemail|voice memo|voice note|recorded call/i],
  ['video', /video|footage|clips|recordings/i],
  ['photo', /photo|selfie|stills|Instagram post/i],
  ['text', /\btexts?\b|message|e-?mails?\b|group chat|WhatsApp|social posts|\bnote\b/i],
  ['seized', /baggies|\bdrugs?\b|bullets|box marked|bag with pills|medicine bag|receivers|cash stack|passport|burner phone|driving glove|lubricant|baby-oil|baby oil bottles|handgun/i],
]

const SEALED = /seal|jury only|jurors only|not public|juror screens|headsets|headphones|shown only to jur/i
const DEFENSE = /\(defense|defense exhibit|defense-introduced|defense\)|Defense Exhibit/i
const PROSECUTION = /\bprosecution\b|Government released/i

const INJURY = /injur|bruis|black eye|fat lip|eyebrow|welts?\b/i
const SEXUAL = /freak|sex video|sex tape|explicit|horny|every detail/i

/**
 * Things the reporting mentions that were not shown to the jury as exhibits (review, Nov 2026): items the judge
 * excluded, items only described or referred to in testimony, and records the reporting implies but never names.
 */
const NOT_SHOWN = /excluded|not admitted|testimonial description|\bimplied\b|no exhibit numbers|\(described|described in opening|\(referenced|referenced in|\breferenced\)/i
/** The 2016 hotel video is one exhibit, however many days the reporting mentions it. */
const HOTEL_VIDEO = /(?:InterContinental|hotel hallway|2016 hotel).*(?:video|footage)|(?:video|footage).*(?:InterContinental|hotel hallway)/i
const HIRED_PEOPLE = /escorts?\b|sex workers?/i

export type Side = 'prosecution' | 'defense' | 'unstated'

export const SIDE_WORDS: Record<Side | 'all', string> = {
  all: 'All exhibits',
  prosecution: 'Prosecution (as stated)',
  defense: 'Defense (as stated)',
  unstated: 'Side not stated',
}

export interface Exhibit {
  id: string
  day: number
  kind: Kind
  sealed: boolean
  side: Side
  /** The label shown on screen: the record's words with quotations, injuries and sexual detail removed. */
  label: string
  /** True when the label had to be replaced entirely by a general description (care rule 2). */
  generalized: boolean
}

export interface KindGroup {
  kind: Kind
  label: string
  exhibits: Exhibit[]
  sealed: number
  bySide: Record<Side, number>
}

export interface Day25Selection {
  groups: KindGroup[]
  /** Exhibits after removing what was not shown and repeats (calculated). */
  total: number
  /** Every exhibit-like item the reporting mentions, before that (calculated). */
  mentions: number
  /** Mentions left out: excluded by the judge, only described or referred to, or implied. */
  notShown: number
  /** Repeat mentions of the same exhibit on later days (the hotel video and identical descriptions). */
  repeats: number
  sealed: number
  bySide: Record<Side, number>
  daysWithExhibits: number
  todayIds: string[]
}

function kindOf(text: string): Kind {
  const t = text.replace(/\b(no|without) audio\b/gi, '')
  return KIND_RULES.find(([, re]) => re.test(t))?.[0] ?? 'document'
}

/** Care rule 2: no injury detail, no sexual content, no quoted message text. */
export function safeLabel(text: string, kind: Kind, sealed: boolean): { label: string; generalized: boolean } {
  if (INJURY.test(text)) return { label: 'Photographs or video of injuries (not shown or described here)', generalized: true }
  if (HIRED_PEOPLE.test(text) && (kind === 'photo' || kind === 'video')) {
    return { label: 'Images of people hired for encounters (not shown here)', generalized: true }
  }
  if (SEXUAL.test(text)) {
    if (sealed || kind === 'video' || kind === 'photo') return { label: 'Sealed or private recordings and images (not shown or described here)', generalized: true }
    return { label: `${KIND_LABEL[kind]} of a sexual nature (not shown or described here)`, generalized: true }
  }
  // Names of third parties are removed by redact(); other quoted words are shown as reported (a voicemail's
  // nickname is dropped).
  return { label: redact(text).replace(/'Crack Pipe' /, '').replace(/\s*\(defense, per NBC blog; date inferred\)/, ' (defense, per NBC)'), generalized: false }
}

export function classify(day: TrialDay, text: string, i: number): Exhibit {
  const kind = kindOf(text)
  const sealed = SEALED.test(text)
  const side: Side = DEFENSE.test(text) ? 'defense' : PROSECUTION.test(text) ? 'prosecution' : 'unstated'
  const { label, generalized } = safeLabel(text, kind, sealed)
  return { id: `d${day.day}-${i}`, day: day.day, kind, sealed, side, label, generalized }
}

const SIDES: Side[] = ['prosecution', 'defense', 'unstated']
const countSides = (list: Exhibit[]) =>
  Object.fromEntries(SIDES.map((s) => [s, list.filter((e) => e.side === s).length])) as Record<Side, number>

export function selectDay25(today: TrialDay): Day25Selection {
  const days = getDays().map((d) => (d.day === today.day ? today : d))
  const raw = days.flatMap((d) => d.exhibits.map((t, i) => ({ t, e: classify(d, t, i) })))
  const shown = raw.filter((x) => !NOT_SHOWN.test(x.t))
  const seen = new Set<string>()
  const all = shown
    .filter((x) => {
      const key = HOTEL_VIDEO.test(x.t) ? 'hotel-video' : x.e.label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((x) => x.e)
  const groups: KindGroup[] = (Object.keys(KIND_LABEL) as Kind[])
    .map((kind) => {
      const exhibits = all.filter((e) => e.kind === kind)
      return { kind, label: KIND_LABEL[kind], exhibits, sealed: exhibits.filter((e) => e.sealed).length, bySide: countSides(exhibits) }
    })
    .filter((g) => g.exhibits.length > 0)
    .sort((a, b) => b.exhibits.length - a.exhibits.length)
  return {
    groups,
    total: all.length,
    mentions: raw.length,
    notShown: raw.length - shown.length,
    repeats: shown.length - all.length,
    sealed: all.filter((e) => e.sealed).length,
    bySide: countSides(all),
    daysWithExhibits: days.filter((d) => d.exhibits.length > 0).length,
    todayIds: all.filter((e) => e.day === today.day).map((e) => e.id),
  }
}
