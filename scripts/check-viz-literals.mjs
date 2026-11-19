#!/usr/bin/env node
// No hard-coded numbers in visualizations (DESIGN_29, Tests 3). Best effort, using the TypeScript parser.
//
// 1. Code files in src/viz/day-*/ (not meta.ts, not tests):
//    - numeric literals other than -1, 0, 1, 2 fail (put layout constants in src/lib/viz/layout.ts);
//    - strings, template text and JSX text that contain a number found in trial_days.json fail
//      ("$100,000", "100000", "$100K", "2016-03-05"), except "Day N" references.
// 2. meta.ts copy (title, caption, ...): every number written in a string must exist somewhere in the data,
//    so copy can mention figures but cannot invent them. Numeric literals only for `day` and `contentLevel`.
// 3. additions.json is data, not code: validated by tests/unit/additions.test.ts instead.
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const vizRoot = path.join(root, 'src/viz')
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/trial_days.json'), 'utf8'))
const additions = fs.readdirSync(vizRoot).filter((d) => /^day-\d\d$/.test(d))
  .map((d) => path.join(vizRoot, d, 'additions.json')).filter((f) => fs.existsSync(f))
  .map((f) => JSON.parse(fs.readFileSync(f, 'utf8')))

const ALLOWED = new Set([-1, 0, 1, 2])

// ---- every number that appears anywhere in the data (values and text) ----
const dataNumbers = new Set()
const dateStrings = new Set()
function harvest(v) {
  if (typeof v === 'number') dataNumbers.add(v)
  else if (typeof v === 'string') {
    for (const m of v.matchAll(/\d{4}-\d{2}-\d{2}/g)) dateStrings.add(m[0])
    for (const n of numbersIn(v)) dataNumbers.add(n)
  } else if (Array.isArray(v)) v.forEach(harvest)
  else if (v && typeof v === 'object') Object.values(v).forEach(harvest)
}
/** Numbers written in text: "100,000" -> 100000, "$100K" -> 100000, "$1.2 million" -> 1200000, "36-48" -> 36, 48 */
function numbersIn(text) {
  const out = []
  const re = /(\d[\d,]*(?:\.\d+)?)\s*(k|K|million|billion|m\b|M\b)?/g
  for (const m of text.matchAll(re)) {
    let n = Number(m[1].replace(/,/g, ''))
    if (Number.isNaN(n)) continue
    const mult = (m[2] || '').toLowerCase()
    if (mult === 'k') n *= 1e3
    else if (mult === 'million' || mult === 'm') n *= 1e6
    else if (mult === 'billion') n *= 1e9
    out.push(n)
  }
  return out
}
harvest(data)
// "high-signal" data values for code scanning: the structured values, not every number in prose.
const valueNumbers = new Set()
for (const d of data.days) for (const n of d.numbers) {
  if (typeof n.value === 'number') valueNumbers.add(n.value)
  else numbersIn(n.value).forEach((x) => valueNumbers.add(x))
}
for (const n of data.verdict.numbers) {
  if (typeof n.value === 'number') valueNumbers.add(n.value)
  else numbersIn(String(n.value)).forEach((x) => valueNumbers.add(x))
}
for (const a of additions) harvest(a)

const errors = []
const rel = (f) => path.relative(root, f)
const lineOf = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1

function stripDayRefs(text) {
  return text.replace(/\bDays?\s+\d+(\s*(and|to|,)\s*\d+)*/g, '').replace(/\bD\d+\b/g, '').replace(/\bday-\d\d\b/g, '')
}

function checkTextAgainstData(text, file, line, mode) {
  const t = stripDayRefs(text)
  for (const d of t.matchAll(/\d{4}-\d{2}-\d{2}/g)) {
    if (mode === 'code' && dateStrings.has(d[0])) errors.push(`${file}:${line} date "${d[0]}" is a data value typed by hand; read it from the data`)
  }
  for (const n of numbersIn(t.replace(/\d{4}-\d{2}-\d{2}/g, ''))) {
    if (ALLOWED.has(n)) continue
    if (mode === 'code' && valueNumbers.has(n)) errors.push(`${file}:${line} text contains ${n}, a value from trial_days.json; read it from the data`)
    if (mode === 'meta' && !dataNumbers.has(n)) errors.push(`${file}:${line} copy mentions ${n}, which is not in the data (add it to additions.json with a source, or remove it)`)
  }
}

function scan(file, mode) {
  const src = fs.readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const visit = (node) => {
    if (ts.isNumericLiteral(node)) {
      let value = Number(node.text)
      const parent = node.parent
      if (parent && ts.isPrefixUnaryExpression(parent) && parent.operator === ts.SyntaxKind.MinusToken) value = -value
      const prop = parent && ts.isPropertyAssignment(parent) ? parent.name.getText(sf) : null
      const okMeta = mode === 'meta' && (prop === 'day' || prop === 'contentLevel' || (parent && ts.isArrayLiteralExpression(parent) && parent.parent && ts.isPropertyAssignment(parent.parent) && parent.parent.name.getText(sf) === 'counts'))
      if (!ALLOWED.has(value) && !okMeta) {
        errors.push(`${rel(file)}:${lineOf(sf, node)} numeric literal ${node.text}${mode === 'code' ? ' (use data, or a constant from src/lib/viz/layout.ts)' : ''}`)
      }
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const p = node.parent
      const isImport = p && (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || (ts.isCallExpression(p) && p.expression.getText(sf) === 'require'))
      const isAttrName = p && ts.isJsxAttribute(p) && ['className', 'id', 'href', 'd', 'viewBox', 'key', 'data-testid'].includes(p.name.getText(sf))
      if (!isImport && !isAttrName) checkTextAgainstData(node.text, rel(file), lineOf(sf, node), mode)
    } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      checkTextAgainstData(node.text, rel(file), lineOf(sf, node), mode)
    } else if (ts.isJsxText(node)) {
      checkTextAgainstData(node.text, rel(file), lineOf(sf, node), mode)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name) && !/\.test\.|\.spec\./.test(entry.name)) {
      scan(full, entry.name === 'meta.ts' ? 'meta' : 'code')
    }
  }
}

const dayDirs = fs.readdirSync(vizRoot).filter((d) => /^day-\d\d$/.test(d))
for (const d of dayDirs) walk(path.join(vizRoot, d))

if (errors.length) {
  console.error(`check-viz-literals: ${errors.length} problem(s)\n` + errors.map((e) => '  ' + e).join('\n'))
  process.exit(1)
}
console.log(`check-viz-literals: ${dayDirs.length} day folders clean (no hand-typed data numbers; copy numbers traceable to the data)`)
