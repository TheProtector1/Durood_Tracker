#!/usr/bin/env tsx

import { prisma } from '../src/lib/prisma'
import { differenceInDays, parseISO, subDays } from 'date-fns'

// Test streak breaking logic
async function testStreakBreaking() {
  console.log('🔥 Testing Streak Breaking Logic...\n')

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

    // Test each user's streak calculation
    for (const user of users.slice(0, 5)) {
      if (user.duroodEntries.length > 0) {
        console.log(`👤 ${user.username || user.email}:`)

        // Sort entries by date (newest first)
        const sortedEntries = [...user.duroodEntries].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        console.log(`   Total entries: ${sortedEntries.length}`)
        console.log(`   Date range: ${sortedEntries[sortedEntries.length - 1].date} to ${sortedEntries[0].date}`)

        // Test streak calculation
        const streak = calculateStreakTest(sortedEntries)
        console.log(`   Calculated streak: ${streak} days`)

        // Show recent entries to verify
        console.log('   Recent entries:')
        sortedEntries.slice(0, 7).forEach((entry, index) => {
          const isToday = entry.date === new Date().toISOString().split('T')[0]
          const isYesterday = entry.date === new Date(Date.now() - 86400000).toISOString().split('T')[0]
          console.log(`     ${index + 1}. ${entry.date} - ${entry.count} ${isToday ? '(TODAY)' : isYesterday ? '(YESTERDAY)' : ''}`)
        })

        console.log()
      }
    }

    console.log('🎉 Streak breaking test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Test streak calculation function (similar to home page logic)
function calculateStreakTest(entries: Array<{ date: string; count: number }>): number {
  if (entries.length === 0) return 0

  let streak = 0
  let currentDate = new Date()

  // Check if today has an entry
  const today = currentDate.toISOString().split('T')[0]
  const todayEntry = entries.find(entry => entry.date === today)

  if (todayEntry && todayEntry.count > 0) {
    streak = 1
    currentDate = subDays(currentDate, 1) // Move to yesterday
  }

  // Count consecutive days backwards
  for (let i = 0; i < 365; i++) { // Limit to 1 year to prevent infinite loop
    const dateStr = currentDate.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === dateStr)

    if (entry && entry.count > 0) {
      streak++
      currentDate = subDays(currentDate, 1)
    } else {
      // No entry for this day - streak should break
      console.log(`   ❌ Streak broken: No entry for ${dateStr}`)
      break
    }
  }

  return streak
}

testStreakBreaking()
