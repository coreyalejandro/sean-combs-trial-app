// How confidence is shown everywhere. Definitions from SOURCE_AUDIT.md:
// high   = two or more independent outlet families agree        -> solid mark
// medium = one major outlet, no contradiction found             -> hollow mark, "one outlet"
// low    = single source flagged unverified, contradicted, or minor outlet -> dashed hollow mark, "one outlet, unconfirmed"
// Conflicts (outlets disagree) come from a day's `discrepancies` and use the split mark.
import type { Confidence } from './types'

export const CONFIDENCE_ORDER: Confidence[] = ['low', 'medium', 'high']

export interface ConfidenceInfo {
  level: Confidence | 'conflict'
  /** Words shown next to the mark. Never rely on the mark alone. */
  label: string
  /** One sentence for the text version and tooltips. */
  explain: string
  mark: 'solid' | 'hollow' | 'dashed' | 'split'
}

export function confidenceInfo(level: Confidence | 'conflict'): ConfidenceInfo {
  switch (level) {
    case 'high':
      return { level, label: 'two or more outlets', explain: 'Reported by two or more independent news organisations.', mark: 'solid' }
    case 'medium':
      return { level, label: 'one outlet', explain: 'Reported by one major news organisation, and no other report contradicts it.', mark: 'hollow' }
    case 'low':
      return { level, label: 'one outlet, unconfirmed', explain: 'Reported by one outlet only and not confirmed elsewhere, or contradicted by another report.', mark: 'dashed' }
    case 'conflict':
      return { level, label: 'outlets disagree', explain: 'News reports give different values; each is listed.', mark: 'split' }
  }
}

/** A builder may lower a confidence, never raise it. */
export function lowerConfidence(current: Confidence, wanted: Confidence): Confidence {
  return CONFIDENCE_ORDER.indexOf(wanted) < CONFIDENCE_ORDER.indexOf(current) ? wanted : current
}
