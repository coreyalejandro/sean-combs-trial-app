// The confidence mark used everywhere: solid (two or more outlets), hollow (one outlet),
// dashed hollow (one outlet, unconfirmed), split (outlets disagree). Always shown with words.
import { confidenceInfo, type Confidence } from '@/lib/data'

export function ConfidenceMark({ level, withLabel = true }: { level: Confidence | 'conflict'; withLabel?: boolean }) {
  const info = confidenceInfo(level)
  const r = 5
  const c = 7
  return (
    <span className={`conf conf-${info.mark}`} data-confidence={info.level} title={info.explain}>
      <svg width={c * 2} height={c * 2} viewBox={`0 0 ${c * 2} ${c * 2}`} aria-hidden="true" focusable="false">
        {info.mark === 'solid' && <circle cx={c} cy={c} r={r} fill="currentColor" />}
        {info.mark === 'hollow' && <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={2} />}
        {info.mark === 'dashed' && <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="3 2" />}
        {info.mark === 'split' && (
          <>
            <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={2} />
            <path d={`M${c} ${c - r} A${r} ${r} 0 0 0 ${c} ${c + r} Z`} fill="currentColor" />
          </>
        )}
      </svg>
      {withLabel ? <span className="conf-label">{info.label}</span> : <span className="visually-hidden">{info.label}</span>}
    </span>
  )
}

export function ConfidenceLegend() {
  const levels: Array<Confidence | 'conflict'> = ['high', 'medium', 'low', 'conflict']
  return (
    <ul className="conf-legend" aria-label="How sure each number is">
      {levels.map((l) => (
        <li key={l}>
          <ConfidenceMark level={l} /> <span className="conf-explain">{confidenceInfo(l).explain}</span>
        </li>
      ))}
    </ul>
  )
}
