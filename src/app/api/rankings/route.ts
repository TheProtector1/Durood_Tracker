import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get daily rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get rankings for the specified date
    const rankings = await prisma.dailyRanking.findMany({
      where: { date },
      orderBy: { rank: 'asc' },
      take: limit
    })

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
        return NextResponse.json({
          date: mostRecentRanking.date,
          rankings: recentRankings,
          note: 'Showing most recent available rankings'
        })
      }
    }

    return NextResponse.json({
      date,
      rankings,
      total: rankings.length
    })
  } catch (error) {
    console.error('Get rankings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
