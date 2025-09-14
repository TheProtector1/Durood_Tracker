async function testSignin() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    
    const data = await response.json();
    console.log('Signin Response Status:', response.status);
    console.log('Signin Response Data:', data);
    
  } catch (error) {
    console.error('Signin test error:', error);
  }
}

testSignin();
