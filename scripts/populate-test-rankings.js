const { PrismaClient } = require('@prisma/client');
// Simple date functions for testing
function getPakistanDate() {
  const now = new Date();
  // Pakistan is UTC+5, so add 5 hours
  const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  return pakistanTime.toISOString().split('T')[0];
}

function getPakistanDateTime() {
  const now = new Date();
  const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  return pakistanTime.toISOString();
}

const prisma = new PrismaClient();

async function populateTestRankings() {
  console.log('🌱 Populating test rankings data...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, username: true, displayName: true }
    });

    console.log(`Found ${users.length} users`);

    // Get today's date in Pakistan timezone
    const today = getPakistanDate();
    console.log(`Creating rankings for date: ${today}`);

    // Create durood entries for today with varying counts
    // Use the first few users from the database
    const testData = users.slice(0, 6).map((user, index) => ({
      userId: user.id,
      username: user.username,
      count: 261 - (index * 30) // Decreasing counts: 261, 231, 201, 171, 141, 111
    }));

    let created = 0;
    for (const data of testData) {
      // Check if entry already exists
      const existingEntry = await prisma.duroodEntry.findFirst({
        where: {
          userId: data.userId,
          date: today
        }
      });

      if (existingEntry) {
        console.log(`Entry already exists for ${data.username}, updating count`);
        await prisma.duroodEntry.update({
          where: { id: existingEntry.id },
          data: { count: data.count }
        });
      } else {
        await prisma.duroodEntry.create({
          data: {
            userId: data.userId,
            date: today,
            count: data.count
          }
        });
        created++;
      }
    }

    console.log(`✅ Created ${created} new durood entries`);

    // Create some historical data for streak testing
    console.log('Creating historical data for streak testing...');

    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = new Date(date.getTime() + (5 * 60 * 60 * 1000)).toISOString().split('T')[0];

      for (const data of testData.slice(0, 3)) { // Only first 3 users get streaks
        const existing = await prisma.duroodEntry.findFirst({
          where: { userId: data.userId, date: dateStr }
        });

        if (!existing) {
          await prisma.duroodEntry.create({
            data: {
              userId: data.userId,
              date: dateStr,
              count: Math.floor(data.count * 0.8) // Slightly less for historical data
            }
          });
        }
      }
    }

    console.log('✅ Historical data created for streak testing');

    // Test the rankings API
    console.log('\n📊 Testing rankings API...');
    const response = await fetch('http://localhost:3000/api/rankings');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Rankings API working: ${data.rankings.length} rankings found`);
      console.log('Top 3 rankings:');
      data.rankings.slice(0, 3).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.username}: ${r.count} durood (streak: ${r.streak})`);
      });
    } else {
      console.log('❌ Rankings API failed');
    }

  } catch (error) {
    console.error('❌ Error populating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateTestRankings();
