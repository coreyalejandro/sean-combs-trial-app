
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import TrialDayDetail from '@/components/trial-day-detail'
import { Skeleton } from '@/components/ui/skeleton'

async function getTrialDay(id: string) {
  try {
    const dayNumber = parseInt(id)
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 28) {
      return null
    }

    const trialDay = await prisma.trialDay.findFirst({
      where: {
        trialDayNumber: dayNumber
      },
      include: {
        testimonies: {
          include: {
            witness: true
          }
        },
        evidence: true
      }
    })

    return trialDay
  } catch (error) {
    console.error('Error fetching trial day:', error)
    return null
  }
}

async function getAllTrialDays() {
  try {
    const trialDays = await prisma.trialDay.findMany({
      select: {
        id: true,
        trialDayNumber: true,
        headlineTitle: true,
        date: true
      },
      orderBy: {
        trialDayNumber: 'asc'
      }
    })
    return trialDays
  } catch (error) {
    console.error('Error fetching all trial days:', error)
    return []
  }
}

function TrialDayLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-6 w-48 mb-8" />
      <Skeleton className="h-64 w-full mb-8" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export async function generateStaticParams() {
  return Array.from({ length: 28 }, (_, i) => ({
    id: (i + 1).toString(),
  }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const trialDay = await getTrialDay(params.id)
  
  if (!trialDay) {
    return {
      title: 'Trial Day Not Found',
      description: 'The requested trial day could not be found.'
    }
  }

  return {
    title: `Trial Day ${trialDay.trialDayNumber} - ${trialDay.headlineTitle}`,
    description: trialDay.headlineSummary.substring(0, 160) + '...',
    openGraph: {
      title: `Trial Day ${trialDay.trialDayNumber} - The Combs Trial`,
      description: trialDay.headlineSummary.substring(0, 160) + '...',
      type: 'article',
    }
  }
}

export default async function TrialDayPage({ params }: { params: { id: string } }) {
  const [trialDay, allTrialDays] = await Promise.all([
    getTrialDay(params.id),
    getAllTrialDays()
  ])

  if (!trialDay) {
    notFound()
  }

  return (
    <Suspense fallback={<TrialDayLoading />}>
      <TrialDayDetail trialDay={trialDay} allTrialDays={allTrialDays} />
    </Suspense>
  )
}
