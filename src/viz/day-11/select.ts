// Day 11: the investigation of the January 2012 car fire, step by step, with what the testimony says
// happened at each step and what did not. A step's status comes from the record's own words
// ("not collected", "not DNA-tested", "could not reach", "no charges").
import { getDay, type ReportedNumber, type TrialDay } from '@/lib/data'
import additionsJson from './additions.json'
import {
  D, withDay, additionById, buildSourceBook, factFromAddition, factFromNumber, findNumber, mergeFacts, textFact,
  type AdditionsFile, type DayReader, type Fact, type SourceBook,
} from '../day-08/kit/facts'

export type Status = 'done' | 'not-done'
export interface Evidence { said: string; who: string; fact: Fact }
export interface Step { id: string; title: string; status: Status; summary: string; evidence: Evidence[] }
export interface CourtNote { stepId: string; text: string; fact: Fact }
export interface Day11Model { steps: Step[]; court: CourtNote[]; stoppedAfter: number; book: SourceBook; used: ReportedNumber[] }

export function select(day: TrialDay, read0: DayReader = getDay, additions: AdditionsFile = additionsJson as AdditionsFile): Day11Model {
  const read = withDay(day, read0)
  const used: ReportedNumber[] = []
  const num = (n: number, key: string, what: RegExp) => {
    const hit = findNumber(read, n, what)
    if (hit && n === day.day) used.push(hit.num)
    return factFromNumber(key, hit)
  }
  const d9 = D('Day 9'), d10 = D('Day 10'), d11 = D('Day 11')
  const jimenezText = read(d11).key_points.find((k) => /Jimenez/.test(k)) ?? ''
  const jim = (key: string, said: string) => textFact(read, d11, key, 'key_points', /Jimenez/, /^(NBC|Fox News)$/, 'high', said)
  const says = (re: RegExp) => re.test(jimenezText)

  const call = factFromAddition(additionById(additions, 'police-call'))
  const cudiReport = textFact(read, d9, 'cudi-report', 'key_points', /reported to police/i, /^(CBS|AP|Fox News)/, 'high', 'Kid Cudi testified he reported the entry into his home to police.')
  const ignacio = textFact(read, d11, 'ignacio', 'key_points', /not reported as a burglary/i, /^NBC/, 'low', 'The LAPD officer who responded testified the incident was not reported as a burglary.')
  const found = num(d11, 'found', /Engine company found the Porsche/i)
  const fireMonth = num(d9, 'fire-month', /Porsche set on fire/i)
  const clarkNoContact = textFact(read, d10, 'clark-no-contact', 'key_points', /did not speak to fire investigators/i, /^(Fox News|NBC News)$/, 'medium', 'Clark testified she did not speak to fire investigators at the time.')

  const ev = (who: string, said: string, fact: Fact | null): Evidence | null => (fact ? { who, said, fact: { ...fact, text: said } } : null)
  const ok = (xs: Array<Evidence | null>) => xs.filter((x): x is Evidence => !!x)

  const steps: Step[] = [
    {
      id: 'report', title: 'Report to police', status: cudiReport || call ? 'done' : 'not-done', summary: 'The entry into the home was reported.',
      evidence: ok([ev('Kid Cudi, Day 9', 'He reported the entry into his home to police.', cudiReport), ev('Global News', 'The call to police was made the same month.', call)]),
    },
    {
      id: 'response', title: 'Police response', status: ignacio ? 'done' : 'not-done', summary: 'An officer responded; it was not logged as a burglary.',
      evidence: ok([ev('Officer Christopher Ignacio, Day 11', 'He responded to the report; the incident was not reported as a burglary.', ignacio)]),
    },
    {
      id: 'scene', title: 'Fire scene examined', status: found || says(/fire was targeted/i) ? 'done' : 'not-done', summary: 'The fire was found and judged deliberate.',
      evidence: ok([
        ev('Kid Cudi, Day 9', 'His car was set on fire at his home about a month after the entry.', fireMonth),
        ev('Fire department record', 'An engine company found the car with a cut in its canvas top.', found),
        ev('Arson investigator Lance Jimenez, Day 11', 'The fire was targeted, and the car\'s canvas top had been cut.', says(/fire was targeted/i) ? jim('jim-targeted', '') : null),
      ]),
    },
    {
      id: 'collected', title: 'Evidence collected', status: says(/not collected/i) ? 'not-done' : 'done', summary: 'A driving glove on the back seat was not collected.',
      evidence: ok([ev('Arson investigator Lance Jimenez, Day 11', 'A driving glove on the back seat was not collected.', says(/not collected/i) ? jim('jim-glove', '') : null)]),
    },
    {
      id: 'tested', title: 'Lab tests', status: says(/DNA-tested/i) ? 'not-done' : 'done', summary: 'The glove was not DNA-tested.',
      evidence: ok([ev('Arson investigator Lance Jimenez, Day 11', 'The glove was not DNA-tested.', says(/DNA-tested/i) ? jim('jim-dna', '') : null)]),
    },
    {
      id: 'witnesses', title: 'Witnesses reached', status: says(/could not reach/i) ? 'not-done' : 'done', summary: 'Clark and Ventura were not reached.',
      evidence: ok([
        ev('Arson investigator Lance Jimenez, Day 11', 'He could not reach Capricorn Clark or Cassie Ventura.', says(/could not reach/i) ? jim('jim-reach', '') : null),
        ev('Capricorn Clark, Day 10', 'She did not speak to fire investigators at the time.', clarkNoContact),
      ]),
    },
    {
      id: 'charges', title: 'Charges', status: says(/no charges/i) ? 'not-done' : 'done', summary: 'No one was charged; the case went inactive.',
      evidence: ok([ev('Arson investigator Lance Jimenez, Day 11', 'No one was charged, and the case went inactive.', says(/no charges/i) ? jim('jim-charges', '') : null)]),
    },
  ]

  const legal = (n: number, re: RegExp) => read(n).legal_events.find((e) => re.test(e))
  const mistrial = mergeFacts('mistrial', 'Mistrial motion denied', [
    factFromAddition(additionById(additions, 'mistrial-denied')),
    legal(d11, /mistrial/i) ? num(D('Day 20'), 'mistrial-later', /first\) mistrial request/i) : null,
  ])
  const struck = legal(d11, /struck the arson investigator's fingerprint testimony/i)
    ? textFact(read, d11, 'struck', 'legal_events', /fingerprint testimony/i, /^NBC/, 'low', '')
    : null
  const disregard = legal(d9, /jury told to disregard/i)
    ? textFact(read, d9, 'disregard', 'legal_events', /jury told to disregard/i, /^(Fox News|CBS|AP)/, 'medium', '')
    : null
  const court: CourtNote[] = [
    struck ? { stepId: 'tested', text: "The arson investigator's testimony about fingerprints was struck; jurors were told to disregard it.", fact: struck } : null,
    mistrial ? { stepId: 'tested', text: 'The defense moved for a mistrial over that testimony; the judge denied it.', fact: mistrial } : null,
    disregard ? { stepId: 'charges', text: "Kid Cudi's belief about who set the fire was struck on Day 9; jurors were told to disregard it.", fact: disregard } : null,
  ].filter((c): c is CourtNote => !!c)

  const firstMissing = steps.findIndex((s) => s.status === 'not-done')
  const facts = [...steps.flatMap((s) => s.evidence.map((e) => e.fact)), ...court.map((c) => c.fact)]
  return { steps, court, stoppedAfter: firstMissing < 0 ? steps.length : firstMissing, book: buildSourceBook(day, facts), used }
}
