// Reader-facing text must never show research or AI process notes ("read in an earlier research pass",
// "RESOLVED -", "care rule 2", "Daily output paused: not computed", file names). This scans every built page
// in out/ (text a reader can see or hear: visible text, aria-label, title and alt) and lists every hit.
// Used by tests/e2e/public-text.spec.ts; also runnable on its own after a build: npm run check:public-text
import fs from 'node:fs'
import path from 'node:path'

/** Phrases that only make sense to the people who made the site. Each is [pattern, why]. */
export const PROCESS_PHRASES: Array<[RegExp, string]> = [
  [/research pass|this pass\b|earlier pass|re-?opened\b/i, 'research-pass note'],
  [/\bRESOLVED\b|\bCONFLICT\b|\bREJECTED\b/, 'research verdict label'],
  [/\b(?:LOW|MEDIUM|HIGH)\b/, 'raw confidence code'],
  [/\brated (?:low|medium|high)\b|\bkept\b[^.]{0,40}\bas (?:low|medium|high)\b|\bDecision:/i, 'research decision'],
  [/care rule|this project does not chart/i, 'internal rule name'],
  [/fetch tool|\binferred\b|retrieved sources|\bnot opened\b|was not opened|were not opened/i, 'tool or retrieval note'],
  [/output paused|not computed|not built yet|could not be reached|build machines?\b/i, 'build status note'],
  [/this file set|research file|research notes?\b|day records?\b|record of this opening|see key points/i, 'reference to internal files'],
  [/single[- ]sourced?\b|per one outlet|name unverified|unverified:/i, 'sourcing note'],
  [/\brcna\d+|\b[\w-]+\.(?:json|md|tsx?|py)\b/i, 'file name or internal id'],
  [/later article wins|intentionally omitted|not argued|no specifics|sources differ|probably counting|\betc\./i, 'research shorthand'],
  [/quoted words not shown/i, 'over-redaction marker'],
  [/\bTODO\b|\bFIXME\b|draft copy|\bbuilders?\b|\bAI[- ]generated\b/i, 'work-in-progress note'],
  [/\b\d{1,2}:\d{2}\s?(?:AM|PM)\s(?:PDT|PST|GMT|UTC)\b/i, 'tool time zone'],
  [/\b\d,\d{3} (?:year|date)\b|\b([a-z]{3,}) \1\b/i, 'formatting fault (year with a comma, doubled word)'],
]

/** Text a reader can see or hear on a page: text nodes (no scripts or styles) plus aria-label, title and alt values. */
export function readerText(html: string): string[] {
  const noCode = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  const attrs = [...noCode.matchAll(/\s(?:aria-label|title|alt)="([^"]*)"/gi)].map((m) => m[1])
  const text = noCode.replace(/<[^>]+>/g, '\n')
  const decode = (s: string) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’')
  return decode([text, ...attrs].join('\n')).split('\n').map((l) => l.trim()).filter(Boolean)
}

export interface Hit { why: string; match: string; line: string }

export function scanHtml(html: string): Hit[] {
  const hits: Hit[] = []
  for (const line of readerText(html)) {
    for (const [re, why] of PROCESS_PHRASES) {
      const m = line.match(re)
      if (m) hits.push({ why, match: m[0], line: line.slice(0, 200) })
    }
  }
  return hits
}

export function builtPages(outDir: string): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { if (e.name !== '_next') walk(full) }
      else if (e.name.endsWith('.html')) out.push(full)
    }
  }
  walk(outDir)
  return out.sort()
}

if (/public-text\.ts$/.test(process.argv[1] ?? '')) {
  const outDir = path.resolve(process.argv[2] || 'out')
  let total = 0
  for (const f of builtPages(outDir)) {
    for (const h of scanHtml(fs.readFileSync(f, 'utf8'))) {
      total++
      console.log(`${path.relative(outDir, f)}: [${h.why}] "${h.match}" in: ${h.line}`)
    }
  }
  console.log(total ? `${total} process notes found` : 'No process notes found')
  process.exit(total ? 1 : 0)
}
