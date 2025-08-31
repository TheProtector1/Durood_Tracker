import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Get prayer completions for the specified date
    const prayerCompletions = await prisma.prayerCompletion.findMany({
      where: {
        userId: session.user.id,
        date: date
      },
      select: {
        prayerName: true,
        completed: true,
        completedAt: true
      }
    })

    // Convert to a map for easy access
    const prayerStatus: Record<string, { completed: boolean; completedAt?: Date }> = {}
    prayerCompletions.forEach(completion => {
      prayerStatus[completion.prayerName] = {
        completed: completion.completed,
        completedAt: completion.completedAt || undefined
      }
    })

    return NextResponse.json({
      date,
      prayers: prayerStatus
    })

  } catch (error) {
    console.error('Get prayers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { date, prayerName, completed } = await request.json()

    if (!date || !prayerName) {
      return NextResponse.json(
        { error: 'Date and prayerName are required' },
        { status: 400 }
      )
    }

    // Validate prayer name
    const validPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    if (!validPrayers.includes(prayerName.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid prayer name' },
        { status: 400 }
      )
    }

    const prayerData = {
      userId: session.user.id,
      date,
      prayerName: prayerName.toLowerCase(),
      completed: completed ?? false,
      completedAt: completed ? new Date() : null
    }

    // Upsert prayer completion
    const prayerCompletion = await prisma.prayerCompletion.upsert({
      where: {
        userId_date_prayerName: {
          userId: session.user.id,
          date,
          prayerName: prayerName.toLowerCase()
        }
      },
      update: prayerData,
      create: prayerData,
      select: {
        prayerName: true,
        completed: true,
        completedAt: true,
        date: true
      }
    })

    return NextResponse.json({
      message: 'Prayer completion updated successfully',
      prayer: prayerCompletion
    })

  } catch (error) {
    console.error('Update prayer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
