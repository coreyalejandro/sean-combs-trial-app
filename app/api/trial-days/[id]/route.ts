
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid trial day ID' },
        { status: 400 }
      )
    }

    const trialDay = await prisma.trialDay.findFirst({
      where: {
        trialDayNumber: id
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

    if (!trialDay) {
      return NextResponse.json(
        { error: 'Trial day not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(trialDay)
  } catch (error) {
    console.error('Error fetching trial day:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trial day' },
      { status: 500 }
    )
  }
}
