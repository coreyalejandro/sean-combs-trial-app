// Shared formatters: values come from the data, so formatting must never change what a value says.
import { describe, expect, it } from 'vitest'
import { formatUSD, formatUSDShort, formatValue } from '@/lib/viz/format'

describe('formatValue and formatUSD', () => {
  it('keeps cents when an amount has them', () => {
    expect(formatUSD(10.5)).toBe('$10.50')
    expect(formatUSD(795.63)).toBe('$795.63')
    expect(formatUSD(100000)).toBe('$100,000')
    expect(formatUSDShort(10.5)).toBe('$10.50')
  })
  it('shows a rate unit in words', () => {
    expect(formatValue(10.5, 'USD/hour')).toBe('$10.50 per hour')
    expect(formatValue(20000, 'USD')).toBe('$20,000')
    expect(formatValue(100000, 'USD (more than)')).toBe('$100,000 (more than)')
  })
  it('passes text values through', () => {
    expect(formatValue('8-10', 'hours')).toBe('8-10 hours')
  })
})
