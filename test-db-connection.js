require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🧪 Testing Production Database Connection...\n');
  
  console.log('�� Environment Variables:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
  console.log('   Database URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  console.log('');

  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    
    // Test connection by trying to get user count
    const userCount = await prisma.user.count();
    console.log('✅ Connection successful!');
    console.log('📊 Current user count:', userCount);
    
    // Test a simple query
    const users = await prisma.user.findMany({ take: 1 });
    console.log('📝 Sample user data:', users.length > 0 ? 'Found users' : 'No users yet');
    
    console.log('\n🎉 Production database connection test PASSED!');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check if DATABASE_URL is correct');
      console.log('2. Verify network connectivity');
      console.log('3. Make sure database server is running');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
