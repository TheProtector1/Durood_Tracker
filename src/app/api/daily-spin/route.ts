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

    const { goal } = await request.json()
    if (!goal || goal < 1 || goal > 10000) {
      return NextResponse.json({ error: 'Invalid goal value' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    // Check if user already has a goal today
    const existingSpin = await prisma.dailySpin.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    })

    if (existingSpin) {
      // Update existing goal if different
      if (existingSpin.goal !== goal) {
        const updatedSpin = await prisma.dailySpin.update({
          where: {
            userId_date: {
              userId: session.user.id,
              date: today
            }
          },
          data: {
            goal: goal,
            completed: false // Reset completion when goal changes
          }
        })
        return NextResponse.json({ spin: updatedSpin }, { status: 200 })
      }
      return NextResponse.json({ spin: existingSpin }, { status: 200 })
    }

    // Create new goal
    const spin = await prisma.dailySpin.create({
      data: {
        userId: session.user.id,
        date: today,
        goal: goal
      }
    })

    // Update user points (+10 for setting goal)
    await updateUserPoints(session.user.id, 10)

    return NextResponse.json({ spin }, { status: 201 })
  } catch (error) {
    console.error('Daily goal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateUserPoints(userId: string, points: number) {
  try {
    // Get or create user level
    let userLevel = await prisma.userLevel.findUnique({
      where: { userId }
    })

    if (!userLevel) {
      userLevel = await prisma.userLevel.create({
        data: { userId }
      })
    }

    // Update points
    const newPoints = userLevel.points + points
    const newLevel = Math.min(5, Math.floor(newPoints / 1000) + 1) // Level up every 1000 points

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
