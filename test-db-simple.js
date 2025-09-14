require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

async function testSimpleConnection() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  });

  try {
    console.log('Testing simple database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Simple query successful:', result);
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log('✅ User count successful:', userCount);
    
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleConnection();
