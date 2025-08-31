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
    const limit = parseInt(searchParams.get('limit') || '30')

    let prayerCompletions

    if (date) {
      // Get prayer completions for a specific date
      prayerCompletions = await prisma.prayerCompletion.findMany({
        where: {
          userId: session.user.id,
          date: date
        },
        select: {
          date: true,
          prayerName: true,
          completed: true,
          completedAt: true
        },
        orderBy: { completedAt: 'desc' }
      })
    } else {
      // Get prayer completion history (last N days)
      prayerCompletions = await prisma.prayerCompletion.findMany({
        where: {
          userId: session.user.id
        },
        select: {
          date: true,
          prayerName: true,
          completed: true,
          completedAt: true
        },
        orderBy: [
          { date: 'desc' },
          { completedAt: 'desc' }
        ],
        take: limit
      })
    }

    // Group by date for better organization
    const groupedByDate: Record<string, Array<{
      prayerName: string
      completed: boolean
      completedAt: Date | null
    }>> = {}

    prayerCompletions.forEach(completion => {
      if (!groupedByDate[completion.date]) {
        groupedByDate[completion.date] = []
      }
      groupedByDate[completion.date].push({
        prayerName: completion.prayerName,
        completed: completion.completed,
        completedAt: completion.completedAt
      })
    })

    // Calculate completion statistics based on 5 prayers per day
    const stats = {
      totalDays: Object.keys(groupedByDate).length,
      totalPrayers: prayerCompletions.length,
      completedPrayers: prayerCompletions.filter(p => p.completed).length,
      averageCompletionRate: 0,
      perfectDays: 0,
      totalPossiblePrayers: 0,
      actualCompletedPrayers: 0
    }

    // Calculate completion rate based on 5 prayers per day
    const totalPossiblePrayersPerDay = 5

    Object.values(groupedByDate).forEach(dayPrayers => {
      stats.totalPossiblePrayers += 5 // 5 prayers per day

      // Count how many prayers were actually completed on this day
      const completedOnThisDay = dayPrayers.filter(p => p.completed).length
      stats.actualCompletedPrayers += completedOnThisDay

      // Check if this was a perfect day (all 5 prayers completed)
      if (completedOnThisDay === 5) {
        stats.perfectDays++
      }
    })

    // Calculate average completion rate: actual completed / total possible
    if (stats.totalPossiblePrayers > 0) {
      stats.averageCompletionRate = Math.round((stats.actualCompletedPrayers / stats.totalPossiblePrayers) * 100)
    }

    return NextResponse.json({
      history: groupedByDate,
      stats: stats
    })

  } catch (error) {
    console.error('Get prayer history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
