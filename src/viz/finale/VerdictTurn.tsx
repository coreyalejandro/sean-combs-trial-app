'use client'
// The turn from one case to all survivors (DESIGN_29, "The verdict and sentence page"): the witness stars
// gather and contract into one red dot, the dot is relabelled "1 dot = 1,000 people", and the country fills
// with dots. With motion, it plays once when it comes into view; in quiet mode each step is a still frame
// with a "Continue" button. Without JavaScript, the last frame (with every line) is what the HTML shows.
// The lines are draft copy awaiting Corey's voice review.
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQuietMotion } from '@/lib/viz/motion'

export interface TurnProps {
  witnesses: number
  namedLine: string
  peoplePerDot: string
  survivors: string
  survivorsRound: string
  survivorsRange: string
}

const LAST = 3
const STEP_MS = [2200, 2000, 2200]
const W = 720
const H = 320
const CX = W / 2
const CY = H / 2
const SPREAD_X = 300
const SPREAD_Y = 130
const GOLDEN = 2.399963229728653
const STAR_R = 7
const STAR_INNER = 0.45
const STAR_POINTS = 5
const DOT_R = 10
const HALF = 0.5
const VISIBLE = 0.5

function starPath(r: number) {
  const pts: string[] = []
  for (let k = 0; k < STAR_POINTS * 2; k++) {
    const rad = k % 2 === 0 ? r : r * STAR_INNER
    const a = (Math.PI * k) / STAR_POINTS - Math.PI / 2
    pts.push(`${(rad * Math.cos(a)).toFixed(2)},${(rad * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

export function VerdictTurn(p: TurnProps) {
  const quiet = useQuietMotion()
  const [step, setStep] = useState(LAST) // the HTML (and no-JS readers) get the final frame
  const [hydrated, setHydrated] = useState(false)
  const [inView, setInView] = useState(false)
  const [anim, setAnim] = useState(false)
  const played = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHydrated(true)
    setStep(0)
    // jump to the first frame without animating away from the HTML's last frame
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setAnim(true)))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) setInView(true) }, { threshold: VISIBLE })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // With motion: play once, a step every couple of seconds. Quiet mode: wait for "Continue".
  useEffect(() => {
    if (!hydrated || quiet || !inView || step >= LAST) return
    if (step === 0 && played.current) return
    played.current = true
    const id = window.setTimeout(() => setStep((s) => Math.min(LAST, s + 1)), STEP_MS[step])
    return () => window.clearTimeout(id)
  }, [hydrated, quiet, inView, step])

  const stars = Array.from({ length: p.witnesses }, (_, i) => {
    const f = Math.sqrt((i + HALF) / p.witnesses)
    return { x: CX + SPREAD_X * f * Math.cos(i * GOLDEN), y: CY + SPREAD_Y * f * Math.sin(i * GOLDEN) }
  })
  const gathered = step >= 1
  const lines = [
    `One trial. ${p.witnesses} witnesses. ${p.namedLine}`,
    'Then the camera pulls back.',
    `1 dot = ${p.peoplePerDot} people`,
    `About ${p.survivorsRound} adults in America have survived contact sexual violence.`,
  ]
  const stageLabel = [
    `${p.witnesses} stars, one for each prosecution witness.`,
    'The stars gather and contract into one red dot.',
    `The single red dot, now labelled: 1 dot = ${p.peoplePerDot} people.`,
    'A map of the United States filled with red dots, one for every 1,000 survivors, at home.',
  ][step]

  return (
    <section className="vt-turn" aria-labelledby="turn-heading">
      <div className="vt-stage" ref={stageRef} data-step={step} data-anim={anim ? 'true' : 'false'} role="img" aria-label={stageLabel}>
        <div className="vt-homes" />
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
          {stars.map((s, i) => (
            <path
              key={i}
              className="vt-star"
              d={starPath(STAR_R)}
              fill="#f4f4f1"
              style={{ transform: gathered ? `translate(${CX}px, ${CY}px) scale(0.2)` : `translate(${s.x}px, ${s.y}px)`, opacity: gathered ? 0 : 1 }}
            />
          ))}
          <circle className="vt-dot" cx={CX} cy={CY} r={DOT_R} fill="#e3261b" style={{ opacity: step >= 1 && step < LAST ? 1 : 0, transform: `scale(${step >= 1 ? 1 : 0})`, transformOrigin: `${CX}px ${CY}px` }} />
        </svg>
      </div>
      {step >= 1 ? <p className="vt-sub">{lines[0]}</p> : null}
      <h2 id="turn-heading" className="vt-line" aria-live="polite">{lines[step]}</h2>
      {step === LAST ? (
        <>
          <div className="vt-counter">
            <span className="fm-k">Survivors who would leave home</span>
            <span className="fm-v">{p.survivors}</span>
            <span className="fm-r">range {p.survivorsRange} · 1 dot = {p.peoplePerDot} people</span>
          </div>
          <p className="vt-sub">On the next page, every one of them leaves home on the same morning and walks to Washington.</p>
        </>
      ) : null}
      <div className="vt-actions">
        {step < LAST ? (
          <button type="button" className="btn" onClick={() => setStep((s) => Math.min(LAST, s + 1))}>Continue</button>
        ) : (
          <>
            <Link href="/finale/" className="btn btn-red">Begin the march</Link>
            {hydrated ? <button type="button" className="btn" onClick={() => { played.current = false; setStep(0) }}>See the turn again</button> : null}
          </>
        )}
      </div>
    </section>
  )
}
