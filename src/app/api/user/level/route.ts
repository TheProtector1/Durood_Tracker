import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevelFromPoints } from '@/lib/points'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userLevel = await prisma.userLevel.findUnique({
      where: { userId: session.user.id }
    })

    // Create user level if it doesn't exist
    if (!userLevel) {
      userLevel = await prisma.userLevel.create({
        data: { userId: session.user.id }
      })
    }

    return NextResponse.json(userLevel)
  } catch (error) {
    console.error('Get user level error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update user level (for admin or special cases)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { points, jumuahBadge } = await request.json()

    let userLevel = await prisma.userLevel.findUnique({
      where: { userId: session.user.id }
    })

    if (!userLevel) {
      userLevel = await prisma.userLevel.create({
        data: { userId: session.user.id }
      })
    }

    // Calculate new level based on points
    const currentPoints = points !== undefined ? points : userLevel.points
    const newLevel = calculateLevelFromPoints(currentPoints)
    const newTitle = getLevelTitle(newLevel)

    const updatedLevel = await prisma.userLevel.update({
      where: { userId: session.user.id },
      data: {
        points: currentPoints,
        level: newLevel,
        title: newTitle,
        jumuahBadge: jumuahBadge !== undefined ? jumuahBadge : userLevel.jumuahBadge
      }
    })

    return NextResponse.json(updatedLevel)
  } catch (error) {
    console.error('Update user level error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getLevelTitle(level: number): string {
  const titles = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum']
  return titles[level - 1] || 'Bronze'
}
