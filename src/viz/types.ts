// The contract between the shell and each day's visualization. Scaffold-owned.
import type { ComponentType } from 'react'
import type { TrialDay } from '@/lib/data'

export type ContentLevel = 1 | 2 | 3

export interface VizMeta {
  /** Testimony day, 1 to 28. */
  day: number
  /** Cover headline (DESIGN_29 entry title). Numbers here must be traceable to the data (checked). */
  title: string
  /** The one question the picture answers; shown as the figure heading. */
  question: string
  /** The form from DESIGN_29 ("Aligned claim diff"). */
  form: string
  /** 1 = procedure and records; 2 = references to violence or coercion without detail; 3 = centred on testimony about sexual coercion. */
  contentLevel: ContentLevel
  /** Optional override of the standard content-note sentence for this level. Survivor readers review it. */
  contentNote?: string
  /** Caption under the picture. */
  caption: string
  /** One line: "How to read this". */
  howToRead: string
  /** Short text alternative (one sentence), read as the figure's description. */
  altShort: string
  /** Counts (1-5) this day's evidence speaks to; outlined on the charge ribbon. Optional. */
  counts?: number[]
  /** placeholder until the builder ships; done when it meets the definition of done. */
  status: 'placeholder' | 'in-progress' | 'done'
}

export interface DayVizProps {
  /** The day number (same as day.day). */
  n: number
  /** The day's full record from trial_days.json. Read other days with getDay(m) from '@/lib/data'. */
  day: TrialDay
}

/**
 * A source the picture or text version cites that is not in the day's own list: another day's record,
 * the verdict record, or the day's additions.json. The page's Sources panel lists these after the day's own
 * sources, numbered on from them, each with id="source-<id>" so every data-source-ids tag resolves.
 */
export interface ExtraSource {
  /** Page anchor id (the list item gets id="source-<id>"). */
  id: string
  outlet: string
  title: string
  url: string
  date: string
  /** Where it comes from, in words: "from the Day 15 record", "added for this picture". */
  origin: string
}

export interface DayModule {
  meta: VizMeta
  /** The picture. Render SVG on the server from data; add interaction in a 'use client' child. */
  Viz: ComponentType<DayVizProps>
  /** The long description and data table, built from the same selection as the picture. */
  TextVersion: ComponentType<DayVizProps>
  /** Sources cited on the page beyond the day's own list, in the order the picture numbers them. */
  extraSources: (day: TrialDay) => ExtraSource[]
}
