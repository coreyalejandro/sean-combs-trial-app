// "Also in court today": every witness and legal event on the day, as a short list.
// Builders can pass `exclude` with witness ids their picture already covers.
import { getWitnessesOnDay, redactThirdParties, type TrialDay } from '@/lib/data'

/**
 * People named on day pages who were never charged and never testified. Wherever a page names them, it says so
 * (review, Nov 2026). The page test checks that every page naming them carries the line.
 */
export const NOT_CHARGED: Array<{ name: string; days: number[]; status: string }> = [
  {
    name: 'Kristina Khorram',
    days: [3, 14, 15, 16, 17, 19, 24, 25, 26, 27],
    status: "Kristina Khorram, Combs's chief of staff, is named on this page (sometimes as \"the chief of staff\"). She was not charged and did not testify. What is said about her here is testimony and evidence offered by others.",
  },
]

export function AlsoToday({ day, exclude = [] }: { day: TrialDay; exclude?: string[] }) {
  const witnesses = getWitnessesOnDay(day.day).filter((w) => !exclude.includes(w.id))
  const notCharged = NOT_CHARGED.filter((p) => p.days.includes(day.day))
  return (
    <section className="also-today" aria-labelledby="also-heading">
      {notCharged.map((p) => (
        <p key={p.name} className="not-charged-note">{p.status}</p>
      ))}
      <h2 id="also-heading">Also in court today</h2>
      {witnesses.length > 0 && (
        <>
          <h3>On the stand</h3>
          <ul>
            {witnesses.map((w) => (
              <li key={w.id}>
                <strong>{w.display_name}</strong>
                {w.pseudonym ? <span className="muted"> (pseudonym)</span> : null}
                {w.first_day === day.day ? <span className="tag">first day on the stand</span> : null}
              </li>
            ))}
          </ul>
        </>
      )}
      {day.legal_events.length > 0 && (
        <>
          <h3>Legal events</h3>
          <ul>
            {day.legal_events.map((e, i) => (
              <li key={i}>{redactThirdParties(e)}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
