import { PrismaClient } from '@prisma/client'
import {
  getPakistanDate,
  getPakistanDateTime,
  convertUTCToPakistanDate,
  isNewDayInPakistan,
  formatPakistanDate,
  getPakistanTime
} from '../src/lib/timezone'

const prisma = new PrismaClient()

async function testTimezone() {
  console.log('🕐 PAKISTAN TIMEZONE TEST')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Test current Pakistan date and time
  console.log('\n📅 Current Date/Time:')
  console.log('   Pakistan Date:', getPakistanDate())
  console.log('   Pakistan Time:', getPakistanTime())
  console.log('   Pakistan DateTime:', getPakistanDateTime().toISOString())

  // Test UTC to Pakistan conversion
  console.log('\n🔄 UTC to Pakistan Conversion:')
  const utcNow = new Date()
  console.log('   UTC Date:', utcNow.toISOString().split('T')[0])
  console.log('   Pakistan Date:', convertUTCToPakistanDate(utcNow))

  // Test new day detection
  console.log('\n🌅 New Day Detection:')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayPakistan = convertUTCToPakistanDate(yesterday)
  console.log('   Yesterday Pakistan date:', yesterdayPakistan)
  console.log('   Is new day:', isNewDayInPakistan(yesterdayPakistan))

  // Test date formatting
  console.log('\n📝 Date Formatting:')
  console.log('   Formatted Pakistan date:', formatPakistanDate(new Date()))

  // Check database records
  console.log('\n🗄️ Database Records Check:')

  try {
    // Get today's Pakistan date for prayer completions
    const todayPakistan = getPakistanDate()

    // Check prayer completions for today (Pakistan time)
    const prayerCompletions = await prisma.prayerCompletion.findMany({
      where: {
        date: todayPakistan
      },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    })

    console.log(`   Prayer completions for ${todayPakistan} (Pakistan date):`)
    console.log(`   - Total records: ${prayerCompletions.length}`)

    if (prayerCompletions.length > 0) {
      prayerCompletions.forEach(completion => {
        console.log(`   - ${completion.user.username}: ${completion.prayerName} - ${completion.completed ? '✅ Completed' : '❌ Pending'}`)
      })
    }

    // Check durood entries for today (Pakistan time)
    const duroodEntries = await prisma.duroodEntry.findMany({
      where: {
        date: todayPakistan
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    console.log(`   Durood entries for ${todayPakistan} (Pakistan date):`)
    console.log(`   - Total records: ${duroodEntries.length}`)

    if (duroodEntries.length > 0) {
      duroodEntries.forEach(entry => {
        console.log(`   - ${entry.user.username}: ${entry.count} durood`)
      })
    }

  } catch (error) {
    console.error('❌ Database query error:', error)
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n✅ Timezone test completed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Run the test
testTimezone().catch(console.error)
