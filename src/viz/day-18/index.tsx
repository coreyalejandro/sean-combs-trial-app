// Day 18: How Long the Nights Lasted, in Two Women's Testimony (Builder 3).
// A duration range plot: every length either woman gave, on one hours axis, grouped by witness;
// recovery on its own scale below. Lengths of time stand in for any detail (care rule 2).
import { layout } from '@/lib/viz/layout'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, levelWords } from '../day-15/kit/sources'
import { OmittedNote, VizTable, type TableRow } from '../day-15/kit/VizTable'
import k from '../day-15/kit/kit.module.css'
import { layoutDay18 } from './geometry'
import { spanText } from './format'
import Day18Interactive from './Interactive'
import { meta } from './meta'
import { select } from './select'

export { meta }

export default function Day18Viz({ day }: DayVizProps) {
  const sel = select(day)
  const geo = { wide: layoutDay18(sel, layout.chartWidth, false), narrow: layoutDay18(sel, layout.phoneWidth - layout.gap * 2, true) }
  return (
    <div className={k.viz} data-viz="day-18">
      <Day18Interactive spans={sel.spans} groups={sel.groups} geo={geo} pool={sel.pool} overlap={sel.overlap} />
      <ExtraSources sources={sel.extraSources} pool={sel.pool} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const p: string[] = [
    'The picture is a range chart on one axis of hours. Each row is one length of time a witness gave in testimony, drawn from its lowest to its highest figure; a single figure is a dot. Solid shapes were reported by two or more outlets, outlined ones by one outlet, striped and dashed ones by one outlet without confirmation.',
  ]
  for (const g of sel.groups) {
    const list = sel.spans.filter((x) => x.who === g.who)
    if (list.length === 0) continue
    p.push(`${g.name}${g.years ? ` (${g.years})` : ''}: ${list.map((x) => `${x.label.toLowerCase()}, ${x.reported} (${spanText(x, 'hours')}; ${levelWords(x.level)}; Day ${x.fromDay})`).join('; ')}.`)
  }
  if (sel.overlap) p.push(`A shaded band marks the hours both women's figures cover: ${spanText(sel.overlap, 'hours')} (calculated). Recovery is drawn on its own, longer scale.`)
  const rows: TableRow[] = sel.spans.map((x) => ({
    key: x.id,
    what: `${sel.groups.find((g) => g.who === x.who)?.name}: ${x.label}`,
    value: `${x.reported} (${spanText(x, 'hours')}, calculated)`,
    when: x.who === 'recovery' ? undefined : sel.groups.find((g) => g.who === x.who)?.years ?? undefined,
    level: x.level,
    sources: x.sources,
  }))
  return (
    <div className={k.longDesc}>
      {p.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`Durations as testified, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} whenLabel="Years" />
      <OmittedNote count={sel.omitted} why="they describe bodily or sexual detail, which this project does not chart (care rule 2)." />
    </div>
  )
}
