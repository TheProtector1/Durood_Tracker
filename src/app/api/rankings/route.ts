import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { differenceInDays, parseISO, format, subDays } from 'date-fns'

// Calculate streak for a user
async function calculateUserStreak(userId: string, referenceDate: string): Promise<number> {
  try {
    // Get all durood entries for the user, ordered by date descending
    const entries = await prisma.duroodEntry.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' }
    })

    if (entries.length === 0) return 0

    // Convert dates to Date objects and sort ascending for streak calculation
    const entryDates = entries
      .map(entry => parseISO(entry.date))
      .sort((a, b) => a.getTime() - b.getTime())

    const referenceDateObj = parseISO(referenceDate)
    const today = new Date()

    // If the reference date is in the future, use today's date
    const effectiveDate = referenceDateObj > today ? today : referenceDateObj

    // Find the most recent entry that is on or before the effective date
    const validEntries = entryDates.filter(date => date <= effectiveDate)

    if (validEntries.length === 0) return 0

    // Calculate streak from the most recent valid entry backwards
    let streak = 0
    let currentDate = validEntries[validEntries.length - 1]

    // Check if the most recent entry is within the last day from effective date
    if (differenceInDays(effectiveDate, currentDate) <= 1) {
      streak = 1

      // Count consecutive days backwards
      for (let i = validEntries.length - 2; i >= 0; i--) {
        const prevDate = validEntries[i]
        const expectedPrevDate = subDays(currentDate, 1)

        // Check if this date is exactly one day before the current date
        if (differenceInDays(expectedPrevDate, prevDate) === 0) {
          streak++
          currentDate = prevDate
        } else {
          // Gap found, break
          break
        }
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating streak for user:', userId, error)
    return 0
  }
}

// Get daily rankings with streak information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get rankings for the specified date
    const rankings = await prisma.dailyRanking.findMany({
      where: { date },
      orderBy: { rank: 'asc' },
      take: limit
    })

    let finalDate = date
    let finalRankings = rankings
    let note: string | undefined

    // If no rankings for today, get the most recent available date
    if (rankings.length === 0) {
      const mostRecentRanking = await prisma.dailyRanking.findFirst({
        orderBy: { date: 'desc' }
      })

      if (mostRecentRanking) {
        const recentRankings = await prisma.dailyRanking.findMany({
          where: { date: mostRecentRanking.date },
          orderBy: { rank: 'asc' },
          take: limit
        })
        finalDate = mostRecentRanking.date
        finalRankings = recentRankings
        note = 'Showing most recent available rankings'
      }
    }

    // Calculate streaks for each user in the rankings
    const rankingsWithStreaks = await Promise.all(
      finalRankings.map(async (ranking) => {
        // Get user ID from the ranking (we need to find the user by username)
        const user = await prisma.user.findFirst({
          where: { username: ranking.username },
          select: { id: true }
        })

        let streak = 0
        if (user) {
          streak = await calculateUserStreak(user.id, finalDate)
        }

        return {
          ...ranking,
          streak
        }
      })
    )

    return NextResponse.json({
      date: finalDate,
      rankings: rankingsWithStreaks,
      total: rankingsWithStreaks.length,
      note
    })
  } catch (error) {
    console.error('Get rankings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
