#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'

// Test streak calculation
async function testStreakCalculation() {
  console.log('🔥 Testing Streak Calculation...\n')

  try {
    // Get all users with their durood entries
    const users = await prisma.user.findMany({
      include: {
        duroodEntries: {
          select: {
            date: true,
            count: true
          },
          orderBy: { date: 'desc' }
        }
      }
    })

    console.log(`Found ${users.length} users\n`)

    // Test streak calculation for first few users
    for (const user of users.slice(0, 5)) {
      if (user.duroodEntries.length > 0) {
        const dates = user.duroodEntries.map(entry => entry.date).sort()
        console.log(`👤 ${user.username || user.email}:`)
        console.log(`   Entries: ${user.duroodEntries.length}`)
        console.log(`   Date range: ${dates[0]} to ${dates[dates.length - 1]}`)
        console.log(`   Recent dates: ${dates.slice(-5).join(', ')}`)

        // Simple streak calculation
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        const hasToday = user.duroodEntries.some(entry => entry.date === today)
        const hasYesterday = user.duroodEntries.some(entry => entry.date === yesterday)

        console.log(`   Today (${today}): ${hasToday ? '✅' : '❌'}`)
        console.log(`   Yesterday (${yesterday}): ${hasYesterday ? '✅' : '❌'}`)
        console.log()
      }
    }

    console.log('🎉 Streak calculation test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testStreakCalculation()
