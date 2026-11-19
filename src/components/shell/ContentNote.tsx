// Care rule 1: a content note that informs, not alarms. One plain sentence, plus two choices.
import type { ContentLevel } from '@/viz/types'

export const CONTENT_NOTES: Record<ContentLevel, string> = {
  1: 'This page shows court procedure, records and dates. It does not describe any assault.',
  2: 'This page refers to testimony about violence or coercion, using dates, counts and money instead of detail. It does not describe any assault.',
  3: 'This page is about testimony on sexual coercion. It shows only dates, durations, counts or money, and describes no assault.',
}

export function ContentNote({ level, override, nextHref, nextLabel }: { level: ContentLevel; override?: string; nextHref: string; nextLabel: string }) {
  return (
    <aside className="content-note" aria-label="Content note" data-content-level={level}>
      <p>
        <strong>Content note.</strong> {override ?? CONTENT_NOTES[level]}
      </p>
      <p className="content-note-choices">
        <a href="#text-version" className="btn">Show the text version</a>
        <a href={nextHref} className="btn">{nextLabel}</a>
      </p>
    </aside>
  )
}
