// Every src/viz/day-NN/additions.json is valid: each added fact has sources with URLs, and
// "high" confidence needs two or more outlet families (builders may lower confidence, never raise it).
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { additionsFileSchema } from '@/lib/data/schema'

const vizRoot = path.resolve(__dirname, '../../src/viz')
const dirs = fs.readdirSync(vizRoot).filter((d) => /^day-\d\d$/.test(d))

describe('additions.json files', () => {
  it('one per day folder', () => expect(dirs).toHaveLength(28))
  for (const d of dirs) {
    it(`${d}/additions.json is valid`, () => {
      const json = JSON.parse(fs.readFileSync(path.join(vizRoot, d, 'additions.json'), 'utf8'))
      const parsed = additionsFileSchema.safeParse(json)
      if (!parsed.success) console.error(d, parsed.error.issues)
      expect(parsed.success).toBe(true)
      expect(json.day).toBe(Number(d.slice(4)))
    })
  }
})
