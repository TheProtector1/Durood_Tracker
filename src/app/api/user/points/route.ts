import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { awardPoints, getUserPoints, redeemReward } from '@/lib/points'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const points = await getUserPoints(session.user.id)
    return NextResponse.json({ points })
  } catch (error) {
    console.error('Get user points error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, amount, description, rewardId, rewardName } = body

    if (action === 'award') {
      if (!amount || !description) {
        return NextResponse.json({ error: 'Amount and description required' }, { status: 400 })
      }

      const newPoints = await awardPoints(session.user.id, {
        type: 'durood',
        amount,
        description
      })

      return NextResponse.json({ points: newPoints })
    }

    if (action === 'redeem') {
      if (!rewardId || !rewardName) {
        return NextResponse.json({ error: 'Reward ID and name required' }, { status: 400 })
      }

      // For now, we'll handle redemption directly
      // In a real app, you'd have a rewards database
      const cost = getRewardCost(rewardId)
      if (!cost) {
        return NextResponse.json({ error: 'Invalid reward' }, { status: 400 })
      }

      const success = await redeemReward(session.user.id, cost, rewardName)
      if (!success) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
      }

      const remainingPoints = await getUserPoints(session.user.id)
      return NextResponse.json({ success: true, points: remainingPoints })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Update user points error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getRewardCost(rewardId: string): number | null {
  // This should match the rewards in the rewards page
  const costs: Record<string, number> = {
    'custom_dua': 500,
    'premium_features': 300,
    'exclusive_content': 200,
    'prayer_mat': 1500,
    'quran_book': 2000,
    'tasbih': 800,
    'dua_ceremony': 1000,
    'name_in_prayers': 250
  }

  return costs[rewardId] || null
}
