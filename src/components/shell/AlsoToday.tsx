// "Also in court today": every witness and legal event on the day, as a short list.
// Builders can pass `exclude` with witness ids their picture already covers.
import { getWitnessesOnDay, redactThirdParties, type TrialDay } from '@/lib/data'

export function AlsoToday({ day, exclude = [] }: { day: TrialDay; exclude?: string[] }) {
  const witnesses = getWitnessesOnDay(day.day).filter((w) => !exclude.includes(w.id))
  return (
    <section className="also-today" aria-labelledby="also-heading">
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
