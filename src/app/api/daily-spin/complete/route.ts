import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Get today's goal
    const dailySpin = await prisma.dailySpin.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    })

    if (!dailySpin) {
      return NextResponse.json({ error: 'No daily goal set' }, { status: 404 })
    }

    if (dailySpin.completed) {
      return NextResponse.json({ message: 'Goal already completed' }, { status: 200 })
    }

    // Get today's durood count
    const todayEntry = await prisma.duroodEntry.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    })

    const currentCount = todayEntry?.count || 0

    // Check if goal is completed
    if (currentCount >= dailySpin.goal) {
      // Mark goal as completed
      const updatedSpin = await prisma.dailySpin.update({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today
          }
        },
        data: {
          completed: true
        }
      })

      // Award bonus points for completing goal (+50 points)
      await updateUserPoints(session.user.id, 50)

      return NextResponse.json({
        completed: true,
        spin: updatedSpin,
        bonusPoints: 50
      }, { status: 200 })
    }

    return NextResponse.json({
      completed: false,
      currentCount,
      target: dailySpin.goal,
      remaining: dailySpin.goal - currentCount
    }, { status: 200 })

  } catch (error) {
    console.error('Goal completion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateUserPoints(userId: string, points: number) {
  try {
    let userLevel = await prisma.userLevel.findUnique({
      where: { userId }
    })

    if (!userLevel) {
      userLevel = await prisma.userLevel.create({
        data: { userId }
      })
    }

    const newPoints = userLevel.points + points
    const newLevel = Math.min(5, Math.floor(newPoints / 1000) + 1)

    await prisma.userLevel.update({
      where: { userId },
      data: {
        points: newPoints,
        level: newLevel,
        title: getLevelTitle(newLevel)
      }
    })
  } catch (error) {
    console.error('Error updating user points:', error)
  }
}

function getLevelTitle(level: number): string {
  const titles = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum']
  return titles[level - 1] || 'Bronze'
}
