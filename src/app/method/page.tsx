import Link from 'next/link'
import { allSources, DAY_COUNT, getVerdict } from '@/lib/data'
import { ConfidenceLegend } from '@/components/shell/ConfidenceMark'

export const metadata = { title: 'How this site was made' }

/** The day these pages were last checked against the news (the appeal's status included). */
const AS_OF = 'November 19, 2026'

export default function MethodPage() {
  const families = new Set(allSources().map((s) => s.outlet.split(/[ (/]/)[0]))
  const verdictPhases = getVerdict().phases.length
  return (
    <div className="wrap sources-page">
      <h1>How this site was made</h1>
      <section className="measure">
        <h2>Where the facts come from</h2>
        <p>
          Every fact comes from published news reports of the trial: {allSources().length} reports from {families.size} news organisations and
          public records, listed on the <Link href="/sources/">sources page</Link>. The site does not quote the official docket or the trial
          transcripts. Facts are as of {AS_OF}.
        </p>
        <h2>How the days are counted</h2>
        <p>
          Day 1 is May 12, 2025, the first day a witness testified; Day {DAY_COUNT} is June 24, 2025, when both sides rested. Some outlets
          count from jury selection, or count June 18, when no witness was heard; each day page says when its numbering differs. The verdict
          page follows the case through {verdictPhases} more steps, from the jury instructions to the appeal.
        </p>
        <h2>How sure each fact is</h2>
        <p>Every number carries a mark and words saying how it was reported:</p>
        <ConfidenceLegend />
        <p>
          Where reports differ, each page says so in one plain sentence under &ldquo;Where news reports differ&rdquo;. A number marked
          &ldquo;calculated&rdquo; was worked out from reported figures, and the page shows how.
        </p>
        <h2>What is left out, on purpose</h2>
        <ul>
          <li>No assault is described. Pages use dates, durations, counts and money instead of detail.</li>
          <li>Figures that describe bodies, injuries or sexual acts are left out of the pictures; each page says how many and why.</li>
          <li>Nothing that could identify the witnesses known as Mia and Jane: no ages, health details, their own income, children, exact dates of their posts, or exhibit numbers.</li>
          <li>Sex workers and other third parties are not named. People who were never charged are named only with their status.</li>
          <li>No one is called an &ldquo;accuser&rdquo;.</li>
        </ul>
        <h2>The march</h2>
        <p>
          The last picture is a simulation built from published totals (the CDC&rsquo;s National Intimate Partner and Sexual Violence Survey,
          the Census and the Bureau of Labor Statistics). Every walker is invented. Its own method and sources are on <Link href="/finale/">the
          march page</Link>.
        </p>
      </section>
    </div>
  )
}
