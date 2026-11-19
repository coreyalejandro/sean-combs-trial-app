'use client'
// Day 16 interaction: step along the line, stop by stop. The line turns red up to the selected stop.
import { useState } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import type { Source } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import { useRovingFocus } from '@/lib/viz/roving'
import { ConfDot } from '../day-15/kit/marks'
import { Calc, SrcTags, levelWords, type Level } from '../day-15/kit/sources'
import k from '../day-15/kit/kit.module.css'
import s from './day16.module.css'

export interface StationView {
  id: string
  title: string
  holder: string
  whenText: string
  words: string[]
  level: Level
  sources: Source[]
  fromDay: number | null
  era: 'before' | 'trial'
  /** Height of the track above this stop (px), longer for longer waits. */
  gapPx: number
  /** "about 8 years later" (calculated from the two dates), or null. */
  gapText: string | null
}

export default function Day16Interactive({ stations, pool }: { stations: StationView[]; pool: Source[] }) {
  const [active, setActive] = useState(0)
  const roving = useRovingFocus(stations.length, { onSelect: (i) => setActive(i) })
  const go = (i: number) => {
    const next = Math.max(0, Math.min(stations.length - 1, i))
    setActive(next)
    roving.setActive(next)
  }
  const r = layout.dot + layout.stroke.mark
  const size = r * 2 + layout.stroke.emphasis * 2
  return (
    <div className={`${k.viz} ${s.wrap}`}>
      <div className={k.controls}>
        <button type="button" className={k.toggle} onClick={() => go(active - 1)} disabled={active === 0}>
          Previous stop
        </button>
        <button type="button" className={k.toggle} onClick={() => go(active + 1)} disabled={active === stations.length - 1}>
          Next stop
        </button>
        <span className={s.status} aria-live="polite">
          Stop {active + 1} of {stations.length}: {stations[active]?.title}
        </span>
      </div>
      <ol className={s.line} onKeyDown={roving.onKeyDown} aria-label="Where the video went, stop by stop">
        {stations.map((st, i) => {
          const reached = i <= active
          const isActive = i === active
          return (
            <li key={st.id} className={`${s.stop} ${reached ? s.reached : ''} ${isActive ? s.active : ''} ${st.era === 'trial' ? s.trial : ''}`}>
              {i > 0 ? (
                <div className={`${s.track} ${st.gapText ? s.longTrack : ''}`} style={{ height: st.gapPx }} aria-hidden={st.gapText ? undefined : true}>
                  {st.gapText ? (
                    <span className={s.gapLabel}>
                      {st.gapText} <Calc formula="months between the two dates" />
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className={s.row}>
                <svg className={s.dot} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                  <ConfDot cx={size / 2} cy={size / 2} r={isActive ? r + layout.stroke.mark : r} level={st.level} color={reached ? 'var(--red)' : 'var(--ink)'} />
                </svg>
                <div className={s.body}>
                  <button
                    type="button"
                    className={s.stopButton}
                    aria-expanded={isActive}
                    data-roving-index={i}
                    tabIndex={roving.tabIndexFor(i)}
                    onClick={() => go(i)}
                    onFocus={() => roving.setActive(i)}
                  >
                    <span className={s.when}>{st.whenText}</span>
                    <span className={s.title}>{st.title}</span>
                    <span className={s.holder}>Who had it: {st.holder}</span>
                  </button>
                  {isActive ? (
                    <div className={s.detail}>
                      {st.words.length > 0 ? (
                        <ul>{st.words.map((w) => <li key={w}>{w}{/[.)'"]$/.test(w) ? '' : '.'}</li>)}</ul>
                      ) : (
                        <p>This page never shows the video, only where it went.</p>
                      )}
                      <p className={k.detailMeta}>
                        <ConfidenceMark level={st.level} /> <SrcTags sources={st.sources} pool={pool} />
                        {st.fromDay ? (
                          <>
                            {' '}· <a href={`/day/${st.fromDay}/`}>Day {st.fromDay}</a>
                          </>
                        ) : (
                          <>
                            {' '}· <a href="/verdict/">The verdict</a>
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <span className="visually-hidden">{levelWords(st.level)}</span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
