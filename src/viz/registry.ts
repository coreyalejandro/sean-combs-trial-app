// All 28 day modules. Scaffold-owned: builders never edit this file.
// Each entry points at src/viz/day-NN/index.tsx (default export = picture, TextVersion, meta).
import type { DayModule } from './types'
import * as d01 from './day-01'
import * as d02 from './day-02'
import * as d03 from './day-03'
import * as d04 from './day-04'
import * as d05 from './day-05'
import * as d06 from './day-06'
import * as d07 from './day-07'
import * as d08 from './day-08'
import * as d09 from './day-09'
import * as d10 from './day-10'
import * as d11 from './day-11'
import * as d12 from './day-12'
import * as d13 from './day-13'
import * as d14 from './day-14'
import * as d15 from './day-15'
import * as d16 from './day-16'
import * as d17 from './day-17'
import * as d18 from './day-18'
import * as d19 from './day-19'
import * as d20 from './day-20'
import * as d21 from './day-21'
import * as d22 from './day-22'
import * as d23 from './day-23'
import * as d24 from './day-24'
import * as d25 from './day-25'
import * as d26 from './day-26'
import * as d27 from './day-27'
import * as d28 from './day-28'

const mod = (m: { default: DayModule['Viz']; TextVersion: DayModule['TextVersion']; meta: DayModule['meta'] }): DayModule => ({ meta: m.meta, Viz: m.default, TextVersion: m.TextVersion })

export const registry: Record<number, DayModule> = {
  1: mod(d01),
  2: mod(d02),
  3: mod(d03),
  4: mod(d04),
  5: mod(d05),
  6: mod(d06),
  7: mod(d07),
  8: mod(d08),
  9: mod(d09),
  10: mod(d10),
  11: mod(d11),
  12: mod(d12),
  13: mod(d13),
  14: mod(d14),
  15: mod(d15),
  16: mod(d16),
  17: mod(d17),
  18: mod(d18),
  19: mod(d19),
  20: mod(d20),
  21: mod(d21),
  22: mod(d22),
  23: mod(d23),
  24: mod(d24),
  25: mod(d25),
  26: mod(d26),
  27: mod(d27),
  28: mod(d28),
}

export function getDayModule(n: number): DayModule {
  const m = registry[n]
  if (!m) throw new Error(`No visualization registered for day ${n}`)
  if (m.meta.day !== n) throw new Error(`src/viz/day-${String(n).padStart(2, '0')}/meta.ts says day ${m.meta.day}`)
  return m
}

export function allDayModules(): DayModule[] {
  return Object.keys(registry).map((k) => registry[Number(k)])
}
