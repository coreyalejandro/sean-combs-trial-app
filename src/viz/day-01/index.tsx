// Day 1: Two Opening Statements, One Set of Charges. An aligned claim diff.
// Server component: everything is in the static HTML. Selecting a topic uses native <details>
// (works without JavaScript); CSS :has() highlights the chosen row and quiets the others.
import { scaleLinear } from 'd3'
import { formatDate, redactThirdParties, type ReportedNumber } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { RowsTable, Sourced, type TableRow } from '@/viz/kits/days-01-07/Parts'
import { numberRefs, toExtraSources } from '@/viz/kits/days-01-07/refs'
import { meta } from './meta'
import { select, type Claim, type Day01Selection, type Side } from './select'
import s from './day01.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

const sideLabel: Record<Side, string> = { prosecution: 'Prosecution', defense: 'Defense' }
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

function ClaimCard({ side, claim, labels }: { side: Side; claim: Claim | null; labels: Record<string, string> }) {
  if (!claim) {
    return (
      <div className={`${s.card} ${s[side]} ${s.empty}`}>
        <span className={s.cardSide}>{sideLabel[side]}</span>
        <p>Not in the record of this opening.</p>
      </div>
    )
  }
  return (
    <div className={`${s.card} ${s[side]}`}>
      <span className={s.cardSide}>{sideLabel[side]}</span>
      <p>{cap(claim.text)}</p>
      {claim.figures.map((f) => (
        <p key={f.num.what} className={s.figure}>
          <span className="num">{formatValue(f.num.value, f.num.unit)}</span>{' '}
          {/^\$|usd/i.test(f.num.unit) ? 'is an allegation here.' : ''} <Sourced level={f.num.confidence} refs={f.refs} labels={labels} />
        </p>
      ))}
    </div>
  )
}

function Constellation({ sel }: { sel: Day01Selection }) {
  const w = layout.phoneWidth
  const { left, right, top } = layout.margin
  const step = layout.gap
  const r = layout.dot
  const baseY = top + step
  const x = scaleLinear().domain([1, sel.dayCount]).range([left / 2, w - right / 2])
  const stackOf = new Map<number, number>()
  const stars = sel.witnesses.map((wit) => {
    const k = stackOf.get(wit.first_day) ?? 0
    stackOf.set(wit.first_day, k + 1)
    return { wit, cx: x(wit.first_day), cy: baseY + k * step, lit: sel.litIds.includes(wit.id) }
  })
  const maxStack = Math.max(...stackOf.values())
  const h = baseY + (maxStack - 1) * step + r + step / 2
  const star = (cx: number, cy: number) => `M${cx} ${cy - r} L${cx + r / 2} ${cy - r / 2} L${cx + r} ${cy} L${cx + r / 2} ${cy + r / 2} L${cx} ${cy + r} L${cx - r / 2} ${cy + r / 2} L${cx - r} ${cy} L${cx - r / 2} ${cy - r / 2} Z`
  const lit = stars.filter((st) => st.lit)
  return (
    <div className={s.constellation}>
      <h3 className={s.subhead}>The witnesses, as stars</h3>
      <p className={s.small}>
        {sel.witnesses.length} people testified for the prosecution, placed by the day each first spoke. After Day 1, {lit.length} have spoken:{' '}
        {lit.map((l) => l.wit.display_name).join(' and ')}.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${lit.length} of ${sel.witnesses.length} witness stars lit: ${lit.map((l) => l.wit.display_name).join(', ')}.`} className={s.starSvg}>
        <line x1={x(1)} x2={x(sel.dayCount)} y1={baseY - step / 2 - r} y2={baseY - step / 2 - r} className={s.starAxis} aria-hidden="true" />
        {[1, sel.dayCount].map((d) => (
          <text key={d} x={x(d)} y={baseY - step - r} className={s.starTick} textAnchor={d === 1 ? 'start' : 'end'} aria-hidden="true">
            Day {d}
          </text>
        ))}
        {stars.map((st) => (
          <path key={st.wit.id} d={star(st.cx, st.cy)} className={st.lit ? s.starLit : s.starDim} aria-hidden="true" />
        ))}
      </svg>
    </div>
  )
}

export default function Day01Viz({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const pros = sel.openings.find((o) => o.side === 'prosecution')
  const def = sel.openings.find((o) => o.side === 'defense')
  return (
    <div className={s.viz} data-day01="claim-diff">
      <ul className={s.stakes} aria-label="What was at stake when the trial opened">
        {sel.stakes.map((st) => (
          <li key={st.id} className={s.stake}>
            <span className={`${s.stakeValue} num`} data-source-ids={st.refs.map((r) => r.id).join(' ')}>{typeof st.num.value === 'number' ? st.num.value.toLocaleString('en-US') : st.num.value}</span>
            <span className={s.stakeLabel}>{st.label}</span>
            {st.detail ? <span className={s.stakeDetail}>{st.detail}</span> : null}
            <Sourced level={st.num.confidence} refs={st.refs} labels={labels} />
          </li>
        ))}
      </ul>

      <div className={s.diff}>
        <div className={s.diffHead} aria-hidden="true">
          <span className={s.headPros}>Prosecution opening{pros ? <span className={s.speaker}>{pros.speaker}</span> : null}</span>
          <span className={s.headTopic}>Topic</span>
          <span className={s.headDef}>Defense opening{def ? <span className={s.speaker}>{def.speaker}</span> : null}</span>
        </div>
        <ol className={s.rows} aria-label="Topics, with each side's opening claim">
          {sel.rows.map((row) => (
            <li key={row.id} className={s.row} data-topic={row.id}>
              <ClaimCard side="prosecution" claim={row.prosecution} labels={labels} />
              <span className={`${s.ribbon} ${s.ribbonPros} ${row.prosecution ? '' : s.ribbonGap}`} aria-hidden="true" />
              <details className={s.topic}>
                <summary>
                  <span className={s.topicLabel}>{row.label}</span>
                  <span className={s.topicHint}>{row.laterDays.length > 0 ? 'Where the trial tested it' : 'Not returned to in later records'}</span>
                </summary>
                {row.laterDays.length > 0 ? (
                  <p className={s.later}>
                    Tested on{' '}
                    {row.laterDays.map((d, i) => (
                      <span key={d}>
                        <a href={`/day/${d}/`}>Day {d}</a>
                        {i < row.laterDays.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className={s.later}>No later day&rsquo;s record returns to it by name.</p>
                )}
              </details>
              <span className={`${s.ribbon} ${s.ribbonDef} ${row.defense ? '' : s.ribbonGap}`} aria-hidden="true" />
              <ClaimCard side="defense" claim={row.defense} labels={labels} />
            </li>
          ))}
        </ol>
        {pros || def ? (
          <p className={s.openingSources}>
            Both openings as summarised in the Day 1 record{' '}
            <Sourced level="medium" refs={(pros ?? def)?.fact.refs ?? []} labels={labels} compact />
          </p>
        ) : null}
      </div>

      <Constellation sel={sel} />

      <details className={s.verdict}>
        <summary>See how the jury decided</summary>
        <p className={s.small}>&ldquo;Not guilty&rdquo; means the jury was not persuaded beyond a reasonable doubt. It is not a finding about what anyone lived through.</p>
        <ol className={s.verdictList}>
          {sel.verdict.map((v) => (
            <li key={v.count}>
              <span className={s.countNo}>Count {v.count}</span> {v.short}: <strong className={v.outcome === 'guilty' ? s.guilty : s.notGuilty}>{v.outcome}</strong>{' '}
              <Sourced level="high" refs={v.refs} labels={labels} compact />
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}

function numberRow(day: DayVizProps['day'], n: ReportedNumber, i: number, group?: string): TableRow {
  return { key: `n${i}`, group, cells: [<span key="v" className="num">{formatValue(n.value, n.unit)}</span>, redactThirdParties(n.what)], level: n.confidence, refs: numberRefs(day, n) }
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const pros = sel.openings.find((o) => o.side === 'prosecution')
  const def = sel.openings.find((o) => o.side === 'defense')
  const both = sel.rows.filter((r) => r.prosecution && r.defense).length
  const rows: TableRow[] = [
    ...sel.rows.map((r, i) => ({
      key: r.id,
      group: i === 0 ? 'The openings, topic by topic' : undefined,
      cells: [
        r.label,
        <>
          <strong>Prosecution:</strong> {r.prosecution ? cap(r.prosecution.text) : 'not in the record of this opening'}. <strong>Defense:</strong> {r.defense ? cap(r.defense.text) : 'not in the record of this opening'}.{' '}
          {r.laterDays.length > 0 ? `Tested on ${r.laterDays.map((d) => `Day ${d}`).join(', ')}.` : ''}
        </>,
      ],
      level: 'medium' as const,
      refs: (pros ?? def)?.fact.refs ?? [],
    })),
    ...day.numbers.map((n, i) => numberRow(day, n, i, i === 0 ? `Every figure reported on Day ${day.day}` : undefined)),
  ]
  return (
    <>
      <p>
        On {formatDate(day.date, { weekday: true })}, before any witness spoke, each side gave the jury its opening statement:
        {pros ? ` ${pros.speaker} for the prosecution` : ''}{pros && def ? ' and' : ''}{def ? ` ${def.speaker} for the defense` : ''}. The picture sets the two
        side by side on {sel.rows.length} topics. On {both} of them the record has a claim from both sides; on the rest, only one side&rsquo;s claim was
        reported. Each topic links to the later days whose records return to it.
      </p>
      <p>
        Openings are not evidence. Above the topics are the figures that framed the trial ({sel.stakes.map((st) => `${formatValue(st.num.value, st.num.unit)} ${st.label}`).join('; ')}).
        Below them, {sel.witnesses.length} stars stand for the prosecution&rsquo;s witnesses; {sel.litIds.length} are lit after Day 1. The verdict is
        behind a button so it is read only by choice.
      </p>
      <RowsTable caption={`Day ${day.day}: the openings by topic, and every figure reported`} columns={['Topic or figure', 'What the record says']} rows={rows} labels={labels} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return sel ? toExtraSources(sel.index.extras) : []
}
