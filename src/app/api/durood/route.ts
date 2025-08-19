import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { appEvents } from '@/lib/events'

// Get durood entries for a user (aggregated per date)
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
      // Aggregate entries for specific date
      const result = await prisma.duroodEntry.aggregate({
        where: { userId, date },
        _sum: { count: true }
      })
      return NextResponse.json({
        id: date,
        date,
        count: result._sum.count || 0
      })
    } else {
      // Get aggregated entries per day for user
      const grouped = await prisma.duroodEntry.groupBy({
        by: ['date'],
        where: { userId },
        _sum: { count: true },
        orderBy: { date: 'desc' }
      })
      const entries = grouped.map(g => ({ id: g.date, date: g.date, count: g._sum.count || 0 }))
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

// Create durood entry (multiple entries per day allowed)
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

    // Create a new entry (allow multiple per day)
    const entry = await prisma.duroodEntry.create({
      data: { userId, date, count }
    })

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

// Delete all durood entries for a given date
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
      where: { userId, date }
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

// Function to update daily rankings (aggregate multiple entries per user)
async function updateDailyRankings(date: string) {
  try {
    // Aggregate entries per user for the date
    const grouped = await prisma.duroodEntry.groupBy({
      by: ['userId'],
      where: { date },
      _sum: { count: true }
    })

    const userIds = grouped.map(g => g.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, displayName: true }
    })
    const userById = new Map(users.map(u => [u.id, u]))

    const rankingsData = grouped
      .map(g => ({
        userId: g.userId,
        count: g._sum.count || 0,
        username: userById.get(g.userId)?.username || 'user',
        displayName: userById.get(g.userId)?.displayName || null
      }))
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => ({
        date,
        userId: entry.userId,
        username: entry.username,
        displayName: entry.displayName,
        count: entry.count,
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
