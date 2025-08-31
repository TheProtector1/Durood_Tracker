import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { differenceInDays, parseISO, format, subDays } from 'date-fns'
import { getPakistanDate, getPakistanDateRange, isUTCDateOnPakistanDate } from '@/lib/timezone'

// Calculate streak for a user using Pakistan timezone
async function calculateUserStreak(userId: string, referencePakistanDate: string): Promise<number> {
  try {
    // Get all durood entries for the user, ordered by date descending
    // Note: dates in database are already in Pakistan timezone format (YYYY-MM-DD)
    const entries = await prisma.duroodEntry.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' }
    })

    if (entries.length === 0) return 0

    // Parse the reference Pakistan date
    const referenceDate = parseISO(referencePakistanDate)

    // Get current Pakistan date for comparison
    const currentPakistanDate = getPakistanDate()
    const currentDate = parseISO(currentPakistanDate)

    // Use the reference date, but don't go beyond today
    const effectiveDate = referenceDate > currentDate ? currentDate : referenceDate

    // Find entries that are on or before the effective date
    // Since dates are stored as Pakistan dates, we can compare them directly
    const validEntries = entries
      .filter(entry => {
        const entryDate = parseISO(entry.date)
        return entryDate <= effectiveDate
      })
      .map(entry => entry.date) // Keep as string format for easier comparison

    if (validEntries.length === 0) return 0

    // Calculate streak from the most recent valid entry backwards
    let streak = 0
    const currentEntryDate = validEntries[0] // Most recent entry date

    // Check if the most recent entry is for today or yesterday
    const mostRecentDate = parseISO(currentEntryDate)
    const daysDifference = differenceInDays(effectiveDate, mostRecentDate)

    // If the most recent entry is today or yesterday, start streak at 1
    if (daysDifference <= 1) {
      streak = 1

      // Count consecutive days backwards
      for (let i = 1; i < validEntries.length; i++) {
        const currentDate = parseISO(validEntries[i - 1])
        const prevDate = parseISO(validEntries[i])
        const expectedPrevDate = subDays(currentDate, 1)

        // Check if this date is exactly one day before the current date
        if (differenceInDays(expectedPrevDate, prevDate) === 0) {
          streak++
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
    const dateParam = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Use Pakistan date for business logic
    const pakistanDate = dateParam || getPakistanDate()

    // Get rankings for the specified Pakistan date
    const rankings = await prisma.dailyRanking.findMany({
      where: { date: pakistanDate },
      orderBy: { rank: 'asc' },
      take: limit
    })

    let finalDate = pakistanDate
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
