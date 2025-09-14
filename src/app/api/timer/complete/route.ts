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

    const { duration, completedAt } = await request.json()

    const today = new Date().toISOString().split('T')[0]

    // Find the most recent incomplete timer session for today
    const timerSession = await prisma.goalTimerSession.findFirst({
      where: {
        userId: session.user.id,
        date: today,
        completed: false
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

    if (!timerSession) {
      return NextResponse.json({ error: 'No active timer session found' }, { status: 404 })
    }

    // Update the session as completed
    const updatedSession = await prisma.goalTimerSession.update({
      where: { id: timerSession.id },
      data: {
        completed: true,
        completedAt: completedAt ? new Date(completedAt) : new Date()
      }
    })

    // Award points for completing the timer (+20 points)
    await updateUserPoints(session.user.id, 20)

    return NextResponse.json({ timerSession: updatedSession }, { status: 200 })
  } catch (error) {
    console.error('Timer complete error:', error)
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
