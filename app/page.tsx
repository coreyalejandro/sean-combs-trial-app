
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import ParallaxTimeline from '@/components/parallax-timeline'
import { Skeleton } from '@/components/ui/skeleton'

async function getTrialDays() {
  try {
    const trialDays = await prisma.trialDay.findMany({
      orderBy: {
        trialDayNumber: 'asc'
      }
    })
    return trialDays
  } catch (error) {
    console.error('Error fetching trial days:', error)
    return []
  }
}

function TimelineLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <Skeleton className="h-16 w-96 mx-auto mb-6" />
        <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
      </div>
      <div className="space-y-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`w-full max-w-md ${i % 2 === 0 ? 'mr-12' : 'ml-12'}`}>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function HomePage() {
  const trialDays = await getTrialDays()

  if (trialDays.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            No trial data available
          </h1>
          <p className="text-muted-foreground">
            Please check back later or contact support if this issue persists.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<TimelineLoading />}>
      <ParallaxTimeline trialDays={trialDays} />
    </Suspense>
  )
}
