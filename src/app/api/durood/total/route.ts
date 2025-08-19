import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const result = await prisma.duroodEntry.aggregate({
      _sum: { count: true }
    })
    const total = result._sum.count || 0
    return NextResponse.json({ total })
  } catch (error) {
    console.error('Get total durood error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


