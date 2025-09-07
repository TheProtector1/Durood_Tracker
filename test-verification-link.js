// Test script to manually verify email verification tokens

require('dotenv').config({ path: '.env.local' });

async function testVerificationToken() {
  console.log('🔗 Testing Email Verification Token...\n');

  try {
    // This simulates what happens when someone clicks the verification link
    // In a real scenario, you'd extract the token from the URL

    console.log('📝 To test email verification manually:');
    console.log('');
    console.log('1. Create a user account through the web interface');
    console.log('2. Check your Gmail inbox for the verification email');
    console.log('3. Copy the verification link from the email');
    console.log('4. The link should look like this:');
    console.log(`   http://localhost:3002/auth/verify-email?token=some-token-here&email=user@example.com`);
    console.log('');
    console.log('5. Paste the token here and test it:');

    // Example of how to test a specific token
    const testToken = 'your-token-here'; // Replace with actual token from email
    const testEmail = 'your-email@example.com'; // Replace with actual email

    if (testToken === 'your-token-here') {
      console.log('⚠️  Please replace the placeholder values with real token and email');
      console.log('📧 Check your Gmail inbox for a verification email from: kaarekhairofficial@gmail.com');
      return;
    }

    console.log(`🔍 Testing token: ${testToken}`);
    console.log(`📧 For email: ${testEmail}`);

    const response = await fetch('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: testToken })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Verification Failed:');
      console.log('Status:', response.status);
      console.log('Error:', data.error);
    } else {
      console.log('✅ Email Verification Successful!');
      console.log('Response:', data);
    }

  } catch (error) {
    console.error('❌ Test Failed:');
    console.error('Error:', error.message);
  }
}

// Run the test
testVerificationToken();
