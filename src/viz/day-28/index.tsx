// Day 28: 34 Witnesses for the Prosecution, None for the Defense. A witness constellation from the shared
// witness table, beside the defense's empty sky. The same stars open the verdict page.
import { Cite } from '@/components/shell/SourceRef'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { NumbersTable } from '@/components/shell/NumbersTable'
import { resolveSources } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps } from '@/viz/types'
import { Calc, dayLink, RowList, XRef } from '@/viz/kits/days-22-28/kit'
import { SkyInteractive } from './Interactive'
import { meta } from './meta'
import { EVENTS, GROUP_LABEL, GROUPS, selectDay28, type Day28Selection, type Star } from './select'
import { skyGeometry } from './sky'
import styles from './day28.module.css'

export { meta }

function Card({ s, sel }: { s: Star; sel: Day28Selection }) {
  return (
    <div>
      <h3 className={styles.cardHead}>
        {s.w.display_name}
        {s.w.pseudonym ? <span className="muted"> (pseudonym)</span> : null}
      </h3>
      <p>
        {GROUP_LABEL[s.w.group]}. {s.w.pseudonym ? null : <>{s.role}. </>}Witness {s.order} of {sel.total}; on the stand on{' '}
        {s.w.days.map((d, i) => (
          <span key={d}>
            {i > 0 ? ', ' : ''}
            <a href={dayLink(d)}>Day {d}</a>
          </span>
        ))}
        .{s.w.immunity ? ' Testified under an immunity order.' : ''}
      </p>
      {s.events.length > 0 ? (
        <p className={styles.events}>Linked by: {s.events.map((e) => EVENTS.find((x) => x.id === e)?.label).join('; ')}.</p>
      ) : null}
    </div>
  )
}

function Defense({ sel, day }: { sel: Day28Selection; day: DayVizProps['day'] }) {
  return (
    <div className={styles.defenseInner}>
      <p className={styles.sideHead}>Defense</p>
      <p className={styles.none}>No witnesses</p>
      {sel.defenseLength ? (
        <p className={styles.defLine}>
          <Cite num={sel.defenseLength} pool={day.sources} /> reading exhibits into the record.
        </p>
      ) : null}
      {sel.declined ? (
        <p className={styles.defLine}>
          Combs chose not to testify, as is his right. <XRef ids={sel.declinedSources.map((s) => s.id)} />
        </p>
      ) : null}
    </div>
  )
}

export default function Day28Viz({ day }: DayVizProps) {
  const sel = selectDay28(day)
  const wide = skyGeometry(sel, layout.chartWidth * (2 / (2 + 1)), false)
  const narrow = skyGeometry(sel, layout.phoneWidth - layout.gap * 2, true)
  const groups = GROUPS.map((g) => ({ id: g, label: GROUP_LABEL[g], count: sel.stars.filter((s) => s.w.group === g).length })).filter((g) => g.count > 0)
  const matches = sel.totalNum ? Number(sel.totalNum.value) === sel.total : false
  return (
    <div className={styles.viz}>
      <p className={styles.count}>
        <span className={styles.big} data-source-ids={sel.totalNum ? resolveSources(sel.totalNum, day.sources).map((s) => s.id).join(' ') : undefined}>
          {sel.total}
        </span>{' '}
        witnesses for the prosecution <Calc formula="rows in the shared witness table" />
        {sel.totalNum ? (
          <>
            {' '}
            ({matches ? 'matches the reported count' : 'reported count'}: <Cite num={sel.totalNum} pool={day.sources} />)
          </>
        ) : null}
        ; <span className={styles.big}>0</span> for the defense.
      </p>
      <ul className={styles.legend} aria-label="Key">
        <li>Each star is one witness, placed at the day they first testified and in the band for their role.</li>
        <li>Bigger stars spent more days on the stand. Faint lines join witnesses whose testimony, as reported, mentions the same event: {EVENTS.map((e) => e.label).join('; ')}.</li>
      </ul>
      <SkyInteractive
        wide={wide}
        narrow={narrow}
        groups={groups}
        cards={sel.stars.map((s) => <Card key={s.w.id} s={s} sel={sel} />)}
        defense={<Defense sel={sel} day={day} />}
      />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = selectDay28(day)
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        The shared witness table lists {sel.total} prosecution witnesses (calculated by counting its rows). The defense called no
        witnesses. {sel.defenseRead} {sel.rule29 ? sel.rule29 : ''} Faint lines in the picture join witnesses whose reported testimony mentions the same
        event; the rules match words in each witness&apos;s own record.
      </p>
      <p>
        <ConfidenceMark level={sel.confidence} /> How sure: the counts of witnesses and the defense resting are reported by several
        outlets; the clock times come from one live blog.
      </p>
      <RowList
        caption="Every witness, in the order they first testified"
        columns={['Order', 'Witness', 'Role', 'Days on the stand', 'Immunity']}
        rows={sel.stars.map((s) => ({
          key: s.w.id,
          cells: [
            String(s.order),
            `${s.w.display_name}${s.w.pseudonym ? ' (pseudonym)' : ''}`,
            `${GROUP_LABEL[s.w.group]}${s.w.pseudonym ? '' : `: ${s.role}`}`,
            s.w.days.map((d) => `Day ${d}`).join(', '),
            s.w.immunity ? 'yes' : 'no',
          ],
        }))}
      />
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}
