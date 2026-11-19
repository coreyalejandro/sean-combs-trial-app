// Layout constants live here so visualization code has no magic numbers.
// Builders: if you need a new constant, ask the scaffold owner, or derive it from these.
export const layout = {
  /** Default chart width in the SVG viewBox at desktop; charts scale down with CSS. */
  chartWidth: 960,
  /** Phone-first width (DESIGN_29: designed for 390 px first). */
  phoneWidth: 390,
  /** Breakpoint shared by CSS and matchMedia('(min-width: 800px)'). */
  breakpoint: 800,
  margin: { top: 24, right: 24, bottom: 40, left: 48 },
  /** Minimum tap target (px). */
  tap: 44,
  /** Standard gap between marks or small multiples (px). */
  gap: 16,
  /** Default font sizes in SVG user units. */
  fontSize: { label: 13, small: 11, value: 15, title: 20 },
  /** Mark stroke widths. */
  stroke: { hairline: 1, mark: 2, emphasis: 3 },
  /** Dash pattern for "one outlet, unconfirmed" marks. */
  dashUnconfirmed: '4 3',
  /** Point radius for dot marks. */
  dot: 5,
  /** Milliseconds for one animation step (ignored under quiet mode). */
  stepMs: 600,
} as const

export const breakpointQuery = `(min-width: ${layout.breakpoint}px)`
