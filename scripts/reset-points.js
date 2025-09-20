const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetAllPoints() {
  console.log('🔄 Starting points reset for all users...')

  try {
    // Reset all user levels to default values
    const result = await prisma.userLevel.updateMany({
      data: {
        points: 0,
        level: 1,
        title: 'Bronze',
        jumuahBadge: false
      }
    })

    console.log(`✅ Successfully reset points for ${result.count} users`)

    // Verify the reset
    const totalUsers = await prisma.userLevel.count()
    const usersWithPoints = await prisma.userLevel.count({
      where: {
        points: {
          gt: 0
        }
      }
    })

    console.log(`📊 Verification:`)
    console.log(`   Total users: ${totalUsers}`)
    console.log(`   Users with points > 0: ${usersWithPoints}`)
    console.log(`   Users with 0 points: ${totalUsers - usersWithPoints}`)

    if (usersWithPoints === 0) {
      console.log('🎉 All user points have been successfully reset to zero!')
    } else {
      console.log('⚠️  Some users still have points. Please check the database.')
    }

  } catch (error) {
    console.error('❌ Error resetting points:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetAllPoints()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
