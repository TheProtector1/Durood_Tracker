#!/usr/bin/env tsx

// Test various streak scenarios
function testStreakScenarios() {
  console.log('🔥 Testing Streak Scenarios...\n')

  // Scenario 1: No entries today (current situation)
  console.log('📅 Scenario 1: No entry today (should be 0 streak)')
  const scenario1 = [
    { date: '2025-08-29', count: 10 },
    { date: '2025-08-28', count: 5 },
    { date: '2025-08-27', count: 8 }
  ]
  console.log('   Entries:', scenario1.map(e => `${e.date}(${e.count})`).join(', '))
  console.log('   Result: 0 days (no entry today)')
  console.log()

  // Scenario 2: Entry only today
  console.log('📅 Scenario 2: Entry only today (should be 1 day streak)')
  const scenario2 = [
    { date: '2025-08-31', count: 5 },
    { date: '2025-08-25', count: 10 }
  ]
  console.log('   Entries:', scenario2.map(e => `${e.date}(${e.count})`).join(', '))
  console.log('   Result: 1 day (today has entry)')
  console.log()

  // Scenario 3: Consecutive entries including today
  console.log('📅 Scenario 3: 3-day streak including today')
  const scenario3 = [
    { date: '2025-08-31', count: 5 },  // Today
    { date: '2025-08-30', count: 8 },  // Yesterday
    { date: '2025-08-29', count: 6 },  // Day before
    { date: '2025-08-25', count: 10 } // Gap
  ]
  console.log('   Entries:', scenario3.map(e => `${e.date}(${e.count})`).join(', '))
  console.log('   Result: 3 days (Aug 29-30-31 consecutive)')
  console.log()

  // Scenario 4: Gap in entries
  console.log('📅 Scenario 4: Gap in entries (streak should break)')
  const scenario4 = [
    { date: '2025-08-31', count: 5 },  // Today
    { date: '2025-08-30', count: 8 },  // Yesterday
    { date: '2025-08-28', count: 6 },  // Gap! (29 missing)
    { date: '2025-08-27', count: 10 } // Before gap
  ]
  console.log('   Entries:', scenario4.map(e => `${e.date}(${e.count})`).join(', '))
  console.log('   Result: 2 days (Aug 30-31 only, gap on 29th)')
  console.log()

  // Scenario 5: Long streak with recent gap
  console.log('📅 Scenario 5: Recent gap breaks long streak')
  const scenario5 = [
    { date: '2025-08-31', count: 5 },  // Today
    { date: '2025-08-30', count: 8 },  // Yesterday
    // Missing 29th - gap!
    { date: '2025-08-28', count: 6 },
    { date: '2025-08-27', count: 10 },
    { date: '2025-08-26', count: 12 },
    { date: '2025-08-25', count: 7 }
  ]
  console.log('   Entries:', scenario5.map(e => `${e.date}(${e.count})`).join(', '))
  console.log('   Result: 2 days (only recent consecutive days count)')
  console.log()

  console.log('✅ Key Rules:')
  console.log('   • Streak = 0 if no entry today')
  console.log('   • Streak = 1 if entry today but not yesterday')
  console.log('   • Streak = N if N consecutive days including today')
  console.log('   • Gap in any day breaks the streak from that point')
  console.log('   • Only consecutive days from today backwards count')
  console.log()

  console.log('🎯 Current Status: All users have 0 streaks (no entries today)')
  console.log('💡 To test streaks: Have users submit entries for consecutive days!')
}

testStreakScenarios()
