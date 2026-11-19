import type { Metadata } from 'next'
import { DayShell } from '@/components/shell/DayShell'
import { getDay, getDayNumbers } from '@/lib/data'
import { getDayModule } from '@/viz/registry'

// Only days 1-28 exist; anything else is a 404 in the static export.
export const dynamicParams = false

export function generateStaticParams() {
  return getDayNumbers().map((n) => ({ n: String(n) }))
}

export function generateMetadata({ params }: { params: { n: string } }): Metadata {
  const n = Number(params.n)
  const { meta } = getDayModule(n)
  const day = getDay(n)
  return { title: `Day ${n}: ${meta.title}`, description: `${meta.question} (${day.date})` }
}

export default function DayPage({ params }: { params: { n: string } }) {
  return <DayShell n={Number(params.n)} />
}
