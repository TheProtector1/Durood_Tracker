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

    // Get all durood entries for the specified date, ordered by count descending
    const duroodEntries = await prisma.duroodEntry.findMany({
      where: { date: pakistanDate },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: { count: 'desc' }
    })

    let finalDate = pakistanDate
    let finalEntries = duroodEntries
    let note: string | undefined

    // If no entries for today, get the most recent available date
    if (duroodEntries.length === 0) {
      const mostRecentEntry = await prisma.duroodEntry.findFirst({
        orderBy: { date: 'desc' }
      })

      if (mostRecentEntry) {
        const recentEntries = await prisma.duroodEntry.findMany({
          where: { date: mostRecentEntry.date },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          },
          orderBy: { count: 'desc' },
          take: limit
        })
        finalDate = mostRecentEntry.date
        finalEntries = recentEntries
        note = 'Showing most recent available rankings'
      }
    }

    // Convert entries to rankings format and calculate streaks
    const rankingsWithStreaks = await Promise.all(
      finalEntries.slice(0, limit).map(async (entry, index) => {
        const streak = await calculateUserStreak(entry.user.id, finalDate)

        return {
          id: entry.id,
          date: entry.date,
          username: entry.user.username,
          displayName: entry.user.displayName,
          count: entry.count,
          rank: index + 1,
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
