const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSamplePoints() {
  console.log('🌱 Adding sample points to users...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, username: true, displayName: true }
    });

    console.log(`Found ${users.length} users`);

    // Add different amounts of points to different users
    const pointAmounts = [500, 750, 1000, 1250, 1500, 2000];

    for (let i = 0; i < users.length && i < pointAmounts.length; i++) {
      const user = users[i];
      const pointsToAdd = pointAmounts[i];

      // Update or create user level with points
      await prisma.userLevel.upsert({
        where: { userId: user.id },
        update: { points: pointsToAdd },
        create: {
          userId: user.id,
          points: pointsToAdd,
          level: Math.min(5, Math.floor(pointsToAdd / 1000) + 1),
          title: getLevelTitle(Math.min(5, Math.floor(pointsToAdd / 1000) + 1))
        }
      });

      console.log(`✅ Added ${pointsToAdd} points to ${user.username}`);
    }

    console.log('✅ Sample points added successfully!');

    // Show current points for all users
    console.log('\n📊 Current user points:');
    for (const user of users.slice(0, 6)) {
      const userLevel = await prisma.userLevel.findUnique({
        where: { userId: user.id },
        select: { points: true, level: true, title: true }
      });

      if (userLevel) {
        console.log(`  ${user.username}: ${userLevel.points} points (Level ${userLevel.level} - ${userLevel.title})`);
      }
    }

  } catch (error) {
    console.error('❌ Error adding sample points:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getLevelTitle(level) {
  const titles = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum'];
  return titles[level - 1] || 'Bronze';
}

addSamplePoints();
