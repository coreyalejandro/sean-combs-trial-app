import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Written once at build time to out/trial-days.json (the search box reads it).
export const dynamic = 'force-static'

export async function GET() {
  const trialDays = await prisma.trialDay.findMany({
    orderBy: {
      trialDayNumber: 'asc'
    }
  })

  return NextResponse.json(trialDays)
}
