const fetch = require('node-fetch');

async function testSimpleDuroodAPI() {
  const today = new Date().toISOString().split('T')[0];

  console.log('🧪 Testing simplified durood API...');
  console.log('📅 Date:', today);

  try {
    const response = await fetch('http://localhost:3000/api/durood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: today,
        count: 1
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    const data = await response.text();
    console.log('📊 Response data:', data);

    if (response.ok) {
      console.log('✅ API call successful!');
    } else {
      console.log('❌ API call failed');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testSimpleDuroodAPI();
