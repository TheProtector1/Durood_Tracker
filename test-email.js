// Test script for Gmail SMTP configuration
// Run with: node test-email.js

require('dotenv').config({ path: '.env.local' });

async function testGmailSMTP() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  // Check if required environment variables are set
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL'
  ];

  console.log('📋 Checking Environment Variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const masked = varName.includes('PASS') ? '***masked***' : value;
    console.log(`  ${varName}: ${value ? '✅ ' + masked : '❌ Not set'}`);
  }

  console.log('\n📧 Testing SMTP Connection...');

  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // false for TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP Connection Successful!');

    // Send test email
    console.log('📤 Sending Test Email...');
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: '🧪 Gmail SMTP Test - Durood Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981; text-align: center;">✅ Gmail SMTP Test Successful!</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Great! Your Gmail SMTP configuration is working correctly.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You can now use Durood Tracker with email verification features.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 48px;">﷽</div>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Test sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    console.log('✅ Test Email Sent Successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${process.env.SMTP_USER}`);

    console.log('\n🎉 Gmail SMTP Configuration Complete!');
    console.log('🚀 You can now use Durood Tracker with email verification!');

  } catch (error) {
    console.error('❌ SMTP Test Failed:');
    console.error('Error:', error.message);

    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Troubleshooting Tips:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Enable 2-Factor Authentication on your Gmail account');
      console.log('3. Generate an App Password: https://support.google.com/accounts/answer/185833');
      console.log('4. Use the App Password (16 characters) instead of your regular password');
    }

    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Network Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Verify SMTP_HOST is correct: smtp.gmail.com');
    }
  }
}

// Run the test
testGmailSMTP();
