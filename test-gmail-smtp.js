#!/usr/bin/env node

/**
 * Test Gmail SMTP Configuration
 * Allows testing Gmail SMTP with environment variables
 */

const nodemailer = require('nodemailer');

async function testGmailSMTP() {
  console.log('🧪 TESTING GMAIL SMTP CONFIGURATION');
  console.log('=====================================');

  // Check if required env vars are set
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('\n❌ MISSING ENVIRONMENT VARIABLES:');
    console.log('Please set the following environment variables:');
    missingVars.forEach(varName => console.log(`  - ${varName}`));
    console.log('\nExample:');
    console.log('SMTP_HOST=smtp.gmail.com \\');
    console.log('SMTP_PORT=587 \\');
    console.log('SMTP_USER=your-gmail@gmail.com \\');
    console.log('SMTP_PASS=your-app-password \\');
    console.log('SMTP_SECURE=false \\');
    console.log('FROM_EMAIL=your-gmail@gmail.com \\');
    console.log('node test-gmail-smtp.js');
    return;
  }

  console.log('\n✅ CONFIGURATION FOUND:');
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`Port: ${process.env.SMTP_PORT || '587'}`);
  console.log(`User: ${process.env.SMTP_USER}`);
  console.log(`From: ${process.env.FROM_EMAIL}`);
  console.log(`Secure: ${process.env.SMTP_SECURE || 'false'}`);

  // Test connection
  console.log('\n🔌 TESTING SMTP CONNECTION...');
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ SMTP connection successful');

  } catch (error) {
    console.log('❌ SMTP connection failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Verify your Gmail app password is correct');
    console.log('2. Make sure 2FA is enabled on your Gmail account');
    console.log('3. Check if your Gmail account has restrictions');
    console.log('4. Try regenerating the app password');
    return;
  }

  // Ask for test email address
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n📧 Enter email address to test (or press Enter for your Gmail): ', async (testEmail) => {
    rl.close();

    // Default to Gmail address if no input
    if (!testEmail.trim()) {
      testEmail = process.env.SMTP_USER;
    }

    console.log(`\n📤 SENDING TEST EMAIL TO: ${testEmail}`);

    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Send test email
      const info = await transporter.sendMail({
        from: `"Durood Tracker Test" <${process.env.FROM_EMAIL}>`,
        to: testEmail,
        subject: '🧪 Gmail SMTP Test - Durood Tracker',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #059669; margin-bottom: 20px;">✅ Gmail SMTP Test Successful!</h2>
            <p style="color: #374151; line-height: 1.6;">
              This email confirms that your Gmail SMTP configuration is working correctly.
            </p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">Configuration Details:</h3>
              <p style="margin: 5px 0;"><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
              <p style="margin: 5px 0;"><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || '587'}</p>
              <p style="margin: 5px 0;"><strong>From Email:</strong> ${process.env.FROM_EMAIL}</p>
              <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If you received this email in your inbox (not spam), your Gmail SMTP is working perfectly!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Durood Tracker - Email Delivery Test
            </p>
          </div>
        `
      });

      console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
      console.log(`Message ID: ${info.messageId}`);
      console.log(`Sent to: ${testEmail}`);

      console.log('\n📋 NEXT STEPS:');
      console.log('1. Check your email inbox for the test message');
      console.log('2. If not found, check your spam/junk folder');
      console.log('3. If still not found, see troubleshooting below');

      console.log('\n🔍 TROUBLESHOOTING (if email not received):');
      console.log('• Check Gmail spam/junk folder');
      console.log('• Verify app password is correct');
      console.log('• Check Gmail security settings');
      console.log('• Try sending to your own Gmail address first');
      console.log('• Check Gmail sending limits (500/day for free accounts)');

      console.log('\n⚙️  PRODUCTION SETUP:');
      console.log('Once working locally, set these environment variables on Vercel:');
      console.log(`SMTP_HOST=${process.env.SMTP_HOST}`);
      console.log(`SMTP_PORT=${process.env.SMTP_PORT || '587'}`);
      console.log(`SMTP_USER=${process.env.SMTP_USER}`);
      console.log(`SMTP_PASS=${process.env.SMTP_PASS}`);
      console.log(`SMTP_SECURE=${process.env.SMTP_SECURE || 'false'}`);
      console.log(`FROM_EMAIL=${process.env.FROM_EMAIL}`);
      console.log('NEXTAUTH_URL=https://your-vercel-domain.vercel.app');

    } catch (error) {
      console.log('❌ EMAIL SENDING FAILED:', error.message);
      console.log('\n🔧 POSSIBLE CAUSES:');
      console.log('• Invalid app password');
      console.log('• Gmail account restrictions');
      console.log('• Network/firewall issues');
      console.log('• Incorrect SMTP settings');
    }
  });
}

// Run the test
testGmailSMTP().catch(console.error);
