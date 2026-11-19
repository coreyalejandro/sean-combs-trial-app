// Builds src/data/shared/witnesses.json (the 34 prosecution witnesses) from trial_days.json.
// Run: npm run build:witnesses   Check only: npm run check:witnesses
// Scaffold-owned. Days on the stand and first day are computed from the day records;
// names, pseudonym flags, groups and immunity are the scaffold's mapping below.
import fs from 'node:fs'
import path from 'node:path'

type Group = 'named-in-charges' | 'described-harm' | 'eyewitness' | 'former-staff' | 'police-and-agents' | 'records-and-analysis' | 'expert'

interface Def { id: string; display: string; match: RegExp; group: Group; pseudonym?: boolean; immunity?: boolean }

// Order does not matter; matching is by regex on the raw witness name.
// Group is a provisional editorial grouping for the Day 28 constellation and may be changed by the scaffold owner.
const DEFS: Def[] = [
  { id: 'florez', display: 'Israel Florez', match: /Florez/, group: 'eyewitness' },
  { id: 'phillip', display: 'Daniel Phillip', match: /Daniel Phillip/, group: 'eyewitness' },
  { id: 'ventura', display: 'Cassie Ventura', match: /Cassie|Casandra/, group: 'named-in-charges' },
  { id: 'binda', display: 'Yasin Binda', match: /Binda/, group: 'police-and-agents' },
  { id: 'richard', display: 'Dawn Richard', match: /Dawn Richard/, group: 'described-harm' },
  { id: 'morgan', display: 'Kerry Morgan', match: /Kerry Morgan/, group: 'eyewitness' },
  { id: 'james', display: 'David James', match: /David James/, group: 'former-staff' },
  { id: 'regina-ventura', display: 'Regina Ventura', match: /Regina Ventura/, group: 'eyewitness' },
  { id: 'hayes', display: 'Sharay Hayes', match: /Hayes/, group: 'eyewitness' },
  { id: 'gannon', display: 'Gerard Gannon', match: /Gannon/, group: 'police-and-agents' },
  { id: 'hughes', display: 'Dr. Dawn Hughes', match: /Hughes/, group: 'expert' },
  { id: 'kaplan', display: 'George Kaplan', match: /Kaplan/, group: 'former-staff', immunity: true },
  { id: 'mescudi', display: 'Kid Cudi (Scott Mescudi)', match: /Mescudi|Kid Cudi/, group: 'described-harm' },
  { id: 'morales', display: 'Mylah Morales', match: /Morales/, group: 'eyewitness' },
  { id: 'demmour', display: 'Frédéric Demmour', match: /Demmour|Zemmour/, group: 'records-and-analysis' },
  { id: 'croft', display: 'Federal agent (Josh Croft, per one outlet)', match: /Croft/, group: 'police-and-agents' },
  { id: 'clark', display: 'Capricorn Clark', match: /Capricorn Clark/, group: 'former-staff' },
  { id: 'ignacio', display: 'Christopher Ignacio', match: /Ignacio/, group: 'police-and-agents' },
  { id: 'jimenez', display: 'Lance Jimenez', match: /Jimenez/, group: 'police-and-agents' },
  { id: 'nash', display: 'Deonte Nash', match: /Deonte Nash/, group: 'eyewitness' },
  { id: 'mia', display: 'Mia', match: /'Mia'/, group: 'described-harm', pseudonym: true },
  { id: 'oken', display: 'Sylvia Oken', match: /Oken/, group: 'records-and-analysis' },
  { id: 'garcia', display: 'Eddy Garcia', match: /^Eddy Garcia$/, group: 'eyewitness', immunity: true },
  { id: 'ferguson', display: 'Derek Ferguson', match: /Ferguson/, group: 'former-staff' },
  { id: 'piazza', display: 'Frank Piazza', match: /Piazza/, group: 'records-and-analysis' },
  { id: 'bongolan', display: 'Bryana Bongolan', match: /Bongolan/, group: 'described-harm', immunity: true },
  { id: 'santos', display: 'Enrique Santos', match: /Enrique Santos/, group: 'records-and-analysis' },
  { id: 'jane', display: 'Jane', match: /'Jane'/, group: 'named-in-charges', pseudonym: true, immunity: true },
  { id: 'la-search-agent', display: 'Federal agent (Los Angeles search; name unverified)', match: /Homeland Security Investigations \(HSI\) special agent/, group: 'police-and-agents' },
  { id: 'perez', display: 'Jonathan Perez', match: /Jonathan Perez/, group: 'former-staff', immunity: true },
  { id: 'sankar', display: 'Ananya Sankar', match: /Sankar/, group: 'records-and-analysis' },
  { id: 'penland', display: 'DeLeassa Penland', match: /Penland/, group: 'police-and-agents' },
  { id: 'paul', display: 'Brendan Paul', match: /Brendan Paul/, group: 'former-staff', immunity: true },
  { id: 'cerciello', display: 'Joseph Cerciello', match: /Cerciello/, group: 'police-and-agents' },
]

const root = path.resolve(__dirname, '..')
const dataPath = path.join(root, 'src/data/trial_days.json')
const outPath = path.join(root, 'src/data/shared/witnesses.json')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

const rows = DEFS.map((def) => ({ def, raw: new Set<string>(), days: new Set<number>(), role: '' }))
const unmatched: string[] = []

for (const day of data.days) {
  for (const w of day.witnesses) {
    // "Eddy Garcia (expected next)" on Day 14 did not testify that day.
    if (/expected next/.test(w.name)) continue
    const hits = rows.filter((r) => r.def.match.test(w.name))
    if (hits.length !== 1) { unmatched.push(`Day ${day.day}: ${w.name} (${hits.length} matches)`); continue }
    const r = hits[0]
    r.raw.add(w.name)
    r.days.add(day.day)
    if (!r.role && w.role) r.role = w.role
  }
}

const witnesses = rows.map(({ def, raw, days, role }) => {
  const d = [...days].sort((a, b) => a - b)
  return {
    id: def.id,
    display_name: def.display,
    pseudonym: Boolean(def.pseudonym),
    raw_names: [...raw],
    first_day: d[0],
    days: d,
    group: def.group,
    role: def.pseudonym ? (def.id === 'mia' ? 'Former assistant (pseudonym)' : 'Former girlfriend of Combs (pseudonym)') : role,
    immunity: Boolean(def.immunity),
  }
}).sort((a, b) => a.first_day - b.first_day)

const problems = [...unmatched, ...witnesses.filter((w) => w.days.length === 0).map((w) => `No days for ${w.id}`)]
if (witnesses.length !== 34) problems.push(`Expected 34 witnesses, got ${witnesses.length}`)
if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}

const out = JSON.stringify({
  _note: 'Generated by scripts/build-witnesses.ts from src/data/trial_days.json. Do not edit by hand.',
  witnesses,
}, null, 2) + '\n'

if (process.argv.includes('--check')) {
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : ''
  if (current !== out) { console.error('witnesses.json is out of date: run npm run build:witnesses'); process.exit(1) }
  console.log('witnesses.json is up to date (34 witnesses)')
} else {
  fs.writeFileSync(outPath, out)
  console.log(`wrote ${outPath} (${witnesses.length} witnesses)`)
}
