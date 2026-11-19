// Day 4: the messages the defense showed Ventura on cross-examination, each with both readings.
// Messages are paraphrased here (care rule 2); the record's own words are used only to find and date them.
import { getDays, type TrialDay } from '@/lib/data'
import { buildIndex, clause, findFact, findNumber, numberRefs, uniqueRefs, yearsIn, type Fact, type Level, type Ref, type RefIndex } from '@/viz/kits/days-01-07/refs'

export interface Reading {
  text: string
  level: Level
  refs: Ref[]
}

export interface Message {
  id: string
  /** First and last year (the same for a single dated message). */
  from: number
  to: number
  paraphrase: string
  defense: Reading
  ventura: Reading | null
  /** Later days on which this message, or messages like it, came back. */
  again: Array<{ day: number; text: string; level: Level; refs: Ref[] }>
}

export interface Day04Selection {
  messages: Message[]
  agreed: { value: string; level: Level; refs: Ref[] } | null
  occasions: { value: string; level: Level; refs: Ref[] } | null
  deadline: { value: string; level: Level; refs: Ref[] } | null
  index: RefIndex
}

function reading(f: Fact, text: string): Reading {
  return { text, level: f.confidence, refs: f.refs }
}

export function select(day: TrialDay): Day04Selection {
  const shown = findFact(day, /^Defense showed/i)
  const agreedFact = findFact(day, /^Agreed she and Combs were in love/i)
  const exhibit = findFact(day, /side piece/i, { within: day.exhibits })
  const early = findNumber(day, /early texts/i)
  const messages: Message[] = []

  const answerJustWords = shown && /just words/i.test(shown.text) ? reading(shown, 'She said those words were “just words at that point.”') : null
  const answerLove = agreedFact ? reading(agreedFact, `She agreed they were in love for ${agreedFact.text.match(/about (\d+) years/)?.[1] ?? 'many'} years and that she believed he loved her.`) : null

  if (early) {
    const ys = yearsIn(early.value)
    if (ys.length > 0)
      messages.push({
        id: 'early',
        from: ys[0],
        to: ys[ys.length - 1],
        paraphrase: 'Emails and texts in which she expressed affection for him.',
        defense: { text: 'Shown on cross-examination as messages of affection, in line with the defense’s opening: a story of love and jealousy.', level: early.confidence, refs: numberRefs(day, early) },
        ventura: answerLove,
        again: [],
      })
  }
  if (shown) {
    const willing = clause(shown.text, /always ready/i)
    const wy = willing ? yearsIn(willing) : []
    if (wy.length > 0)
      messages.push({
        id: 'willing',
        from: wy[0],
        to: wy[0],
        paraphrase: 'A text in which she said she was willing to take part in the encounters.',
        defense: reading(shown, 'Shown as her own words, to suggest she wanted to take part.'),
        // Her "just words" answer was given about the March 2017 message (CNN via Yahoo), not this one.
        ventura: null,
        again: [],
      })
  }
  if (exhibit) {
    const m = exhibit.text.match(/(\d{4})\s*\('side piece'\)/i)
    if (m)
      messages.push({
        id: 'side',
        from: Number(m[1]),
        to: Number(m[1]),
        paraphrase: 'A message in which she told him he was treating her as less than a partner (“a side piece”), which she said was not what she thought she was.',
        defense: reading(exhibit, 'Introduced by the defense among its exhibits.'),
        ventura: null,
        again: [],
      })
  }
  if (shown) {
    const later = clause(shown.text, /when both wanted/i)
    const ly = later ? yearsIn(later) : []
    if (ly.length > 0) {
      const again: Message['again'] = []
      for (const d of getDays().filter((x) => x.day > day.day)) {
        const f = findFact(d, /defense entered .*text from Ventura|read in text messages from Cassie Ventura/i)
        if (f) again.push({ day: d.day, text: /entered/i.test(f.text) ? 'The defense entered this text again.' : 'The defense read her messages to the jury again, as most of its short case.', level: f.confidence, refs: f.refs })
      }
      messages.push({
        id: 'both',
        from: ly[0],
        to: ly[0],
        paraphrase: 'A message saying she enjoyed the encounters when they both wanted them.',
        defense: reading(shown, 'Shown as evidence that what happened was mutual.'),
        ventura: answerJustWords,
        again,
      })
    }
  }
  messages.sort((a, b) => a.from - b.from)

  const pick = (re: RegExp) => {
    const n = findNumber(day, re)
    return n ? { value: String(n.value), level: n.confidence, refs: numberRefs(day, n) } : null
  }
  const agreed = pick(/relationship length agreed/i)
  const occasions = pick(/saw Combs with other women/i)
  const deadline = pick(/deadline/i)
  const all = uniqueRefs([
    ...messages.flatMap((m) => [...m.defense.refs, ...(m.ventura?.refs ?? []), ...m.again.flatMap((a) => a.refs)]),
    ...[agreed, occasions, deadline].flatMap((x) => x?.refs ?? []),
    ...day.numbers.flatMap((n) => numberRefs(day, n)),
  ])
  return { messages, agreed, occasions, deadline, index: buildIndex(day.sources, all) }
}
