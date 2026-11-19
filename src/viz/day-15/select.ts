// Day 15: pick exactly the figures the money-flow picture needs, by what they are (never by position).
import { redactThirdParties, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { formatUSD, toNumber } from '@/lib/viz/format'
import additionsFile from './additions.json'
import { additionSources, findAddition, lowest, numSources, type AdditionsFile, type Level } from '@/viz/kits/days-15-21/sources'

const additions = additionsFile as AdditionsFile
export const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

export type NodeId = 'cash' | 'garcia' | 'rest' | 'supervisor' | 'officer' | 'nda'

export interface FlowNode {
  id: NodeId
  name: string
  amount: number | null
  level: Level
  sources: Source[]
  /** The witness's account, as the day file paraphrases it. */
  words: string[]
  /** Formula, when the amount is calculated by the app. */
  formula?: string
  note?: string
  /** Shown when the viewer asks for two-outlet figures only. */
  confirmed: boolean
}

export interface Day15Selection {
  nodes: FlowNode[]
  /** Amount flows between nodes (source -> target, value in dollars). */
  links: Array<{ source: NodeId; target: NodeId; value: number; level: Level; confirmed: boolean }>
  /** The non-money link: Garcia -> the NDA he signed. */
  hasNda: boolean
  ndaPenalty: ReportedNumber | null
  wage: ReportedNumber | null
  /** Hours of his pay that his share equals (calculated). */
  payHours: { hours: number; level: Level; formula: string } | null
  incidentDate: ReportedNumber | null
  /** How the deal came together, in the order the day file gives it. */
  steps: string[]
  used: ReportedNumber[]
  other: ReportedNumber[]
  pool: Source[]
  extraSources: Source[]
}

const sentences = (day: TrialDay) =>
  day.key_points
    .filter((k) => /^Garcia/.test(k))
    .flatMap((k) => k.replace(/^Garcia( cross \([^)]*\))?:\s*/, '').split(/;\s+|(?<=\.)\s+(?=[A-Z])/))
    .map((s) => redactThirdParties(s.trim().replace(/\.$/, '')))
    .filter(Boolean)

const pick = (list: string[], re: RegExp) => list.filter((s) => re.test(s))

export function select(day: TrialDay): Day15Selection {
  const pool = day.sources
  const find = (re: RegExp) => day.numbers.find((n) => re.test(n.what))
  const cash = day.numbers.find((n) => /cash .*paid .*video|counted in/i.test(n.what) && toNumber(n.value) !== null) ?? null
  const share = find(/kept\b/i) ?? null
  const firstPrice = find(/initial price/i) ?? null
  const nda = find(/penalty .*NDA|NDA/i) ?? null
  const wage = find(/hourly pay/i) ?? null
  const incidentDate = day.numbers.find((n) => n.unit === 'date' && /InterContinental/i.test(n.what)) ?? null
  const said = sentences(day)

  const nodes: FlowNode[] = []
  const links: Day15Selection['links'] = []
  const used: ReportedNumber[] = []
  const extraSources: Source[] = []

  const cashAmount = cash ? toNumber(cash.value) : null
  if (cash && cashAmount !== null) {
    used.push(cash)
    nodes.push({
      id: 'cash', name: 'Cash for the video', amount: cashAmount, level: cash.confidence, sources: numSources(cash, pool),
      words: pick(said, /paper bag|money counter|stacks|only copy/i), confirmed: cash.confidence === 'high',
    })
  }
  const shareAmount = share ? toNumber(share.value) : null
  if (cash && cashAmount !== null && share && shareAmount !== null) {
    used.push(share)
    nodes.push({
      id: 'garcia', name: 'Garcia, the security supervisor', amount: shareAmount, level: share.confidence, sources: numSources(share, pool),
      words: pick(said, /used car|large purchases/i), confirmed: share.confidence === 'high',
    })
    links.push({ source: 'cash', target: 'garcia', value: shareAmount, level: lowest(cash.confidence, share.confidence), confirmed: share.confidence === 'high' })

    const rest = cashAmount - shareAmount
    if (rest > 0) {
      const restLevel = lowest(cash.confidence, share.confidence)
      nodes.push({
        id: 'rest', name: 'The rest of the cash', amount: rest, level: restLevel,
        sources: [...numSources(cash, pool), ...numSources(share, pool)],
        words: firstPrice ? [redactThirdParties(firstPrice.what)] : [],
        formula: `${formatUSD(cashAmount)} minus ${formatUSD(shareAmount)}`,
        note: 'Who received the rest is reported by one outlet, and outlets frame it differently.',
        confirmed: restLevel === 'high',
      })
      links.push({ source: 'cash', target: 'rest', value: rest, level: restLevel, confirmed: restLevel === 'high' })
      if (firstPrice) used.push(firstPrice)

      // CNN's split of the rest (additions.json). Drawn only if it adds up to the rest.
      const sup = findAddition(additions, 'split-supervisor')
      const off = findAddition(additions, 'split-officer')
      const supAmount = sup?.value !== undefined ? toNumber(sup.value) : null
      const offAmount = off?.value !== undefined ? toNumber(off.value) : null
      if (sup && off && supAmount !== null && offAmount !== null && supAmount + offAmount === rest) {
        const supSources = additionSources(sup, pool)
        const offSources = additionSources(off, pool)
        extraSources.push(...supSources, ...offSources)
        const supLevel: Level = firstPrice ? 'conflict' : sup.confidence
        nodes.push({ id: 'supervisor', name: 'His supervisor', amount: supAmount, level: supLevel, sources: supSources, words: [sup.text], confirmed: false })
        nodes.push({ id: 'officer', name: 'Another security officer', amount: offAmount, level: off.confidence, sources: offSources, words: [off.text], confirmed: false })
        links.push({ source: 'rest', target: 'supervisor', value: supAmount, level: supLevel, confirmed: false })
        links.push({ source: 'rest', target: 'officer', value: offAmount, level: off.confidence, confirmed: false })
      }
    }
  }

  if (nda && nodes.some((n) => n.id === 'garcia')) {
    used.push(nda)
    nodes.push({
      id: 'nda', name: 'The NDA he signed', amount: toNumber(nda.value), level: nda.confidence, sources: numSources(nda, pool),
      words: pick(said, /NDA|notice/i), note: 'Not money paid: the penalty the agreement set for breaking it.', confirmed: nda.confidence === 'high',
    })
  }

  let payHours: Day15Selection['payHours'] = null
  const wageAmount = wage ? toNumber(wage.value) : null
  if (wage && wageAmount && shareAmount !== null && share) {
    used.push(wage)
    payHours = { hours: shareAmount / wageAmount, level: lowest(share.confidence, wage.confidence), formula: `${formatUSD(shareAmount)} divided by ${usdCents.format(wageAmount)} an hour` }
  }
  if (incidentDate) used.push(incidentDate)

  const rank: NodeId[] = ['cash', 'garcia', 'rest', 'nda', 'supervisor', 'officer']
  nodes.sort((a, b) => rank.indexOf(a.id) - rank.indexOf(b.id))
  return {
    nodes,
    links,
    hasNda: nodes.some((n) => n.id === 'nda'),
    ndaPenalty: nda,
    wage,
    payHours,
    incidentDate,
    steps: pick(said, /chief of staff|called|FaceTime|subpoena|wanted the video gone/i),
    used,
    other: day.numbers.filter((n) => !used.includes(n)),
    pool,
    extraSources,
  }
}
