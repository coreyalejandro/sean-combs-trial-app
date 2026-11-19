// Server-rendered parts of the finale: in the static HTML, so they work without JavaScript.
// Every number is read from summary.json (the migration-map build's outputs).
import { FinaleRef, type RefSource } from './FinaleRef'
import { fmtInt, fmtNum, fmtPeople, pct } from './format'
import { FINALE_SOURCES, sourceNumber, summary as S } from './summary'

const KM_DIGITS = 1
const RATIO_DIGITS = 2

export function finaleRefs(): Record<string, RefSource> {
  return Object.fromEntries(FINALE_SOURCES.map((s) => [s.id, { id: s.id, outlet: s.outlet, n: sourceNumber(s.id) }]))
}
const REFS = finaleRefs()
const R = (...ids: string[]) => ids.map((id) => REFS[id])
/** Simulation time (days since the start) to the map's day label: Day 1 is the first 24 hours. */
const dayOf = (t: number) => Math.floor(t) + 1

/** The one-sentence description and the caption, from the data. */
export function finaleShortText(): string {
  return `${fmtInt(S.dots)} dots, each standing for ${fmtInt(S.people_per_dot)} people, leave their home counties on Day 1 and walk real roads to Washington, D.C.; half have arrived by Day ${S.half_day} and the last arrives on Day ${fmtInt(S.last_day)}.`
}

/** "The march at a glance": the still map and the counters on four days, for every reader (and no-JS readers). */
export function FinaleAtAGlance() {
  const peak = S.peak_night
  return (
    <section className="fm-glance" aria-labelledby="glance-heading" id="march-summary">
      <h2 id="glance-heading">The march at a glance</h2>
      <div className="fm-glance-grid">
        <figure className="fm-still">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/finale-data/still-arcs.png"
            width={1400}
            height={900}
            loading="lazy"
            alt={`Still map: red arcs from every state to Washington, D.C., wider where more people would leave. About ${fmtPeople(S.totals.central)} people in all.`}
          />
          <figcaption>Where the marchers come from: one arc per state, drawn wider for more people (the map&rsquo;s still version).</figcaption>
        </figure>
        <div className="fm-glance-numbers">
          <dl className="fm-facts">
            <div><dt>People who leave home</dt><dd><FinaleRef sources={R('cdc-nisvs', 'census-v2025')}>{fmtPeople(S.totals.central)}</FinaleRef> <span className="fm-range">range {fmtPeople(S.totals.low)} to {fmtPeople(S.totals.high)}, {pct(S.share_of_adults)} of U.S. adults</span></dd></div>
            <div><dt>Busiest night (Day {peak.day})</dt><dd><FinaleRef sources={R('ne-roads', 'jhu-csse')} calculated>{fmtPeople(peak.people_sleeping_away)}</FinaleRef> <span className="fm-range">sleep away from home</span></dd></div>
            <div><dt>Half have arrived</dt><dd><FinaleRef sources={R('ne-roads', 'walking-speed', 'fhwa')} calculated>Day {S.half_day}</FinaleRef></dd></div>
            <div><dt>Last arrival</dt><dd><FinaleRef sources={R('ne-roads', 'walking-speed', 'fhwa')} calculated>Day {fmtInt(S.last_day)}</FinaleRef></dd></div>
          </dl>
        </div>
      </div>
      <div className="table-scroll" role="region" aria-label="The counters on four days, table" tabIndex={0}>
        <table className="fm-table">
          <caption>The four counters at the end of four days of the march (people)</caption>
          <thead>
            <tr><th scope="col">Day</th><th scope="col">Gone from home</th><th scope="col">On the road</th><th scope="col">Waiting at a full road</th><th scope="col">Arrived in Washington</th></tr>
          </thead>
          <tbody>
            {S.key_days.map((d) => (
              <tr key={d.day}>
                <th scope="row">Day {fmtInt(d.day)}</th>
                <td>{fmtPeople(d.gone)}</td>
                <td>{fmtPeople(d.on_road)}</td>
                <td>{fmtPeople(d.waiting)}</td>
                <td>{fmtPeople(d.arrived)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fm-caveat"><strong>Estimates, not forecasts.</strong> {S.estimate_note}</p>
    </section>
  )
}

/** The long description and the data tables (W3C complex-image pattern). */
export function FinaleTextVersion() {
  const peak = S.peak_night
  const ex = Object.entries(S.examples)
  const ms = Object.entries(S.milestones)
  return (
    <details id="text-version" className="text-version fm-text">
      <summary>Text version</summary>
      <div className="measure">
        <p>
          This map is a simulation. It imagines that on one morning every adult in the United States who has survived contact sexual
          violence, about {fmtPeople(S.totals.central)} people (range {fmtPeople(S.totals.low)} to {fmtPeople(S.totals.high)}), leaves
          home and walks to Washington, D.C. Each of the {fmtInt(S.dots)} dots stands for {fmtInt(S.people_per_dot)} invented people placed
          in a real home county; no real survivor is shown, tracked or named.
        </p>
        <p>
          At {fmtInt(S.walk.start_hour)}:00 on Day 1 everyone leaves. Walkers follow real roads at their own pace and rest one day a week;
          where a road is full they wait. On the busiest night, Day {peak.day}, {fmtPeople(peak.people_sleeping_away)} people sleep away
          from home and need about {fmtPeople(peak.water_litres)} litres of water, {fmtInt(peak.toilets)} toilets and{' '}
          {fmtNum(peak.shelter_km2, 0)} km² of shelter. In {fmtInt(S.counties_outnumbered)} counties, marchers outnumber residents on
          their busiest day. Half of all marchers have arrived by Day {S.half_day}; the last arrives on Day {fmtInt(S.last_day)}. Standing
          together they need {fmtNum(S.space.all_arrived_standing_km2, 0)} km², about{' '}
          {fmtNum(S.space.all_arrived_standing_km2 / S.space.national_mall_km2, 0)} times the National Mall, which is full by Day{' '}
          {S.space.mall_full_standing_on_day}. People from the West take {fmtNum(S.west_ne_ratio, 1)} times as long as people from the
          Northeast.
        </p>
      </div>

      <h3>How many of each kind of worker would be gone</h3>
      <div className="table-scroll" role="region" aria-label="Jobs left undone, table" tabIndex={0}>
        <table className="fm-table">
          <caption>Share of each job gone (national; {S.jobs_method})</caption>
          <thead><tr><th scope="col">Job</th><th scope="col">Share gone</th><th scope="col">Range</th><th scope="col">Workers gone</th></tr></thead>
          <tbody>
            {S.jobs.map((j) => (
              <tr key={j.job}>
                <th scope="row">{j.job}</th>
                <td>{pct(j.share)}</td>
                <td>{pct(j.low)} to {pct(j.high)}</td>
                <td>{fmtPeople(j.workers)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>How long the walk takes from eight places</h3>
      <div className="table-scroll" role="region" aria-label="Arrival by place, table" tabIndex={0}>
        <table className="fm-table">
          <caption>Arrival day by home place (median, and first to last)</caption>
          <thead><tr><th scope="col">Home</th><th scope="col">Median arrival</th><th scope="col">First to last</th><th scope="col">Median walk</th></tr></thead>
          <tbody>
            {ex.map(([place, e]) => (
              <tr key={place}>
                <th scope="row">{place}</th>
                <td>Day {fmtInt(dayOf(e.median_arrival_day))}</td>
                <td>Day {fmtInt(dayOf(e.first))} to {fmtInt(dayOf(e.last))}</td>
                <td>{e.median_walk_km > 0 ? `${fmtInt(e.median_walk_km)} km` : 'flies'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>When each share of the marchers has arrived</h3>
      <div className="table-scroll" role="region" aria-label="Arrival milestones, table" tabIndex={0}>
        <table className="fm-table">
          <thead><tr><th scope="col">Share arrived</th><th scope="col">By day</th></tr></thead>
          <tbody>
            {ms.map(([share, day]) => (
              <tr key={share}><th scope="row">{share}</th><td>Day {fmtInt(day)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

/** How the numbers were made, the routing method and its measured error, and who is missing. */
export function FinaleMethod() {
  const r = S.routing
  return (
    <section className="fm-method" aria-labelledby="method-heading">
      <h2 id="method-heading">How the numbers were made</h2>
      <p>
        <strong>Who marches.</strong> Adults who report lifetime contact sexual violence in the CDC&rsquo;s National Intimate Partner and
        Sexual Violence Survey 2023/2024, state by state <FinaleRef sources={R('cdc-nisvs')}>{''}</FinaleRef>, split among counties by
        population <FinaleRef sources={R('jhu-csse')}>{''}</FinaleRef>. The range comes from the CDC&rsquo;s 95% confidence intervals.
        Adult totals and the share of all adults use Census Vintage 2025 <FinaleRef sources={R('census-v2025')}>{''}</FinaleRef>.
      </p>
      <p>
        <strong>Who is missing.</strong> People in institutions and people experiencing homelessness (outside the survey), transgender and
        nonbinary survivors (the survey reports women and men only), child survivors, and Puerto Rico and the territories. The true number is
        likely higher: about {fmtPeople(S.if_all_adults)} if the same rates applied to every adult.
      </p>
      <p>
        <strong>How they travel.</strong> On foot on real roads <FinaleRef sources={R('ne-roads')}>{''}</FinaleRef>, about 20 km a day
        (12 to 30) <FinaleRef sources={R('walking-speed')}>{''}</FinaleRef>, walking {fmtInt(S.walk.hours)} hours from{' '}
        {fmtInt(S.walk.start_hour)}:00 and resting one day a week. A road carries at most 4,500 people per hour per metre of width{' '}
        <FinaleRef sources={R('fhwa')}>{''}</FinaleRef>; walkers wait when it is full. Hawaii has no land route, so its{' '}
        {fmtInt(r.dots_flying_hawaii * S.people_per_dot)} walkers fly. Alaska&rsquo;s route runs through Canada. Arriving means
        reaching {fmtInt(S.walk.arrival_zone_km)} km from the National Mall.
      </p>
      <h3>The routing method, and how far off it is</h3>
      <p>
        Routes run on the {r.network}: one shortest-path tree from the National Mall that every walker follows from the nearest mapped
        road, so routes that share roads merge into corridors. This network is coarser than a street map. How far off that makes it:
      </p>
      <ul>
        <li>Route length is a median <span className="num">{fmtNum(r.route_ratio_median, RATIO_DIGITS)}</span> times the straight-line distance (10th to 90th percentile {fmtNum(r.route_ratio_p10, RATIO_DIGITS)} to {fmtNum(r.route_ratio_p90, RATIO_DIGITS)}). The network smooths curves and leaves out small roads, so walks are probably a little too short and arrivals a little early.</li>
        <li>The first leg, from home to the nearest mapped road, is drawn straight: median {fmtNum(r.connector_km_median, KM_DIGITS)} km, 95th percentile {fmtNum(r.connector_km_p95, KM_DIGITS)} km. {fmtInt(r.dots_connector_over_50km)} dots start more than 50 km from a mapped road, mostly in roadless Alaska.</li>
        <li>{fmtInt(r.dots_route_ratio_over_1_6)} dots have routes more than 1.6 times the straight line, all near the Mall or on the Delmarva Peninsula, where the road must go around the Chesapeake Bay.</li>
        <li>Corridors are coarser than real streets, so crowding where roads merge is probably overstated. Crowding is checked once a day for each road stretch.</li>
      </ul>
      <p>
        <strong>What each night needs.</strong> {fmtNum(S.needs.water_litres, 0)} litres of water per person{' '}
        <FinaleRef sources={R('sphere')}>{''}</FinaleRef>, 1 toilet per {fmtNum(S.needs.people_per_toilet, 0)} people{' '}
        <FinaleRef sources={R('sanitation')}>{''}</FinaleRef>, {fmtNum(S.needs.shelter_m2, 1)} m² of shelter per person{' '}
        <FinaleRef sources={R('sphere')}>{''}</FinaleRef>; the National Mall is {fmtNum(S.space.national_mall_km2, 2)} km²{' '}
        <FinaleRef sources={R('mall')}>{''}</FinaleRef>. Jobs: {S.jobs_method} <FinaleRef sources={R('bls-cps11', 'cdc-nisvs')}>{''}</FinaleRef>
      </p>
      <p className="fm-caveat">
        <strong>Estimates, not forecasts.</strong> {S.uncertainty}
      </p>
    </section>
  )
}

/** The finale's sources, numbered like the day pages' lists (ids match the [n] links). */
export function FinaleSources() {
  return (
    <section className="sources-panel" aria-labelledby="sources-heading" id="sources">
      <h2 id="sources-heading">Sources for the march</h2>
      <p className="sources-confidence">
        Every walker is invented and every number is a model estimate built from these published totals. Retrieved November 18, 2026.
      </p>
      <ol className="sources-list">
        {FINALE_SOURCES.map((s) => (
          <li key={s.id} id={`source-${s.id}`}>
            <span className="src-outlet">{s.outlet}</span>.{' '}
            <a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>.{' '}
            <span className="src-date">{s.date}</span>. <span className="muted">Used for: {s.used_for}.</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

