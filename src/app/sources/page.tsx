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
        {sources.length} news reports and public records. This site is built from news coverage of the trial; it does not quote the
        official docket or the trial transcripts. How it was made is on the <a href="/method/">method page</a>.
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
