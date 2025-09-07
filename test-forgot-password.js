// Test script for forgot password functionality with Gmail SMTP

require('dotenv').config({ path: '.env.local' });

async function testForgotPassword() {
  console.log('🧪 Testing Forgot Password with Gmail SMTP...\n');

  // Use the test account we created earlier
  const testEmail = 'kaarekhairofficial@gmail.com'; // Use your actual Gmail

  console.log('📧 Testing Forgot Password for:');
  console.log(`   Email: ${testEmail}`);
  console.log('');

  try {
    console.log('📤 Sending Password Reset Email...');

    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Forgot Password Failed:');
      console.log('Status:', response.status);
      console.log('Error:', data.error);
      return;
    }

    console.log('✅ Password Reset Email Sent Successfully!');
    console.log('Response:', data);

    if (data.resetUrl) {
      console.log('\n🔗 Development Reset Link:');
      console.log(data.resetUrl);
      console.log('\n💡 Copy this link to test password reset in development mode');
    }

    console.log('\n📧 Check your Gmail inbox for the password reset email');
    console.log('📧 Look for email from:', process.env.FROM_EMAIL);
    console.log('\n🎯 Next Steps:');
    console.log('1. Check your Gmail inbox for the reset email');
    console.log('2. Click the reset link to test password reset');
    console.log('3. Verify the email formatting and links work');

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
testForgotPassword();
