// The page every day uses, in the order DESIGN_29 sets: cover band, charge ribbon, content note,
// the visualization with its question, caption, "How to read this", "Text version",
// "Also in court today", sources, and the trial rail. Scaffold-owned.
import { DAY_COUNT, formatDate, getDay, getGaps, getWitnessesOnDay } from '@/lib/data'
import { getDayModule } from '@/viz/registry'
import { AlsoToday } from './AlsoToday'
import { ChargeRibbon } from './ChargeRibbon'
import { ContentNote } from './ContentNote'
import { DayCover } from './DayCover'
import { DayPager, type PagerLink } from './DayPager'
import { FigureFrame } from './FigureFrame'
import { WordsOnThisPage } from './Glossary'
import { RailKeys, TextVersionHash } from './RailKeys'
import { SourceNumbers } from './SourceNumbers'
import { SourcesPanel } from './SourcesPanel'
import { TowardMarch } from './TowardMarch'
import { dayHref, TrialRail } from './TrialRail'

export function DayShell({ n }: { n: number }) {
  const day = getDay(n)
  const { meta, Viz, TextVersion, extraSources } = getDayModule(n)
  const prev: PagerLink | null = n > 1 ? { href: dayHref(n - 1), label: `Day ${n - 1}` } : null
  const next: PagerLink = n < DAY_COUNT ? { href: dayHref(n + 1), label: `Day ${n + 1}` } : { href: '/verdict/', label: 'The verdict' }
  const gapAfter = getGaps().find((g) => g.afterDay === n)
  const onStand = getWitnessesOnDay(n).map((w) => w.display_name)

  return (
    <article className="day-page" data-day={n}>
      <DayCover
        number={String(n)}
        eyebrow={`Day ${n} of ${DAY_COUNT} · ${formatDate(day.date, { weekday: true })}`}
        title={meta.title}
      >
        <p className="cover-dek">On the stand: {onStand.join(', ')}</p>
      </DayCover>
      <TrialRail current={n} />
      <div className="wrap day-body">
        <DayPager prev={prev} next={next} position="top" />
        <ChargeRibbon highlight={meta.counts} />
        <ContentNote level={meta.contentLevel} override={meta.contentNote} nextHref={next.href} nextLabel={n < DAY_COUNT ? 'Skip to the next day' : 'Skip to the verdict'} />
        <WordsOnThisPage text={[JSON.stringify(day), meta.title, meta.question, meta.caption, meta.howToRead].join(' ')} />
        <FigureFrame meta={meta} textVersion={<TextVersion n={n} day={day} />}>
          <Viz n={n} day={day} />
        </FigureFrame>
        <TowardMarch n={n} />
        <AlsoToday day={day} />
        {gapAfter ? (
          <aside className="gap-note" aria-label="Calendar note">
            <h2>{formatDate(gapAfter.date, { weekday: true })}: {gapAfter.label.toLowerCase()}</h2>
            <p>{gapAfter.note}</p>
          </aside>
        ) : null}
        <SourcesPanel sources={day.sources} confidence={day.confidence} discrepancies={day.discrepancies} outletLabels={day.alt_day_labels} extras={extraSources(day)} />
        <DayPager prev={prev} next={next} position="bottom" />
      </div>
      <RailKeys prevHref={prev?.href ?? null} nextHref={next.href} />
      <TextVersionHash />
      <SourceNumbers />
    </article>
  )
}
