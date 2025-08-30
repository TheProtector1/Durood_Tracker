import { prisma } from './prisma'

// Optimized ranking update that only updates affected rankings
export async function updateDailyRankingsOptimized(date: string): Promise<void> {
  try {
    // Get all entries for the date with user info in one query
    const entries = await prisma.duroodEntry.findMany({
      where: { date },
      include: {
        user: {
          select: {
            username: true,
            displayName: true
          }
        }
      }
    })

    if (entries.length === 0) {
      // No entries for this date, delete any existing rankings
      await prisma.dailyRanking.deleteMany({
        where: { date }
      })
      return
    }

    // Get existing rankings for comparison
    const existingRankings = await prisma.dailyRanking.findMany({
      where: { date },
      select: {
        userId: true,
        count: true,
        rank: true
      }
    })

    // Create rankings data sorted by count
    const rankingsData = entries
      .map(entry => ({
        date,
        userId: entry.userId,
        username: entry.user.username,
        displayName: entry.user.displayName,
        count: entry.count,
        rank: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

    // Create a map of existing rankings for quick lookup
    const existingRankingsMap = new Map(
      existingRankings.map(r => [r.userId, r])
    )

    // Separate into operations: create, update, delete
    const toCreate: typeof rankingsData = []
    const toUpdate: typeof rankingsData = []

    for (const ranking of rankingsData) {
      const existing = existingRankingsMap.get(ranking.userId)
      if (!existing) {
        toCreate.push(ranking)
      } else if (existing.count !== ranking.count || existing.rank !== ranking.rank) {
        toUpdate.push(ranking)
      }
    }

    // Find rankings to delete (users who no longer have entries for this date)
    const newUserIds = new Set(rankingsData.map(r => r.userId))
    const toDelete = existingRankings
      .filter(r => !newUserIds.has(r.userId))
      .map(r => r.userId)

    // Execute operations in transaction for consistency
    await prisma.$transaction(async (tx) => {
      // Delete rankings for users who no longer have entries
      if (toDelete.length > 0) {
        await tx.dailyRanking.deleteMany({
          where: {
            date,
            userId: { in: toDelete }
          }
        })
      }

      // Update existing rankings
      for (const ranking of toUpdate) {
        await tx.dailyRanking.update({
          where: {
            date_userId: {
              date,
              userId: ranking.userId
            }
          },
          data: {
            count: ranking.count,
            rank: ranking.rank,
            username: ranking.username,
            displayName: ranking.displayName
          }
        })
      }

      // Create new rankings
      if (toCreate.length > 0) {
        await tx.dailyRanking.createMany({
          data: toCreate
        })
      }
    })

  } catch (error) {
    console.error('Update daily rankings optimized error:', error)
  }
}

// Legacy function for backward compatibility (can be removed after migration)
export async function updateDailyRankings(date: string): Promise<void> {
  try {
    // Get all entries for the date (one per user)
    const entries = await prisma.duroodEntry.findMany({
      where: { date },
      include: {
        user: {
          select: {
            username: true,
            displayName: true
          }
        }
      }
    })

    const rankingsData = entries
      .map(entry => ({
        date,
        userId: entry.userId,
        username: entry.user.username,
        displayName: entry.user.displayName,
        count: entry.count,
        rank: 0 // Will be set after sorting
      }))
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

    // Delete existing rankings for the date
    await prisma.dailyRanking.deleteMany({
      where: { date }
    })

    // Create new rankings
    if (rankingsData.length > 0) {
      await prisma.dailyRanking.createMany({ data: rankingsData })
    }
  } catch (error) {
    console.error('Update daily rankings error:', error)
  }
}
