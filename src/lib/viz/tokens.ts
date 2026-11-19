// The same tokens as src/styles/tokens.css, for D3 / Plot code that needs colour values.
// Prefer CSS variables (fill="var(--prosecution)") in SVG; use these only where a library needs a string.
export const color = {
  ink: '#0a0b0d',
  slate: '#14171c',
  paper: '#f4f4f1',
  rule: '#2b3038',
  rulePaper: '#d6d6d0',
  muted: '#a4abb6',
  mutedInk: '#5a616b',
  red: '#e3261b',
  redText: '#b3170e',
  prosecution: '#2f6db3',
  defense: '#d98a1c',
  neutral: '#8a9099',
} as const

export const font = {
  display: '"Libre Franklin", "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif',
  body: '"Libre Franklin", "Helvetica Neue", Arial, sans-serif',
  data: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
} as const

/** Side colours: prosecution left in blue, defense right in amber. Always also label in words. */
export const side = {
  prosecution: { color: color.prosecution, label: 'Prosecution' },
  defense: { color: color.defense, label: 'Defense' },
  court: { color: color.neutral, label: 'Court' },
} as const
