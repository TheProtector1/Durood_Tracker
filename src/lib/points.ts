import { prisma } from './prisma'

export interface PointsAward {
  type: 'durood' | 'prayer' | 'goal_completion' | 'timer_session' | 'achievement' | 'daily_spin'
  amount: number
  description: string
}

// Award points to a user
export async function awardPoints(userId: string, award: PointsAward): Promise<number> {
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

    // Calculate new points
    const newPoints = userLevel.points + award.amount

    // Calculate new level based on points
    const newLevel = Math.min(5, Math.floor(newPoints / 1000) + 1)
    const newTitle = getLevelTitle(newLevel)

    // Update user level
    const updatedLevel = await prisma.userLevel.update({
      where: { userId },
      data: {
        points: newPoints,
        level: newLevel,
        title: newTitle
      }
    })

    console.log(`Awarded ${award.amount} points to user ${userId} for ${award.description}. Total: ${newPoints}`)

    return newPoints
  } catch (error) {
    console.error('Error awarding points:', error)
    throw new Error('Failed to award points')
  }
}

// Get user points
export async function getUserPoints(userId: string): Promise<number> {
  try {
    const userLevel = await prisma.userLevel.findUnique({
      where: { userId }
    })

    return userLevel?.points || 0
  } catch (error) {
    console.error('Error getting user points:', error)
    return 0
  }
}


// Get level title based on level number
function getLevelTitle(level: number): string {
  const titles = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum']
  return titles[level - 1] || 'Bronze'
}

// Check if user can afford a reward
export async function canAffordReward(userId: string, cost: number): Promise<boolean> {
  const points = await getUserPoints(userId)
  return points >= cost
}

// Deduct points for reward redemption
export async function redeemReward(userId: string, cost: number, rewardName: string): Promise<boolean> {
  try {
    const canAfford = await canAffordReward(userId, cost)
    if (!canAfford) {
      return false
    }

    const userLevel = await prisma.userLevel.findUnique({
      where: { userId }
    })

    if (!userLevel) {
      return false
    }

    const newPoints = userLevel.points - cost

    await prisma.userLevel.update({
      where: { userId },
      data: { points: newPoints }
    })

    // Log the redemption (you might want to create a redemption history table)
    console.log(`User ${userId} redeemed ${rewardName} for ${cost} points. Remaining: ${newPoints}`)

    return true
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return false
  }
}
