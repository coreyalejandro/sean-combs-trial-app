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
  it('prints years as years and dates in words', () => {
    expect(formatValue(2012, 'year')).toBe('2012')
    expect(formatValue(2017, 'date (Mar 18)')).toBe('March 18, 2017')
    expect(formatValue('2016-03', 'date')).toBe('March 2016')
    expect(formatValue('2016-03-05', 'date')).toBe('March 5, 2016')
    expect(formatValue('2021-05 to 2023-10', 'years')).toBe('May 2021 to October 2023')
    expect(formatValue('4:42 PM', 'time')).toBe('4:42 PM')
  })
  it('passes text values through', () => {
    expect(formatValue('8-10', 'hours')).toBe('8-10 hours')
  })
})
