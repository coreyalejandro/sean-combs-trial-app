// Day 21: an amount in words ("$10,000 a month"), shared by the picture and the text version.
import { formatUSD } from '@/lib/viz/format'
import type { Money } from './select'

export function amountText(m: Money): string {
  const perMonth = m.kind === 'monthly' || m.kind === 'asked-monthly' || m.kind === 'income'
  const v = m.lo === m.hi ? formatUSD(m.lo) : `${formatUSD(m.lo)} to ${formatUSD(m.hi)}`
  return `${m.id === 'prior' || m.id === 'total' ? 'about ' : ''}${v}${perMonth ? ' a month' : ''}`
}
