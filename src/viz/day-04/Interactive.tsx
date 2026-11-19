'use client'
// Day 4: a phone-style message thread on a time rail, with the defense's reading and Ventura's answer beside
// each message. The build-time HTML shows every message with both readings; "Step through" walks one at a time.
import { useRef, useState, type KeyboardEvent } from 'react'
import { Calculated, Sourced } from '../day-01/kit/Parts'
import type { Message } from './select'
import s from './day04.module.css'

const yearText = (m: Message) => (m.from === m.to ? String(m.from) : `${m.from} to ${m.to}`)

export function Thread({ messages, labels }: { messages: Message[]; labels: Record<string, string> }) {
  // -1 = every message open (the still frame, also the no-JavaScript state)
  const [step, setStep] = useState(-1)
  const listRef = useRef<HTMLOListElement>(null)
  const go = (i: number) => {
    const n = Math.max(0, Math.min(messages.length - 1, i))
    setStep(n)
    listRef.current?.querySelector<HTMLElement>(`[data-msg="${n}"]`)?.scrollIntoView?.({ block: 'nearest' })
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(step + 1)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(step - 1)
    else if (e.key === 'Escape') setStep(-1)
    else return
    e.preventDefault()
    e.stopPropagation()
  }
  return (
    <div className={s.threadWrap} onKeyDown={onKey}>
      <div className={s.controls} role="group" aria-label="Step through the messages">
        <button type="button" className={s.btn} onClick={() => go(step - 1)} disabled={step <= 0}>
          Previous message
        </button>
        <span className={s.counter} aria-live="polite">
          {step < 0 ? `All ${messages.length} messages` : `Message ${step + 1} of ${messages.length}`}
        </span>
        <button type="button" className={s.btn} onClick={() => go(step + 1)} disabled={step >= messages.length - 1}>
          {step < 0 ? 'Step through' : 'Next message'}
        </button>
        {step >= 0 ? (
          <button type="button" className={s.btnQuiet} onClick={() => setStep(-1)}>
            Show all
          </button>
        ) : null}
      </div>

      <div className={s.lanesHead} aria-hidden="true">
        <span>Year</span>
        <span>The message (paraphrased)</span>
        <span className={s.headDef}>What the defense put to her</span>
        <span className={s.headHer}>What Ventura answered</span>
      </div>

      <ol ref={listRef} className={s.thread} aria-label="Messages shown on cross-examination, oldest first">
        {messages.map((m, i) => {
          const on = step < 0 || step === i
          const prev = messages[i - 1]
          const gap = prev ? m.from - prev.to : 0
          return (
            <li key={m.id} data-msg={i} className={`${s.msg} ${on ? s.on : s.off} ${step === i ? s.current : ''}`} aria-current={step === i ? 'step' : undefined}>
              <div className={s.rail}>
                {prev && gap > 0 ? (
                  <span className={s.gap}>
                    {gap} {gap === 1 ? 'year' : 'years'} later <Calculated formula={`${m.from} minus ${prev.to}`} />
                  </span>
                ) : null}
                <span className={s.year}>{yearText(m)}</span>
              </div>
              <div className={s.bubbleCol}>
                <p className={s.bubble}>{m.paraphrase}</p>
                {m.again.map((a) => (
                  <p key={a.day} className={s.again}>
                    <a href={`/day/${a.day}/`} className={s.againLink}>Seen again on Day {a.day}</a>: {a.text} <Sourced level={a.level} refs={a.refs} labels={labels} compact />
                  </p>
                ))}
              </div>
              <div className={`${s.reading} ${s.def}`} hidden={!on}>
                <span className={s.lane}>The defense</span>
                <p>{m.defense.text}</p>
                <Sourced level={m.defense.level} refs={m.defense.refs} labels={labels} />
              </div>
              <div className={`${s.reading} ${s.her} ${m.ventura ? '' : s.none}`} hidden={!on}>
                <span className={s.lane}>Ventura</span>
                {m.ventura ? (
                  <>
                    <p>{m.ventura.text}</p>
                    <Sourced level={m.ventura.level} refs={m.ventura.refs} labels={labels} />
                  </>
                ) : (
                  <p>Her answer to this message is not in the record.</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
