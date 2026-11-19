// Day 25: What the Jury Was Shown, by Kind of Evidence. A treemap of every exhibit named in coverage
// across the testimony days, one tile per exhibit, hatched where sealed from the public.
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { Cite } from '@/components/shell/SourceRef'
import { NumbersTable } from '@/components/shell/NumbersTable'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps } from '@/viz/types'
import { resolveSources } from '@/lib/data'
import { Calc, dayLink, RowList, XRef } from '@/viz/day-22/kit'
import { TreemapInteractive } from './Interactive'
import { meta } from './meta'
import { selectDay25, SIDE_WORDS, type Day25Selection, type KindGroup } from './select'
import { treemapGeometry } from './treemap'
import styles from './day25.module.css'

export { meta }

function GroupList({ g }: { g: KindGroup }) {
  return (
    <div>
      <h3 className={styles.listHead}>
        {g.label}: <span className="num">{g.exhibits.length}</span> <Calc formula="exhibits named in coverage, counted" />
      </h3>
      <ul className={styles.list}>
        {g.exhibits.map((e) => (
          <li key={e.id}>
            <a href={dayLink(e.day)}>Day {e.day}</a>: {e.label}
            {e.sealed ? <span className="tag">sealed</span> : null}
            {e.side !== 'unstated' ? <span className="tag">{e.side}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend() {
  return (
    <ul className={styles.legend} aria-label="Key">
      <li><span className={`${styles.sw} ${styles.swPro}`} aria-hidden="true" /> presented by the prosecution, as stated in coverage</li>
      <li><span className={`${styles.sw} ${styles.swDef}`} aria-hidden="true" /> presented by the defense, as stated</li>
      <li><span className={`${styles.sw} ${styles.swUn}`} aria-hidden="true" /> side not stated in coverage</li>
      <li><span className={`${styles.sw} ${styles.swSeal}`} aria-hidden="true" /> hatched: sealed, seen by the jury only</li>
      <li><span className={`${styles.sw} ${styles.swToday}`} aria-hidden="true" /> red outline: named on this day</li>
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
  const wide = treemapGeometry(sel, layout.chartWidth, layout.chartWidth / 2 + layout.margin.bottom)
  const narrow = treemapGeometry(sel, layout.phoneWidth - layout.gap * 2, layout.chartWidth * (2 / (2 + 1)))
  return (
    <div className={styles.viz}>
      <p className={styles.summary}>
        <span className={styles.big}>{sel.total}</span> exhibits named in coverage over {sel.daysWithExhibits} days{' '}
        <Calc formula="every exhibit listed in the day records, counted" />; <span className={styles.big}>{sel.sealed}</span> sealed from
        the public <Calc formula="exhibits whose description says sealed, jury only or not public" />.
      </p>
      <TreemapInteractive wide={wide} narrow={narrow} lists={wide.groups.map((g) => <GroupList key={g.kind} g={sel.groups.find((x) => x.kind === g.kind) as KindGroup} />)} legend={<Legend />} />
      <DayFigures n={n} day={day} />
    </div>
  )
}

function CountsTable({ sel }: { sel: Day25Selection }) {
  return (
    <RowList
      caption="Exhibits named in coverage, by kind (all calculated by counting)"
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
        The day records name {sel.total} exhibits across {sel.daysWithExhibits} testimony days. Each is sorted into a kind by the words its
        description uses (for example &ldquo;audio&rdquo;, &ldquo;photo&rdquo;, &ldquo;bank&rdquo;); {sel.sealed} are described as sealed
        or shown to the jury only. Coverage names the side that presented an exhibit for only {sel.total - sel.bySide.unstated} of them
        ({sel.bySide.defense} defense, {sel.bySide.prosecution} prosecution); most of the rest came during the prosecution&apos;s case, but
        the records do not say so item by item, so they are shown as &ldquo;side not stated&rdquo;. Descriptions of injuries, sexual
        material and quoted messages are replaced with plain words. All counts here are calculated by counting the records.
      </p>
      <CountsTable sel={sel} />
      {sel.groups.map((g) => (
        <GroupList key={g.kind} g={g} />
      ))}
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}
