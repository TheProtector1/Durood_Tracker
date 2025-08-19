import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create test users
  const users = [
    {
      email: 'ahmed@example.com',
      username: 'ahmed',
      password: 'password123',
      displayName: 'Ahmed Ali'
    },
    {
      email: 'fatima@example.com',
      username: 'fatima',
      password: 'password123',
      displayName: 'Fatima Zahra'
    },
    {
      email: 'omar@example.com',
      username: 'omar',
      password: 'password123',
      displayName: 'Omar Hassan'
    },
    {
      email: 'aisha@example.com',
      username: 'aisha',
      password: 'password123',
      displayName: 'Aisha Khan'
    },
    {
      email: 'yusuf@example.com',
      username: 'yusuf',
      password: 'password123',
      displayName: 'Yusuf Rahman'
    }
  ]

  console.log('👥 Creating users...')
  const createdUsers = []
  
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        displayName: userData.displayName
      }
    })
    
    createdUsers.push(user)
    console.log(`✅ Created user: ${user.username}`)
  }

  // Create some durood entries for the past few days
  console.log('📝 Creating durood entries...')
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Each user gets a different count each day
    for (let j = 0; j < createdUsers.length; j++) {
      const user = createdUsers[j]
      const count = Math.floor(Math.random() * 1000) + 100 // Random count between 100-1100
      
      await prisma.duroodEntry.create({
        data: {
          userId: user.id,
          date: dateStr,
          count
        }
      })
    }
    console.log(`✅ Created entries for ${dateStr}`)
  }

  // Update daily rankings for the past few days
  console.log('🏆 Updating daily rankings...')
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Aggregate entries per user for the date
    const grouped = await prisma.duroodEntry.groupBy({
      by: ['userId'],
      where: { date: dateStr },
      _sum: { count: true }
    })

    const userIds = grouped.map(g => g.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, displayName: true }
    })
    const userById = new Map(users.map(u => [u.id, u]))

    // Delete existing rankings for the date
    await prisma.dailyRanking.deleteMany({
      where: { date: dateStr }
    })

    // Create new rankings
    const rankings = grouped
      .map(g => ({
        userId: g.userId,
        count: g._sum.count || 0,
        username: userById.get(g.userId)?.username || 'user',
        displayName: userById.get(g.userId)?.displayName || null
      }))
      .sort((a, b) => b.count - a.count)
      .map((entry, index) => ({
        date: dateStr,
        userId: entry.userId,
        username: entry.username,
        displayName: entry.displayName,
        count: entry.count,
        rank: index + 1
      }))

    if (rankings.length > 0) {
      await prisma.dailyRanking.createMany({
        data: rankings
      })
      console.log(`✅ Updated rankings for ${dateStr}`)
    }
  }

  console.log('🎉 Database seeding completed successfully!')
  console.log(`📊 Created ${createdUsers.length} users`)
  console.log('🔗 You can now sign in with any of these accounts using "password123" as the password')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
