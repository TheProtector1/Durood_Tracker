#!/usr/bin/env node

/**
 * Test Production Database Connection
 */

const { PrismaClient } = require('@prisma/client');

async function testProductionConnection() {
  console.log('🧪 TESTING PRODUCTION DATABASE CONNECTION');
  console.log('========================================');

  const prisma = new PrismaClient();

  try {
    console.log('🔌 Connecting to production database...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to production database successfully!');

    // Test queries
    console.log('\n📊 Testing database queries...');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users in production: ${userCount}`);

    // Count durood entries
    const duroodCount = await prisma.duroodEntry.count();
    console.log(`🙏 Durood entries: ${duroodCount}`);

    // Count rankings
    const rankingCount = await prisma.dailyRanking.count();
    console.log(`🏆 Rankings: ${rankingCount}`);

    // Count prayer completions
    const prayerCount = await prisma.prayerCompletion.count();
    console.log(`🕌 Prayer completions: ${prayerCount}`);

    // Get some sample data
    if (userCount > 0) {
      console.log('\n📋 Sample Users:');
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true
        }
      });

      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.email}) - Created: ${user.createdAt.toLocaleDateString()}`);
      });
    }

    if (duroodCount > 0) {
      console.log('\n🙏 Recent Durood Entries:');
      const duroodEntries = await prisma.duroodEntry.findMany({
        take: 3,
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      duroodEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.user.username}: ${entry.count} recitations on ${entry.date}`);
      });
    }

    console.log('\n🎉 PRODUCTION DATABASE TEST COMPLETED SUCCESSFULLY!');
    console.log('===================================================');
    console.log('✅ Database connection: WORKING');
    console.log('✅ Schema compatibility: CONFIRMED');
    console.log('✅ Data access: FUNCTIONAL');
    console.log('✅ Production data: AVAILABLE');

    console.log('\n📊 PRODUCTION DATABASE SUMMARY:');
    console.log('===============================');
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`🙏 Total Durood Entries: ${duroodCount}`);
    console.log(`🏆 Total Rankings: ${rankingCount}`);
    console.log(`🕌 Total Prayer Completions: ${prayerCount}`);

    const totalActivity = duroodCount + rankingCount + prayerCount;
    console.log(`📈 Total Activity Records: ${totalActivity}`);

  } catch (error) {
    console.error('\n❌ PRODUCTION DATABASE TEST FAILED:');
    console.error('===================================');
    console.error('Error details:', error.message);

    if (error.code === 'P1001') {
      console.log('\n💡 Connection Issues:');
      console.log('   • Check internet connectivity');
      console.log('   • Verify DATABASE_URL is correct');
      console.log('   • Ensure production database is accessible');
    } else if (error.code === 'P1017') {
      console.log('\n💡 Server Issues:');
      console.log('   • Production database server may be down');
      console.log('   • Check Prisma Data Platform status');
    } else {
      console.log('\n💡 Other Issues:');
      console.log('   • Database credentials may be expired');
      console.log('   • Schema may have compatibility issues');
    }

  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from production database');
  }
}

// Run the test
testProductionConnection().catch(console.error);
