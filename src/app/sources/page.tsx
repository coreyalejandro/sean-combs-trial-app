import { allSources, getDays, getVerdict } from '@/lib/data'

export const metadata = { title: 'Sources' }

export default function SourcesPage() {
  const sources = allSources()
  const usedOn = (id: string) => {
    const days = getDays().filter((d) => d.sources.some((s) => s.id === id)).map((d) => `Day ${d.day}`)
    if (getVerdict().sources.some((s) => s.id === id)) days.push('Verdict')
    return days.join(', ')
  }
  return (
    <div className="wrap sources-page">
      <h1>Every source</h1>
      <p className="measure">
        {sources.length} news reports and records, as listed in the research file. The official docket and trial transcripts were not opened for this project.
      </p>
      <ol className="sources-list">
        {sources.map((s) => (
          <li key={s.id} id={`source-${s.id}`}>
            <span className="src-outlet">{s.outlet}</span>. <a href={s.url} rel="noopener noreferrer">{s.title}</a>.{' '}
            <time className="src-date">{s.date}</time>. <span className="muted">Used on: {usedOn(s.id)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
