// Day 25: What the News Said the Jury Was Shown. One bar per kind of evidence, counting the exhibits news coverage
// names across the testimony days (after removing what was excluded, only described, or a repeat), hatched where sealed.
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { Cite } from '@/components/shell/SourceRef'
import { NumbersTable } from '@/components/shell/NumbersTable'
import type { DayVizProps } from '@/viz/types'
import { resolveSources } from '@/lib/data'
import { Calc, dayLink, RowList, XRef } from '@/viz/kits/days-22-28/kit'
import { BarsInteractive, type BarRow } from './Interactive'
import { meta } from './meta'
import { selectDay25, SIDE_WORDS, type Day25Selection, type KindGroup } from './select'
import styles from './day25.module.css'

export { meta }

function GroupList({ g }: { g: KindGroup }) {
  return (
    <div>
      <h3 className={styles.listHead}>
        {g.label}: <span className="num">{g.exhibits.length}</span> <Calc formula="exhibits named in news coverage, counted once each" />
      </h3>
      <ul className={styles.list}>
        {g.exhibits.map((e) => (
          <li key={e.id}>
            <a href={dayLink(e.day)}>Day {e.day}</a>: {e.label}
            {e.sealed ? <span className="tag">sealed</span> : null}
            {e.side !== 'unstated' ? <span className="tag">shown by the {e.side}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend() {
  return (
    <ul className={styles.legend} aria-label="Key">
      <li><span className={`${styles.sw} ${styles.swUn}`} aria-hidden="true" style={{ background: 'var(--ink)' }} /> exhibits of that kind</li>
      <li><span className={`${styles.sw} ${styles.swSeal}`} aria-hidden="true" /> hatched part: sealed, seen by the jury only</li>
    </ul>
  )
}

function DayFigures({ day }: DayVizProps) {
  const pick = (re: RegExp) => day.numbers.find((n) => re.test(n.what))
  const damageGma = pick(/damage to combs' room/i)
  const damageNbc = pick(/penthouse damage/i)
  const card = pick(/monthly credit-card bill/i)
  const tickets = pick(/airline tickets/i)
  const sealedKey = day.key_points.find((k) => /headphones/i.test(k))
  return (
    <div className={styles.dayFigs}>
      <h3 className={styles.listHead}>Records the summary witness walked through on this day</h3>
      <ul className={styles.list}>
        {card ? <li>A monthly credit-card bill of <Cite num={card} pool={day.sources} />, paid through company-controlled accounts.</li> : null}
        {damageGma && damageNbc ? (
          <li>
            Hotel damage in Times Square: <Cite num={damageGma} pool={day.sources} /> (one outlet) and a charge of{' '}
            <Cite num={damageNbc} pool={day.sources} /> (another outlet). The two figures are consistent but not the same measure.
          </li>
        ) : null}
        {tickets ? (
          <li>
            Airline tickets in{' '}
            <XRef ids={resolveSources(tickets, day.sources).map((s) => s.id)}>
              <span className="num">{String(tickets.value)}</span>
            </XRef>{' '}
            <ConfidenceMark level={tickets.confidence} /> for Ventura and a sex worker, paid through a business account.
          </li>
        ) : null}
        {sealedKey ? <li>Jurors watched sealed recordings on headphones; the public and press could not see them. <ConfidenceMark level="high" /></li> : null}
      </ul>
    </div>
  )
}

export default function Day25Viz({ n, day }: DayVizProps) {
  const sel = selectDay25(day)
  const rows: BarRow[] = sel.groups.map((g) => ({
    kind: g.kind, label: g.label, count: g.exhibits.length, sealed: g.sealed, today: g.exhibits.filter((e) => sel.todayIds.includes(e.id)).length,
  }))
  return (
    <div className={styles.viz}>
      <p className={styles.summary}>
        <span className={styles.big}>{sel.total}</span> exhibits named in news coverage over {sel.daysWithExhibits} days{' '}
        <Calc formula={`${sel.mentions} mentions, less ${sel.notShown} the judge excluded or that were only described, and ${sel.repeats} repeats of the same exhibit`} />;{' '}
        <span className={styles.big}>{sel.sealed}</span> sealed from the public <Calc formula="exhibits whose description says sealed, jury only or not public" />.
        This is what the reporting mentions, not the court&rsquo;s exhibit list.
      </p>
      <BarsInteractive rows={rows} lists={sel.groups.map((g) => <GroupList key={g.kind} g={g} />)} legend={<Legend />} dayLabel={`Day ${day.day}`} />
      <DayFigures n={n} day={day} />
    </div>
  )
}

function CountsTable({ sel }: { sel: Day25Selection }) {
  return (
    <RowList
      caption="Exhibits named in news coverage, by kind (all calculated by counting)"
      columns={['Kind', 'Exhibits', 'Sealed', SIDE_WORDS.prosecution, SIDE_WORDS.defense, SIDE_WORDS.unstated]}
      rows={sel.groups.map((g) => ({
        key: g.kind,
        cells: [g.label, String(g.exhibits.length), String(g.sealed), String(g.bySide.prosecution), String(g.bySide.defense), String(g.bySide.unstated)],
      }))}
    />
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = selectDay25(day)
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        News coverage of the {sel.daysWithExhibits} testimony days mentions {sel.mentions} exhibits or pieces of evidence. This page leaves out{' '}
        {sel.notShown} that the judge excluded or that were only described or referred to, and counts the same exhibit once even when it came up on
        several days ({sel.repeats} repeats, most of them the hotel video). That leaves {sel.total}, each sorted into a kind by the words its
        description uses (for example &ldquo;audio&rdquo;, &ldquo;photo&rdquo;, &ldquo;bank&rdquo;); {sel.sealed} are described as sealed or shown
        to the jury only. This is what the reporting mentions, not the court&rsquo;s official exhibit list. Coverage names the side that presented
        an exhibit for only {sel.total - sel.bySide.unstated} of them ({sel.bySide.defense} defense, {sel.bySide.prosecution} prosecution).
        Descriptions of injuries and sexual material are replaced with plain words. All counts here are calculated by counting.
      </p>
      <CountsTable sel={sel} />
      {sel.groups.map((g) => (
        <GroupList key={g.kind} g={g} />
      ))}
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}
