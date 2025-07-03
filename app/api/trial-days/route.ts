
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const trialDays = await prisma.trialDay.findMany({
      orderBy: {
        trialDayNumber: 'asc'
      }
    })

    return NextResponse.json(trialDays)
  } catch (error) {
    console.error('Error fetching trial days:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trial days' },
      { status: 500 }
    )
  }
}
