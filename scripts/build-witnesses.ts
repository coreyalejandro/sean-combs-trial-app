// Builds src/data/shared/witnesses.json (the 34 prosecution witnesses) from trial_days.json.
// Run: npm run build:witnesses   Check only: npm run check:witnesses
// Scaffold-owned. Days on the stand and first day are computed from the day records;
// names, pseudonym flags, groups and immunity are the scaffold's mapping below.
import fs from 'node:fs'
import path from 'node:path'

type Group = 'named-in-charges' | 'described-harm' | 'eyewitness' | 'former-staff' | 'police-and-agents' | 'records-and-analysis' | 'expert'

interface Def { id: string; display: string; role?: string; match: RegExp; group: Group; pseudonym?: boolean; immunity?: boolean }

// Order does not matter; matching is by regex on the raw witness name.
// Group is a provisional editorial grouping for the Day 28 constellation and may be changed by the scaffold owner.
const DEFS: Def[] = [
  { id: 'florez', display: 'Israel Florez', role: 'Security officer at the Los Angeles hotel in March 2016', match: /Florez/, group: 'eyewitness' },
  { id: 'phillip', display: 'Daniel Phillip', role: 'Male dancer who testified he was paid to take part in encounters with Ventura', match: /Daniel Phillip/, group: 'eyewitness' },
  { id: 'ventura', display: 'Cassie Ventura', role: 'Singer and Combs\'s former partner (2007 to 2018); the woman named in Counts 2 and 3', match: /Cassie|Casandra/, group: 'named-in-charges' },
  { id: 'binda', display: 'Yasin Binda', role: 'Homeland Security Investigations special agent', match: /Binda/, group: 'police-and-agents' },
  { id: 'richard', display: 'Dawn Richard', role: 'Singer; former member of Danity Kane and Diddy-Dirty Money', match: /Dawn Richard/, group: 'described-harm' },
  { id: 'morgan', display: 'Kerry Morgan', role: 'Ventura\'s former best friend and roommate', match: /Kerry Morgan/, group: 'eyewitness' },
  { id: 'james', display: 'David James', role: 'Combs\'s personal assistant, 2007 to 2009', match: /David James/, group: 'former-staff' },
  { id: 'regina-ventura', display: 'Regina Ventura', role: 'Cassie Ventura\'s mother', match: /Regina Ventura/, group: 'eyewitness' },
  { id: 'hayes', display: 'Sharay Hayes', role: 'Former male dancer who testified he was paid to take part in encounters with Ventura', match: /Hayes/, group: 'eyewitness' },
  { id: 'gannon', display: 'Gerard Gannon', role: 'Homeland Security Investigations special agent who supervised the March 2024 Miami search', match: /Gannon/, group: 'police-and-agents' },
  { id: 'hughes', display: 'Dr. Dawn Hughes', role: 'Psychologist; prosecution expert on how abuse works in general (she evaluated no one in this case)', match: /Hughes/, group: 'expert' },
  { id: 'kaplan', display: 'George Kaplan', role: 'Combs\'s former assistant (2014 to 2015); testified under an immunity order', match: /Kaplan/, group: 'former-staff', immunity: true },
  { id: 'mescudi', display: 'Kid Cudi (Scott Mescudi)', role: 'Rapper and actor who briefly dated Ventura in 2011', match: /Mescudi|Kid Cudi/, group: 'described-harm' },
  { id: 'morales', display: 'Mylah Morales', role: 'Ventura\'s makeup artist', match: /Morales/, group: 'eyewitness' },
  { id: 'demmour', display: 'Frédéric Zemmour', role: 'General manager of L\'Ermitage, a Beverly Hills hotel', match: /Demmour|Zemmour/, group: 'records-and-analysis' },
  { id: 'croft', display: 'A federal agent (device analysis)', role: 'Federal agent who examined Ventura\'s phones and devices', match: /Croft/, group: 'police-and-agents' },
  { id: 'clark', display: 'Capricorn Clark', role: 'Combs\'s former executive assistant; later Ventura\'s creative director', match: /Capricorn Clark/, group: 'former-staff' },
  { id: 'ignacio', display: 'Christopher Ignacio', role: 'Los Angeles police officer who responded to the 2011 break-in report at Kid Cudi\'s home', match: /Ignacio/, group: 'police-and-agents' },
  { id: 'jimenez', display: 'Lance Jimenez', role: 'Los Angeles Fire Department arson investigator (Kid Cudi\'s car fire)', match: /Jimenez/, group: 'police-and-agents' },
  { id: 'nash', display: 'Deonte Nash', role: 'Stylist for Combs and Ventura (2008 to 2018)', match: /Deonte Nash/, group: 'eyewitness' },
  { id: 'mia', display: 'Mia', match: /'Mia'/, group: 'described-harm', pseudonym: true },
  { id: 'oken', display: 'Sylvia Oken', role: 'Sales and marketing director at the Beverly Hills Hotel', match: /Oken/, group: 'records-and-analysis' },
  { id: 'garcia', display: 'Eddy Garcia', role: 'Former overnight security officer at the Los Angeles hotel; testified under an immunity order', match: /^Eddy Garcia$/, group: 'eyewitness', immunity: true },
  { id: 'ferguson', display: 'Derek Ferguson', role: 'Former finance chief of Combs\'s companies (worked for Combs 1998 to 2017)', match: /Ferguson/, group: 'former-staff' },
  { id: 'piazza', display: 'Frank Piazza', role: 'Video analyst called by the prosecution', match: /Piazza/, group: 'records-and-analysis' },
  { id: 'bongolan', display: 'Bryana Bongolan', role: 'Friend of Ventura; testified under an immunity order', match: /Bongolan/, group: 'described-harm', immunity: true },
  { id: 'santos', display: 'Enrique Santos', role: 'Analyst at the U.S. Attorney\'s Office who extracted phone data', match: /Enrique Santos/, group: 'records-and-analysis' },
  { id: 'jane', display: 'Jane', match: /'Jane'/, group: 'named-in-charges', pseudonym: true },
  { id: 'la-search-agent', display: 'A federal agent (Los Angeles search)', role: 'Homeland Security Investigations agent from the March 2024 search of Combs\'s Los Angeles home', match: /Homeland Security Investigations \(HSI\) special agent/, group: 'police-and-agents' },
  { id: 'perez', display: 'Jonathan Perez', role: 'Combs\'s former personal assistant; testified under an immunity order', match: /Jonathan Perez/, group: 'former-staff', immunity: true },
  { id: 'sankar', display: 'Ananya Sankar', role: 'Paralegal at the U.S. Attorney\'s Office; summary witness on messages and call records', match: /Sankar/, group: 'records-and-analysis' },
  { id: 'penland', display: 'DeLeassa Penland', role: 'Special agent; summary witness on flight records', match: /Penland/, group: 'police-and-agents' },
  { id: 'paul', display: 'Brendan Paul', role: 'Combs\'s former personal assistant; testified under an immunity order', match: /Brendan Paul/, group: 'former-staff', immunity: true },
  { id: 'cerciello', display: 'Joseph Cerciello', role: 'Homeland Security Investigations special agent; summary witness and the prosecution\'s last witness', match: /Cerciello/, group: 'police-and-agents' },
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
    role: def.pseudonym ? (def.id === 'mia' ? 'Former assistant (pseudonym)' : 'Former girlfriend of Combs (pseudonym)') : def.role ?? role,
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
