#!/usr/bin/env node

/**
 * Email Delivery Diagnostic Script
 * Tests Gmail SMTP delivery and provides troubleshooting
 */

const nodemailer = require('nodemailer');

async function testEmailDelivery() {
  console.log('📧 GMAIL SMTP DELIVERY DIAGNOSTIC');
  console.log('==================================');

  // Check configuration
  console.log('\n1️⃣ CONFIGURATION CHECK:');
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || '587';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const fromEmail = process.env.FROM_EMAIL;

  console.log(`SMTP Host: ${smtpHost || '❌ NOT SET'}`);
  console.log(`SMTP Port: ${smtpPort}`);
  console.log(`SMTP User: ${smtpUser || '❌ NOT SET'}`);
  console.log(`SMTP Pass: ${smtpPass ? '✅ SET (masked)' : '❌ NOT SET'}`);
  console.log(`SMTP Secure: ${smtpSecure}`);
  console.log(`From Email: ${fromEmail || '❌ NOT SET'}`);

  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
    console.log('\n❌ MISSING CONFIGURATION:');
    console.log('Some required environment variables are not set.');
    console.log('Run: node setup-gmail-smtp.js');
    return;
  }

  // Check if FROM_EMAIL matches SMTP_USER
  if (fromEmail !== smtpUser) {
    console.log('\n⚠️  FROM_EMAIL MISMATCH:');
    console.log(`SMTP_USER: ${smtpUser}`);
    console.log(`FROM_EMAIL: ${fromEmail}`);
    console.log('These should usually be the same for Gmail SMTP.');
    console.log('Consider setting FROM_EMAIL to match SMTP_USER.');
  }

  // Test SMTP connection
  console.log('\n2️⃣ SMTP CONNECTION TEST:');
  try {
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.verify();
    console.log('✅ SMTP connection successful');
  } catch (error) {
    console.log('❌ SMTP connection failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Verify your Gmail app password is correct');
    console.log('2. Enable 2-Factor Authentication on your Gmail account');
    console.log('3. Regenerate the app password if needed');
    console.log('4. Check if your Gmail account has sending restrictions');
    return;
  }

  // Test email sending
  console.log('\n3️⃣ EMAIL SENDING TEST:');
  const testEmail = smtpUser; // Send test to the Gmail account itself

  try {
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Durood Tracker Test" <${fromEmail}>`,
      to: testEmail,
      subject: '🧪 Email Delivery Test - Durood Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Email Delivery Test</h2>
          <p>This is a test email to verify Gmail SMTP delivery is working.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>SMTP Config:</strong> ${smtpHost}:${smtpPort}</p>
          <p><strong>From:</strong> ${fromEmail}</p>
          <p><strong>To:</strong> ${testEmail}</p>
          <hr>
          <p style="color: #6b7280; font-size: 14px;">
            If you received this email, Gmail SMTP is working correctly.
            Check your spam/junk folder if you don't see it in your inbox.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`To: ${testEmail}`);

  } catch (error) {
    console.log('❌ Email sending failed:', error.message);
    return;
  }

  console.log('\n4️⃣ COMMON DELIVERY ISSUES & SOLUTIONS:');

  console.log('\n📁 CHECK SPAM/JUNK FOLDER:');
  console.log('- Gmail often sends automated emails to spam');
  console.log('- Check your spam folder first');

  console.log('\n🔒 GMAIL SECURITY SETTINGS:');
  console.log('1. Go to https://myaccount.google.com/security');
  console.log('2. Check "Recent security activity"');
  console.log('3. Allow "Less secure app access" if needed (not recommended)');
  console.log('4. Verify 2FA is enabled');

  console.log('\n📊 GMAIL SENDING LIMITS:');
  console.log('- Free Gmail accounts: 500 emails/day');
  console.log('- Google Workspace: Higher limits based on plan');
  console.log('- Check: https://support.google.com/mail/answer/22839');

  console.log('\n🏷️ EMAIL REPUTATION:');
  console.log('- First emails from new senders often go to spam');
  console.log('- Send a few test emails to build reputation');
  console.log('- Avoid sending to non-existent addresses');

  console.log('\n📧 ALTERNATIVE SOLUTIONS:');
  console.log('If Gmail SMTP continues having issues, consider:');
  console.log('1. SendGrid (reliable for bulk emails)');
  console.log('2. Mailgun (good for transactional emails)');
  console.log('3. AWS SES (highly reliable, pay per use)');

  console.log('\n🧪 PRODUCTION TESTING:');
  console.log('After fixing issues, test on Vercel:');
  console.log('1. Set environment variables on Vercel');
  console.log('2. Deploy your app');
  console.log('3. Try user registration to trigger verification email');
  console.log('4. Check Vercel function logs for SMTP errors');

  console.log('\n📞 DEBUGGING ON VERCEL:');
  console.log('Visit: https://your-domain.vercel.app/api/email-config');
  console.log('This shows your email configuration on Vercel.');

  console.log('\n==================================');
  console.log('✅ DIAGNOSTIC COMPLETE');
  console.log('Check your Gmail inbox and spam folder for the test email.');
}
