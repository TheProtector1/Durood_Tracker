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

    const { duration, startedAt } = await request.json()

    const today = new Date().toISOString().split('T')[0]

    const timerSession = await prisma.goalTimerSession.create({
      data: {
        userId: session.user.id,
        date: today,
        duration: duration || 300,
        startedAt: startedAt ? new Date(startedAt) : new Date()
      }
    })

    return NextResponse.json({ timerSession }, { status: 201 })
  } catch (error) {
    console.error('Timer start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
