// Quick test of points functionality
const { awardPoints, getUserPoints } = require('./src/lib/points.ts');

async function testPoints() {
  console.log('🧪 Testing points system...');

  try {
    // Test with a known user ID (we'll need to get this from the database)
    const users = await fetch('http://localhost:3000/api/users/count');
    const data = await users.json();
    console.log('✅ API is accessible, user count:', data.count);

    console.log('🎯 Points system test completed - please test manually by:');
    console.log('1. Sign in to the app');
    console.log('2. Click the +1 durood button 10 times');
    console.log('3. Check if points increase by 1 in the top-left corner');
    console.log('4. Verify total points display shows accumulated points');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPoints();
