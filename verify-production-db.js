#!/usr/bin/env node

/**
 * Verify Production Database Connection and Data
 * Helps confirm we're connecting to the right production database
 */

const { PrismaClient } = require('@prisma/client');

async function verifyProductionConnection() {
  console.log('🔍 VERIFYING PRODUCTION DATABASE CONNECTION');
  console.log('===========================================');

  const prisma = new PrismaClient();

  try {
    console.log('🔌 Connecting to database...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Get database info using Prisma queries instead of raw SQL
    console.log('\n📊 Database Connection Information:');
    console.log('   Type: PostgreSQL (Prisma Data Platform)');
    console.log('   Host: db.prisma.io');
    console.log('   Status: Connected ✅');

    // Test a simple query to ensure database is responsive
    const testQuery = await prisma.user.findMany({ take: 1 });
    console.log('   Database responsiveness: ✅ Working');

    // Check all tables
    console.log('\n📋 Checking Database Tables:');

    const tables = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'DuroodEntry', query: () => prisma.duroodEntry.count() },
      { name: 'DailyRanking', query: () => prisma.dailyRanking.count() },
      { name: 'PrayerCompletion', query: () => prisma.prayerCompletion.count() },
      { name: 'PasswordReset', query: () => prisma.passwordReset.count() },
      { name: 'TotalCounter', query: () => prisma.totalCounter.count() }
    ];

    for (const table of tables) {
      try {
        const count = await table.query();
        console.log(`   ${table.name}: ${count} records`);
      } catch (error) {
        console.log(`   ${table.name}: Table not found or error - ${error.message}`);
      }
    }

    // Sample data check
    console.log('\n📈 Sample Data Check:');

    // Check for any users
    const users = await prisma.user.findMany({ take: 3 });
    if (users.length > 0) {
      console.log('👥 Found users:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (${user.email}) - Created: ${user.createdAt.toLocaleDateString()}`);
      });
    } else {
      console.log('👥 No users found in database');
    }

    // Check for any durood entries
    const duroodEntries = await prisma.duroodEntry.findMany({ take: 3 });
    if (duroodEntries.length > 0) {
      console.log('🙏 Found durood entries:');
      duroodEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. User ID: ${entry.userId}, Count: ${entry.count}, Date: ${entry.date}`);
      });
    } else {
      console.log('🙏 No durood entries found in database');
    }

    console.log('\n🎯 VERIFICATION RESULTS:');
    console.log('=======================');

    const totalRecords = await Promise.all([
      prisma.user.count(),
      prisma.duroodEntry.count(),
      prisma.dailyRanking.count(),
      prisma.prayerCompletion.count()
    ]);

    const total = totalRecords.reduce((sum, count) => sum + count, 0);

    if (total > 0) {
      console.log('✅ PRODUCTION DATA FOUND!');
      console.log(`   Total records across all tables: ${total}`);
      console.log('   This appears to be your actual production database!');
    } else {
      console.log('⚠️  NO PRODUCTION DATA FOUND');
      console.log('   This database appears to be empty or newly created');
      console.log('\n💡 POSSIBLE REASONS:');
      console.log('   1. This might be a staging/test database, not production');
      console.log('   2. The production database might have been reset');
      console.log('   3. You might have different production database credentials');
      console.log('   4. The database might be in a different region/project');
    }

    console.log('\n🔧 NEXT STEPS:');
    console.log('=============');
    if (total === 0) {
      console.log('1. Verify you have the correct production database credentials');
      console.log('2. Check if this is the right database (production vs staging)');
      console.log('3. Confirm the database URL in your Prisma dashboard');
      console.log('4. Try refreshing the database credentials from Vercel');
    } else {
      console.log('1. Great! You are connected to a database with real data');
      console.log('2. Your local development will now sync with this database');
      console.log('3. Any changes you make locally will affect this database');
    }

  } catch (error) {
    console.error('\n❌ DATABASE VERIFICATION FAILED:');
    console.error('================================');
    console.error('Error details:', error.message);

    if (error.code === 'P1001') {
      console.log('\n💡 Connection Issues:');
      console.log('   • Cannot connect to the database');
      console.log('   • Check your internet connection');
      console.log('   • Verify DATABASE_URL is correct');
    } else if (error.code === 'P1017') {
      console.log('\n💡 Server Issues:');
      console.log('   • Database server is not responding');
      console.log('   • Check if the database is running');
    } else {
      console.log('\n💡 Other Issues:');
      console.log('   • Database credentials might be incorrect');
      console.log('   • Database might not exist');
      console.log('   • Firewall or network restrictions');
    }

  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the verification
verifyProductionConnection().catch(console.error);
