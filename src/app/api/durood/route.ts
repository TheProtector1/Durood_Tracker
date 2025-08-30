import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { appEvents } from '@/lib/events'

// Get durood entries for a user (one entry per date)
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
    const userId = session.user.id

    if (date) {
      // Get single entry for specific date
      const entry = await prisma.duroodEntry.findFirst({
        where: {
          userId,
          date
        }
      })
      return NextResponse.json({
        id: date,
        date,
        count: entry?.count || 0
      })
    } else {
      // Get all entries for user (one per date)
      const entries = await prisma.duroodEntry.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          count: true
        }
      })
      return NextResponse.json(entries)
    }
  } catch (error) {
    console.error('Get durood entries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update durood entry (one entry per user per day)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { date, count } = await request.json()
    const userId = session.user.id

    if (!date || !count || count <= 0) {
      return NextResponse.json(
        { error: 'Valid date and count are required' },
        { status: 400 }
      )
    }

    // Find existing entry or create/update
    const existingEntry = await prisma.duroodEntry.findFirst({
      where: {
        userId,
        date
      }
    })

    let entry
    if (existingEntry) {
      // Update existing entry by incrementing count
      entry = await prisma.duroodEntry.update({
        where: { id: existingEntry.id },
        data: {
          count: {
            increment: count
          },
          updatedAt: new Date()
        }
      })
    } else {
      // Create new entry
      entry = await prisma.duroodEntry.create({
        data: {
          userId,
          date,
          count
        }
      })
    }

    // Update daily rankings
    await updateDailyRankings(date)

    // Emit total updated event
    try {
      const result = await prisma.duroodEntry.aggregate({ _sum: { count: true } })
      appEvents.emit('totalUpdated', result._sum.count || 0)
    } catch {}

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Create/update durood entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete durood entry for a given date (should be only one entry per user per date)
export async function DELETE(request: NextRequest) {
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
    const userId = session.user.id

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    await prisma.duroodEntry.deleteMany({
      where: {
        userId,
        date
      }
    })

    // Update daily rankings
    await updateDailyRankings(date)

    // Emit total updated event
    try {
      const result = await prisma.duroodEntry.aggregate({ _sum: { count: true } })
      appEvents.emit('totalUpdated', result._sum.count || 0)
    } catch {}

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Delete durood entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to update daily rankings (one entry per user per date)
async function updateDailyRankings(date: string) {
  try {
    // Get all entries for the date (one per user)
    const entries = await prisma.duroodEntry.findMany({
      where: { date },
      include: {
        user: {
          select: {
            username: true,
            displayName: true
          }
        }
      }
    })

    const rankingsData = entries
      .map(entry => ({
        date,
        userId: entry.userId,
        username: entry.user.username,
        displayName: entry.user.displayName,
        count: entry.count,
        rank: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

    // Delete existing rankings for the date
    await prisma.dailyRanking.deleteMany({
      where: { date }
    })

    // Create new rankings
    if (rankingsData.length > 0) {
      await prisma.dailyRanking.createMany({ data: rankingsData })
    }
  } catch (error) {
    console.error('Update daily rankings error:', error)
  }
}
