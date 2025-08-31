import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUserByEmail(email: string) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`)

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        duroodEntries: true,
        dailyRankings: true,
        prayerCompletions: true
      }
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      return
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`)
    console.log(`📊 Related records:`)
    console.log(`   - Durood entries: ${user.duroodEntries.length}`)
    console.log(`   - Daily rankings: ${user.dailyRankings.length}`)
    console.log(`   - Prayer completions: ${user.prayerCompletions.length}`)

    // Delete related records first due to foreign key constraints
    console.log(`🗑️ Deleting related records...`)

    // Delete prayer completions
    const deletedPrayers = await prisma.prayerCompletion.deleteMany({
      where: { userId: user.id }
    })
    console.log(`   - Deleted ${deletedPrayers.count} prayer completion records`)

    // Delete daily rankings
    const deletedRankings = await prisma.dailyRanking.deleteMany({
      where: { userId: user.id }
    })
    console.log(`   - Deleted ${deletedRankings.count} daily ranking records`)

    // Delete durood entries
    const deletedEntries = await prisma.duroodEntry.deleteMany({
      where: { userId: user.id }
    })
    console.log(`   - Deleted ${deletedEntries.count} durood entry records`)

    // Finally delete the user
    const deletedUser = await prisma.user.delete({
      where: { id: user.id }
    })

    console.log(`✅ Successfully deleted user: ${deletedUser.username} (${deletedUser.email})`)
    console.log(`🗑️ Total records deleted:`)
    console.log(`   - User: 1`)
    console.log(`   - Prayer completions: ${deletedPrayers.count}`)
    console.log(`   - Daily rankings: ${deletedRankings.count}`)
    console.log(`   - Durood entries: ${deletedEntries.count}`)

  } catch (error) {
    console.error('❌ Error deleting user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments or use the specified email
const emailToDelete = process.argv[2] || 'emannfatima642@gmail.com'

console.log(`🚨 DELETE USER SCRIPT`)
console.log(`📧 Email to delete: ${emailToDelete}`)
console.log(`⚠️  This will permanently delete the user and all their data!`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

// Run the deletion
deleteUserByEmail(emailToDelete)
