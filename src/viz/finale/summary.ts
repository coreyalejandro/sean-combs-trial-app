// The finale's numbers for the server-rendered page (text version, static summary, verdict hand-over).
// All values come from summary.json, written by prep/prepare_finale_data.py from the migration-map
// build's own outputs. Nothing here is typed by hand except the source list (titles and links).
import raw from './summary.json'

export interface KeyDay { day: number; gone: number; arrived: number; on_road: number; waiting: number; away_tonight: number }
export interface Job { job: string; share: number; low: number; high: number; workers: number }
export interface Example { median_arrival_day: number; first: number; last: number; median_walk_km: number }

export interface FinaleSummary {
  estimate_note: string
  people_per_dot: number
  dots: number
  totals: { central: number; low: number; high: number }
  share_of_adults: number
  if_all_adults: number
  key_days: KeyDay[]
  half_day: number
  last_day: number
  milestones: Record<string, number>
  jobs: Job[]
  jobs_method: string
  peak_night: { day: number; people_sleeping_away: number; water_litres: number; toilets: number; shelter_km2: number }
  needs: { water_litres: number; people_per_toilet: number; shelter_m2: number }
  counties_outnumbered: number
  road: Record<string, number | string>
  queue: { people_who_waited_at_a_full_road: number; longest_wait_days: number }
  space: { all_arrived_standing_km2: number; all_arrived_sheltered_km2: number; national_mall_km2: number; mall_full_standing_on_day: number; note: string }
  west_ne_ratio: number
  examples: Record<string, Example>
  routing: {
    network: string
    dots_walking: number
    dots_flying_hawaii: number
    connector_km_median: number
    connector_km_p95: number
    dots_connector_over_50km: number
    route_ratio_median: number
    route_ratio_p10: number
    route_ratio_p90: number
    dots_route_ratio_over_1_6: number
    walk_km_max: number
  }
  walk: { start_hour: number; hours: number; arrival_zone_km: number }
  uncertainty: string
  not_computed: { status: string; reason: string }
}

export const summary = raw as unknown as FinaleSummary

export interface FinaleSource { id: string; outlet: string; title: string; url: string; date: string; used_for: string }

/** Where every finale number comes from (migration-map build, data/SOURCES.md and DESIGN_V2.md). */
export const FINALE_SOURCES: FinaleSource[] = [
  { id: 'cdc-nisvs', outlet: 'CDC', title: 'National Intimate Partner and Sexual Violence Survey 2023/2024: Sexual Violence Data Brief (Tables 1, 2, 6 and 7)', url: 'https://www.cdc.gov/nisvs/media/pdfs/sexualviolence-brief.pdf', date: 'December 2025', used_for: 'How many adults have survived contact sexual violence, by state, with 95% confidence intervals' },
  { id: 'census-v2025', outlet: 'U.S. Census Bureau', title: 'Vintage 2025 population estimates: population 18 and over by state', url: 'https://www.census.gov/data/tables/time-series/demo/popest/2020s-state-detail.html', date: 'January 2026', used_for: 'Adults in each state; the share of all adults' },
  { id: 'jhu-csse', outlet: 'Johns Hopkins CSSE (Census Vintage 2019 county totals)', title: 'UID ISO FIPS lookup table', url: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv', date: 'retrieved November 18, 2026', used_for: 'Splitting each state among its counties; county populations for "per resident"' },
  { id: 'bls-cps11', outlet: 'Bureau of Labor Statistics', title: 'Current Population Survey, Table 11: employed people by detailed occupation and sex, 2025', url: 'https://www.bls.gov/cps/cpsaat11.htm', date: '2025 annual averages', used_for: 'The share of each job that would be gone' },
  { id: 'ne-roads', outlet: 'Natural Earth', title: '1:10m Roads, North America supplement', url: 'https://github.com/nvkelso/natural-earth-vector', date: 'retrieved November 18, 2026', used_for: 'The real roads every walker follows' },
  { id: 'us-atlas', outlet: 'us-atlas 3.0.1 (Census cartographic boundaries)', title: 'U.S. state and county outlines as TopoJSON', url: 'https://github.com/topojson/us-atlas', date: 'version 3.0.1', used_for: 'State outlines on the map' },
  { id: 'fhwa', outlet: 'Federal Highway Administration', title: 'Capacity Analysis of Pedestrian and Bicycle Facilities', url: 'https://www.fhwa.dot.gov/publications/research/safety/pedbike/98107/section2.cfm', date: '1998', used_for: 'How many walkers a road can carry (4,500 people per hour per metre of width)' },
  { id: 'walking-speed', outlet: 'Bohannon and Andrews (Physiotherapy, 2011)', title: 'Normal walking speed: a descriptive meta-analysis (table via University of Toronto)', url: 'https://www.physicaltherapy.utoronto.ca/sites/default/files/assets/files/11walking-speed-age-and-sex-specific-normative-values-final.pdf', date: '2011', used_for: 'Walking pace, about 20 km a day (12 to 30)' },
  { id: 'sphere', outlet: 'Sphere', title: 'Water supply standard: access and water quantity; shelter chapter (3.5 m² per person)', url: 'https://sphereprototype.conted.ox.ac.uk/standards/watersupply/accessAndWaterQuantity.html', date: 'opened November 18, 2026', used_for: 'Water and shelter each marcher needs a night' },
  { id: 'sanitation', outlet: 'Wikipedia, citing CDC (secondary)', title: 'Emergency sanitation: about 1 toilet per 50 people', url: 'https://en.wikipedia.org/wiki/Emergency_sanitation', date: 'opened November 18, 2026', used_for: 'Toilets each night' },
  { id: 'mall', outlet: 'Wikipedia (secondary)', title: 'National Mall: 309.2 acres (1.25 km²)', url: 'https://en.wikipedia.org/wiki/National_Mall', date: 'opened November 18, 2026', used_for: 'The space the crowd needs, compared with the Mall' },
]

export function sourceNumber(id: string): number {
  return FINALE_SOURCES.findIndex((s) => s.id === id) + 1
}

export { fmtPeople, fmtInt, pct } from './format'
