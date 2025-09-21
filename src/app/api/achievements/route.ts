import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Predefined achievements
const ACHIEVEMENTS = [
  // Durood Achievements
  {
    id: 'first_durood',
    name: 'First Durood',
    description: 'Recite your first durood',
    icon: '🤲',
    category: 'durood',
    requirement: 1,
    points: 10,
    rarity: 'common'
  },
  {
    id: 'durood_10',
    name: 'Durood Beginner',
    description: 'Recite 10 duroods',
    icon: '📿',
    category: 'durood',
    requirement: 10,
    points: 25,
    rarity: 'common'
  },
  {
    id: 'durood_100',
    name: 'Durood Enthusiast',
    description: 'Recite 100 duroods',
    icon: '🙏',
    category: 'durood',
    requirement: 100,
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'durood_500',
    name: 'Durood Devotee',
    description: 'Recite 500 duroods',
    icon: '🕋',
    category: 'durood',
    requirement: 500,
    points: 100,
    rarity: 'epic'
  },
  {
    id: 'durood_1000',
    name: 'Durood Master',
    description: 'Recite 1000 duroods',
    icon: '⭐',
    category: 'durood',
    requirement: 1000,
    points: 200,
    rarity: 'legendary'
  },

  // Prayer Achievements
  {
    id: 'first_prayer',
    name: 'First Prayer',
    description: 'Complete your first daily prayer',
    icon: '🕌',
    category: 'prayers',
    requirement: 1,
    points: 15,
    rarity: 'common'
  },
  {
    id: 'prayer_10',
    name: 'Prayer Regular',
    description: 'Complete 10 prayers',
    icon: '🕌',
    category: 'prayers',
    requirement: 10,
    points: 30,
    rarity: 'common'
  },
  {
    id: 'prayer_50',
    name: 'Prayer Devotee',
    description: 'Complete 50 prayers',
    icon: '🕋',
    category: 'prayers',
    requirement: 50,
    points: 75,
    rarity: 'rare'
  },
  {
    id: 'prayer_100',
    name: 'Prayer Champion',
    description: 'Complete 100 prayers',
    icon: '🌙',
    category: 'prayers',
    requirement: 100,
    points: 150,
    rarity: 'epic'
  },
  {
    id: 'prayer_streak_7',
    name: 'Weekly Warrior',
    description: 'Complete all prayers for 7 consecutive days',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    points: 100,
    rarity: 'epic'
  },

  // Goal Achievements
  {
    id: 'first_goal',
    name: 'Goal Setter',
    description: 'Complete your first daily goal',
    icon: '🎯',
    category: 'special',
    requirement: 1,
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'goal_5',
    name: 'Goal Achiever',
    description: 'Complete 5 daily goals',
    icon: '🏆',
    category: 'special',
    requirement: 5,
    points: 125,
    rarity: 'epic'
  },
  {
    id: 'timer_session',
    name: 'Focused Timer',
    description: 'Complete your first timer session',
    icon: '⏰',
    category: 'special',
    requirement: 1,
    points: 25,
    rarity: 'common'
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user stats for achievement checking
    const [duroodEntries, prayerCompletions, goalTimerSessions, userLevel] = await Promise.all([
      prisma.duroodEntry.findMany({
        where: { userId: session.user.id },
        select: { count: true }
      }),
      prisma.prayerCompletion.findMany({
        where: { userId: session.user.id }
      }),
      prisma.goalTimerSession.findMany({
        where: { userId: session.user.id }
      }),
      prisma.userLevel.findUnique({
        where: { userId: session.user.id }
      })
    ])

    // Calculate totals
    const totalDuroods = duroodEntries.reduce((sum, entry) => sum + entry.count, 0)
    const totalPrayers = prayerCompletions.length
    const totalTimerSessions = goalTimerSessions.filter(session => session.completed).length

    // Check user achievements (for now, we'll simulate this with a simple table)
    // In a real app, you'd have a UserAchievement table
    const achievements = ACHIEVEMENTS.map(achievement => {
      let unlocked = false
      let unlockedAt = null

      // Check achievement conditions
      switch (achievement.id) {
        case 'first_durood':
          unlocked = totalDuroods >= 1
          break
        case 'durood_10':
          unlocked = totalDuroods >= 10
          break
        case 'durood_100':
          unlocked = totalDuroods >= 100
          break
        case 'durood_500':
          unlocked = totalDuroods >= 500
          break
        case 'durood_1000':
          unlocked = totalDuroods >= 1000
          break
        case 'first_prayer':
          unlocked = totalPrayers >= 1
          break
        case 'prayer_10':
          unlocked = totalPrayers >= 10
          break
        case 'prayer_50':
          unlocked = totalPrayers >= 50
          break
        case 'prayer_100':
          unlocked = totalPrayers >= 100
          break
        case 'first_goal':
          unlocked = (userLevel?.points || 0) >= 50 // Assuming goals give points
          break
        case 'goal_5':
          unlocked = (userLevel?.points || 0) >= 250 // 5 goals × 50 points
          break
        case 'timer_session':
          unlocked = totalTimerSessions >= 1
          break
        case 'prayer_streak_7':
          // This would require streak calculation logic
          unlocked = false // For now, mark as locked
          break
      }

      // Simulate unlock dates (in a real app, you'd store this)
      if (unlocked && !unlockedAt) {
        unlockedAt = new Date().toISOString()
      }

      return {
        ...achievement,
        unlocked,
        unlockedAt
      }
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
