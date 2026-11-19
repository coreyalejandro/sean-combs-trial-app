// What every day shows until its builder ships: the question, the planned form, and the day's
// numbers as a sourced table. Builders replace the use of these in src/viz/day-NN/index.tsx.
import { redactThirdParties } from '@/lib/data'
import type { DayVizProps, VizMeta } from '@/viz/types'
import { NumbersTable } from './NumbersTable'

export function PlaceholderViz({ day, meta }: DayVizProps & { meta: VizMeta }) {
  return (
    <div className="viz-placeholder" data-placeholder="true">
      <p className="ph-label mono">Visualization in progress</p>
      <p className="ph-form">Planned form: <strong>{meta.form}</strong></p>
      <p className="ph-count mono">
        {day.numbers.length} reported figures and {day.sources.length} sources for this day are in the text version below.
      </p>
    </div>
  )
}

export function PlaceholderTextVersion({ day, meta }: DayVizProps & { meta: VizMeta }) {
  return (
    <>
      <p>{meta.altShort}</p>
      <p>{redactThirdParties(day.summary)}</p>
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}
