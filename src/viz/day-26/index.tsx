// Day 26: Who Did What: The Staff Around Combs, as Witnesses Described. A grid of former employees and tasks,
// who directed them; every link carries the record text that put it there. Phones get a person-by-task grid.
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { NumbersTable } from '@/components/shell/NumbersTable'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { crossDayExtras, dayLink, RowList, XRef } from '@/viz/kits/days-22-28/kit'
import { HiveInteractive, type MatrixData } from './Interactive'
import { meta } from './meta'
import { selectDay26, TASKS, type Day26Selection, type Link } from './select'
import styles from './day26.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

const SHORT: Record<string, string> = {
  hotels: 'Hotels',
  stock: 'Stock rooms',
  drugs: 'Drugs',
  clean: 'Clean rooms',
  travel: 'Travel',
  cash: 'Cash',
  schedule: 'On call',
}

function nameOf(sel: Day26Selection, id: string): string {
  return (
    sel.people.find((p) => p.id === id)?.label ??
    sel.tasks.find((t) => t.id === id)?.label ??
    sel.directors.find((d) => d.id === id)?.label ??
    id
  )
}

function LinkItem({ sel, l, focus }: { sel: Day26Selection; l: Link; focus: string }) {
  const other = l.from === focus ? l.to : l.from
  const verb = l.kind === 'did' ? (l.from === focus ? 'did' : 'done by') : l.from === focus ? 'directed' : 'directed by'
  return (
    <li>
      <strong>{verb}: {nameOf(sel, other)}.</strong> &ldquo;{l.evidence}&rdquo; <a href={dayLink(l.day)}>Day {l.day}</a>{' '}
      <XRef ids={l.sources.map((s) => s.id)} /> <ConfidenceMark level={l.confidence} />
    </li>
  )
}

function Detail({ sel, id }: { sel: Day26Selection; id: string }) {
  const links = sel.links.filter((l) => l.from === id || l.to === id)
  const un = sel.unlinked.find((u) => u.id === id)
  return (
    <div>
      <h3 className={styles.detailHead}>{nameOf(sel, id)}</h3>
      {links.length > 0 ? <ul className={styles.list}>{links.map((l) => <LinkItem key={l.key} sel={sel} l={l} focus={id} />)}</ul> : null}
      {un && un.evidence ? (
        <p>
          No task from this list in the reporting. {un.day ? <>Day {un.day}: </> : null}&ldquo;{un.evidence}&rdquo;{' '}
          {un.sources.length ? <XRef ids={un.sources.map((s) => s.id)} /> : null}
        </p>
      ) : null}
      {links.length === 0 && !un ? <p>No link in the reporting.</p> : null}
    </div>
  )
}

function allIds(sel: Day26Selection): string[] {
  return [...sel.links.flatMap((l) => l.sources.map((s) => s.id)), ...sel.unlinked.flatMap((u) => u.sources.map((s) => s.id))]
}

function matrixData(sel: Day26Selection): MatrixData {
  return {
    columns: TASKS.map((t) => ({ id: t.id, short: SHORT[t.id], label: t.label })),
    rows: [
      ...sel.people.map((p) => ({
        id: p.id,
        label: p.label,
        cells: TASKS.map((t) => sel.links.some((l) => l.kind === 'did' && l.from === p.id && l.to === t.id)),
        directedBy: sel.links.filter((l) => l.kind === 'directed-person' && l.to === p.id).map((l) => nameOf(sel, l.from).split(' (')[0]),
      })),
      ...sel.directors.map((d) => ({
        id: d.id,
        label: d.id === 'khorram'
          ? `${d.label.split(' (')[0]}, Combs's chief of staff (not charged; did not testify): tasks asked for in texts shown in court`
          : `${d.label.split(' (')[0]}: tasks asked for, as testified`,
        cells: TASKS.map((t) => sel.links.some((l) => l.kind === 'directed-task' && l.from === d.id && l.to === t.id)),
        directedBy: [],
      })),
    ],
  }
}

export default function Day26Viz({ day }: DayVizProps) {
  const sel = selectDay26(day)
  const ids = [...sel.people.map((p) => p.id), ...sel.tasks.map((t) => t.id), ...sel.directors.map((d) => d.id)]
  const details = Object.fromEntries(ids.map((id) => [id, <Detail key={id} sel={sel} id={id} />]))
  return (
    <div className={styles.viz}>
      <ul className={styles.legend} aria-label="Key">
        <li>A dot: the person testified they did this task.</li>
        <li>&ldquo;Instructions from&rdquo;: who a witness, or a text shown in court, says asked for the work. These are accounts, not findings.</li>
      </ul>
      <HiveInteractive details={details} matrix={matrixData(sel)} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = selectDay26(day)
  const did = sel.links.filter((l) => l.kind === 'did')
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        The picture is a grid of {sel.people.length} people who worked for Combs against {sel.tasks.length} kinds of task, with the{' '}
        {sel.directors.length} people witnesses or texts name as giving instructions. A link is drawn only where the reporting holds words
        that match it, checked by hand; there are {did.length} person-to-task links and {sel.links.length - did.length} instruction links
        (counted). Each link below quotes the reported words behind it. These are testimony and evidence offered at trial, not findings:
        the jury found Combs not guilty of racketeering conspiracy. Kristina Khorram, Combs&rsquo;s chief of staff, was not charged and did
        not testify.
      </p>
      <RowList
        caption="Every link and the reported words behind it"
        columns={['From', 'Link', 'To', 'Reported words', 'How sure']}
        rows={sel.links.map((l) => ({
          key: l.key,
          sourceIds: l.sources.map((s) => s.id).join(' '),
          cells: [
            nameOf(sel, l.from),
            l.kind === 'did' ? 'testified they did' : 'gave instructions to, as testified',
            nameOf(sel, l.to),
            `“${l.evidence}” (Day ${l.day})`,
            <ConfidenceMark key="c" level={l.confidence} />,
          ],
        }))}
      />
      <ul>
        {sel.unlinked.map((u) => (
          <li key={u.id}>{u.label}: no task link. {u.evidence ? <>&ldquo;{u.evidence}&rdquo;</> : null}</li>
        ))}
      </ul>
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}

/** Other days' sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return crossDayExtras(allIds(selectDay26(day)), day)
}
