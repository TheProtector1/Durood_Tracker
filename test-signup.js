// Test script for signup and email verification
// This will test the complete signup flow with Gmail SMTP

require('dotenv').config({ path: '.env.local' });

async function testSignupFlow() {
  console.log('🧪 Testing Complete Signup Flow with Gmail SMTP...\n');

  // Test data
  const testEmail = `test-${Date.now()}@example.com`; // Use a unique test email
  const testUsername = `test${Date.now().toString().slice(-6)}`; // Shorter username
  const testPassword = 'TestPassword123!';
  const testDisplayName = 'Test User';

  console.log('📝 Test Account Details:');
  console.log(`  Email: ${testEmail}`);
  console.log(`  Username: ${testUsername}`);
  console.log(`  Display Name: ${testDisplayName}`);
  console.log('');

  try {
    console.log('📤 Testing User Registration...');

    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername,
        password: testPassword,
        displayName: testDisplayName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Registration Failed:');
      console.log('Status:', response.status);
      console.log('Error:', data.error);
      console.log('Details:', data.details || 'No additional details');
      return;
    }

    console.log('✅ Registration Successful!');
    console.log('Response:', data);

    if (data.emailSent) {
      console.log('\n📧 Email verification should have been sent!');
      console.log('📧 Check your Gmail inbox for verification email');
      console.log('📧 Look for email from:', process.env.FROM_EMAIL);
    } else {
      console.log('\n⚠️  Email service not configured - registration successful but no verification email sent');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Check your Gmail inbox for the verification email');
    console.log('2. Click the verification link to activate your account');
    console.log('3. Try signing in with the test credentials');

    console.log('\n🔗 Test Links:');
    console.log(`   Sign In: http://localhost:3000/auth/signin`);
    console.log(`   Forgot Password: http://localhost:3000/auth/forgot-password`);

  } catch (error) {
    console.error('❌ Test Failed:');
    console.error('Error:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the Next.js dev server is running on port 3002');
      console.log('   Run: npm run dev');
    }
  }
}

// Run the test
testSignupFlow();
