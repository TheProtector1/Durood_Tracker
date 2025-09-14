import { prisma } from './prisma'

// Initialize the total counter if it doesn't exist
export async function initializeTotalCounter(): Promise<void> {
  try {
    const existingCounter = await prisma.totalCounter.findFirst()
    if (!existingCounter) {
      // Calculate current total from existing entries
      const result = await prisma.duroodEntry.aggregate({
        _sum: { count: true }
      })
      const currentTotal = result._sum.count || 0

      await prisma.totalCounter.create({
        data: { total: currentTotal }
      })
    }
  } catch (error) {
    console.error('Initialize total counter error:', error)
  }
}

// Get the current total efficiently
export async function getCurrentTotal(): Promise<number> {
  try {
    const counter = await prisma.totalCounter.findFirst()
    return counter?.total || 0
  } catch (error) {
    console.error('Get current total error:', error)
    return 0
  }
}

// Update total counter atomically
export async function updateTotalCounter(delta: number): Promise<number> {
  try {
    // First try to find existing counter
    let counter = await prisma.totalCounter.findUnique({
      where: { id: 'global' }
    })

    if (counter) {
      // Update existing counter
      counter = await prisma.totalCounter.update({
        where: { id: 'global' },
        data: {
          total: counter.total + delta,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new counter
      counter = await prisma.totalCounter.create({
        data: {
          id: 'global',
          total: delta
        }
      })
    }

    return counter.total
  } catch (error) {
    console.error('Update total counter error:', error)
    return 0
  }
}

// Reset total counter (useful for maintenance)
export async function resetTotalCounter(): Promise<void> {
  try {
    const result = await prisma.duroodEntry.aggregate({
      _sum: { count: true }
    })
    const actualTotal = result._sum.count || 0

    await prisma.totalCounter.upsert({
      where: { id: 'global' },
      update: {
        total: actualTotal,
        updatedAt: new Date()
      },
      create: {
        id: 'global',
        total: actualTotal
      }
    })
  } catch (error) {
    console.error('Reset total counter error:', error)
  }
}
