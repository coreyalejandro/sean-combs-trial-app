import Link from 'next/link'
import { DAY_COUNT } from '@/lib/data'
import { fmtPeople } from '@/viz/finale/format'
import { summary } from '@/viz/finale/summary'

export const metadata = { title: 'About this site' }

export default function AboutPage() {
  return (
    <div className="wrap sources-page">
      <h1>About this site</h1>
      <section className="measure">
        <h2>Who made it</h2>
        <p>
          The Combs Trial was made by Corey Alejandro: a Black, queer, neurodivergent research scientist, research engineer, dramatist and
          maker, and a survivor of homelessness, psychiatric hospitalization and addiction. More of his work is at{' '}
          <a href="https://coreyalejandro.com" rel="noopener noreferrer">coreyalejandro.com</a>.
        </p>
        <h2>Why it exists</h2>
        <p>
          It starts close, on one federal courtroom: one picture for each of the {DAY_COUNT} days the jury heard testimony in United States
          v. Sean Combs, then the verdict. Then it pulls back, to about {fmtPeople(summary.totals.central)} adults in the United States who
          have survived contact sexual violence, and asks what the country would look like if every one of them walked to Washington. The
          point is to make it possible to see how many people sexual violence touches.
        </p>
        <h2>What it is, and what it is not</h2>
        <ul>
          <li>It is built from news reports of the trial. Every number links to the outlet that reported it.</li>
          <li>
            It reports what witnesses testified and what each side argued. Testimony and allegations are not findings. The jury found Combs
            not guilty of racketeering conspiracy and both sex-trafficking counts, and guilty of both transportation counts. Not guilty means
            the jury was not persuaded beyond a reasonable doubt; it is not a finding about what anyone lived through.
          </li>
          <li>It does not describe any assault, show any image of a survivor, or show anything that could identify the two women who testified under pseudonyms.</li>
          <li>People who were never charged and never testified are named only where the reporting names them, and their status is said.</li>
        </ul>
        <p>
          <Link href="/method/">How the site was made</Link> · <Link href="/sources/">Every source</Link> · <Link href="/support/">Get support</Link>
        </p>
      </section>
    </div>
  )
}
