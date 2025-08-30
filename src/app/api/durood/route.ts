import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { appEvents } from '@/lib/events'
import { updateTotalCounter, getCurrentTotal } from '@/lib/counter'
import { updateDailyRankingsOptimized } from '@/lib/rankings'

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

// Create or update durood entry (one entry per user per day) - OPTIMIZED
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

    let entry
    let totalDelta = 0

    // Use transaction for atomic operation
    await prisma.$transaction(async (tx) => {
      // Find existing entry
      const existingEntry = await tx.duroodEntry.findFirst({
        where: {
          userId,
          date
        }
      })

      if (existingEntry) {
        // Update existing entry by incrementing count
        entry = await tx.duroodEntry.update({
          where: { id: existingEntry.id },
          data: {
            count: {
              increment: count
            },
            updatedAt: new Date()
          }
        })
        totalDelta = count // Only increment by the added amount
      } else {
        // Create new entry
        entry = await tx.duroodEntry.create({
          data: {
            userId,
            date,
            count
          }
        })
        totalDelta = count // Add the full count
      }
    })

    // Update total counter efficiently
    const newTotal = await updateTotalCounter(totalDelta)

    // Emit total updated event with the new total
    appEvents.emit('totalUpdated', newTotal)

    // Update daily rankings asynchronously (don't block response)
    updateDailyRankingsOptimized(date).catch(error => {
      console.error('Async ranking update error:', error)
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Create/update durood entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete durood entry for a given date (should be only one entry per user per date) - OPTIMIZED
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

    let deletedCount = 0

    // Use transaction to get the count before deletion
    await prisma.$transaction(async (tx) => {
      // Get the entry to be deleted for count calculation
      const entryToDelete = await tx.duroodEntry.findFirst({
        where: {
          userId,
          date
        }
      })

      if (entryToDelete) {
        deletedCount = entryToDelete.count

        // Delete the entry
        await tx.duroodEntry.deleteMany({
          where: {
            userId,
            date
          }
        })
      }
    })

    // Update total counter if we actually deleted something
    if (deletedCount > 0) {
      const newTotal = await updateTotalCounter(-deletedCount)
      appEvents.emit('totalUpdated', newTotal)
    }

    // Update daily rankings asynchronously (don't block response)
    updateDailyRankingsOptimized(date).catch(error => {
      console.error('Async ranking update error:', error)
    })

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Delete durood entry error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


