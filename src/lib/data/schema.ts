// zod schema for src/data/trial_days.json and the scaffold's shared tables.
// Used by tests (tests/unit/data.test.ts), not at runtime.
import { z } from 'zod'

export const confidenceSchema = z.enum(['high', 'medium', 'low'])

export const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  outlet: z.string().min(1),
  url: z.string().url(),
  date: z.string().min(1),
  note: z.string(),
  opened_this_pass: z.boolean(),
})

export const numberSchema = z.object({
  value: z.union([z.number(), z.string()]),
  unit: z.string(),
  what: z.string().min(1),
  source: z.string(),
  outlets: z.array(z.string()),
  confidence: confidenceSchema,
})

const dayConfidence = z.object({ level: confidenceSchema, summary: z.string() })

export const daySchema = z.object({
  day: z.number().int().min(1).max(28),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekday: z.string(),
  summary: z.string().min(1),
  witnesses: z.array(z.object({
    order: z.union([z.number(), z.string()]),
    name: z.string().min(1),
    role: z.string().optional(),
    exam: z.string().optional(),
  })),
  exhibits: z.array(z.string()),
  numbers: z.array(numberSchema),
  locations: z.array(z.string()),
  people: z.array(z.string()),
  legal_events: z.array(z.string()),
  sources: z.array(sourceSchema).min(1),
  discrepancies: z.array(z.string()),
  single_sourced: z.array(z.string()),
  key_points: z.array(z.string()),
  viz_ideas: z.array(z.string()),
  outlet_families: z.array(z.string()),
  confidence: dayConfidence,
  day_label: z.string(),
  verification_note: z.string().optional(),
  alt_day_labels: z.array(z.string()).optional(),
  calendar_note: z.string().optional(),
})

export const verdictSchema = z.object({
  title: z.string(),
  case: z.string(),
  content_note: z.string(),
  summary: z.string(),
  phases: z.array(z.object({
    date: z.string(),
    label: z.string(),
    facts: z.array(z.string()),
    confidence: confidenceSchema,
  })),
  numbers: z.array(numberSchema),
  discrepancies: z.array(z.string()),
  single_sourced: z.array(z.string()),
  viz_ideas: z.array(z.string()),
  sources: z.array(sourceSchema).min(1),
  verification_note: z.string(),
  outlet_families: z.array(z.string()),
  confidence: dayConfidence,
  day: z.literal('verdict'),
})

export const trialDataSchema = z.object({
  case: z.string(),
  numbering_rule: z.string(),
  days: z.array(daySchema).length(28),
  verdict: verdictSchema,
})

export const chargeSchema = z.object({
  count: z.number().int().min(1).max(5),
  short: z.string(),
  plain: z.string(),
  person: z.string().nullable(),
  outcome: z.enum(['guilty', 'not guilty']),
  source_ids: z.array(z.string()).min(1),
})

export const witnessRecordSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  pseudonym: z.boolean(),
  raw_names: z.array(z.string()).min(1),
  first_day: z.number().int().min(1).max(28),
  days: z.array(z.number().int().min(1).max(28)).min(1),
  group: z.enum(['named-in-charges', 'described-harm', 'eyewitness', 'former-staff', 'police-and-agents', 'records-and-analysis', 'expert']),
  role: z.string(),
  immunity: z.boolean(),
})

/**
 * Facts a day's builder needs that trial_days.json lacks. Lives in src/viz/day-NN/additions.json,
 * owned by that day's builder. Every item needs at least one source with a URL.
 * A builder may LOWER a confidence, never raise it: "high" needs two or more distinct outlets.
 */
export const additionSourceSchema = z.object({
  outlet: z.string().min(1),
  outlet_family: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  date: z.string().min(1),
})

export const additionItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['number', 'event', 'place', 'exhibit', 'note']),
  text: z.string().min(1),
  value: z.union([z.number(), z.string()]).optional(),
  unit: z.string().optional(),
  date: z.string().optional(),
  from_days: z.array(z.number().int().min(1).max(28)).min(1),
  confidence: confidenceSchema,
  sources: z.array(additionSourceSchema).min(1),
}).refine(
  (item) => item.confidence !== 'high' || new Set(item.sources.map((s) => s.outlet_family)).size >= 2,
  { message: '"high" confidence needs sources from two or more outlet families' },
)

export const additionsFileSchema = z.object({
  day: z.number().int().min(1).max(28),
  items: z.array(additionItemSchema),
})
