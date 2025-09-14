require('dotenv').config({ path: '.env.local' });

async function testEmailSend() {
  try {
    const { sendEmailVerificationEmail } = require('./dist/src/lib/email');
    
    console.log('🧪 Testing Email Send Function...');
    
    const testEmail = 'test@example.com';
    const testUrl = 'http://localhost:3000/auth/verify-email?token=test&email=test@example.com';
    
    console.log('📧 Sending test verification email...');
    const result = await sendEmailVerificationEmail(testEmail, testUrl);
    
    console.log('✅ Email sent successfully:', result);
    
  } catch (error) {
    console.error('❌ Email send failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testEmailSend();
