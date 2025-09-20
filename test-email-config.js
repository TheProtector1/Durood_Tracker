#!/usr/bin/env node

/**
 * Email Configuration Diagnostic Script
 * Tests email configuration and environment variables
 */

console.log('🔧 EMAIL CONFIGURATION DIAGNOSTIC');
console.log('==================================');

// Check environment variables
console.log('\n📋 ENVIRONMENT VARIABLES:');
const emailEnvVars = [
  'SENDGRID_API_KEY',
  'MAILGUN_API_KEY',
  'MAILGUN_DOMAIN',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_SECURE',
  'FROM_EMAIL',
  'NEXTAUTH_URL',
  'RESEND_API_KEY'
];

emailEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    if (envVar.includes('KEY') || envVar.includes('PASS') || envVar.includes('SECRET')) {
      console.log(`✅ ${envVar}: ${value.substring(0, 10)}... (masked)`);
    } else {
      console.log(`✅ ${envVar}: ${value}`);
    }
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
  }
});

// Test email configuration
console.log('\n📧 EMAIL CONFIGURATION TEST:');
try {
  const emailConfig = require('./src/lib/email.ts');

  // We need to call the getEmailConfig function
  // Since it's not exported, let's recreate the logic here
  console.log('Testing email configuration...');

  let config = null;

  // Check SMTP first (most reliable for production)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('✅ SMTP (Gmail) configuration detected');
    config = {
      provider: 'nodemailer',
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true'
      }
    };
  }
  // Check Resend
  else if (process.env.RESEND_API_KEY) {
    console.log('✅ Resend configuration detected');
    config = { provider: 'resend', apiKey: '***masked***' };
  }
  // Check SendGrid
  else if (process.env.SENDGRID_API_KEY) {
    console.log('✅ SendGrid configuration detected');
    config = { provider: 'sendgrid', apiKey: '***masked***' };
  }
  // Check Mailgun
  else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    console.log('✅ Mailgun configuration detected');
    config = { provider: 'mailgun', apiKey: '***masked***' };
  }
  // Check AWS SES
  else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
    console.log('✅ AWS SES configuration detected');
    config = { provider: 'aws-ses' };
  }
  else {
    console.log('❌ No email service configured');
    console.log('Available options:');
    console.log('  - Gmail SMTP: Set SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER=your@gmail.com, SMTP_PASS=your-app-password (recommended)');
    console.log('  - Resend: Set RESEND_API_KEY');
    console.log('  - SendGrid: Set SENDGRID_API_KEY');
    console.log('  - Mailgun: Set MAILGUN_API_KEY and MAILGUN_DOMAIN');
    console.log('  - AWS SES: Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION');
  }

  if (config) {
    console.log('🎉 Email service is configured and ready!');
  }

} catch (error) {
  console.log('❌ Error testing email configuration:', error.message);
}

// Test email templates
console.log('\n📄 EMAIL TEMPLATES TEST:');
const fs = require('fs');
const path = require('path');

const templates = ['email-verification', 'password-reset', 'daily-reminder'];
templates.forEach(template => {
  const possiblePaths = [
    path.join(__dirname, 'src/lib/email-templates', `${template}.html`),
    path.join(__dirname, 'email-templates', `${template}.html`)
  ];

  let found = false;
  for (const templatePath of possiblePaths) {
    if (fs.existsSync(templatePath)) {
      console.log(`✅ ${template}: ${templatePath}`);
      found = true;
      break;
    }
  }

  if (!found) {
    console.log(`❌ ${template}: Template not found`);
  }
});

// Recommendations
console.log('\n💡 RECOMMENDATIONS:');
console.log('1. Ensure you have set one of the supported email services on Vercel');
console.log('2. Set NEXTAUTH_URL to your production domain (https://yourdomain.com)');
console.log('3. Set FROM_EMAIL to a verified email address');
console.log('4. Test email sending with the diagnostic below');

console.log('\n🔍 QUICK TEST:');
console.log('Run this to test email sending:');
console.log('node -e "');
console.log('const { sendEmailVerificationEmail } = require(\'./src/lib/email.ts\');');
console.log('sendEmailVerificationEmail(\'test@example.com\', \'https://example.com/verify?token=test\')');
console.log('  .then(() => console.log(\'✅ Email sent!\'))');
console.log('  .catch(err => console.log(\'❌ Error:\', err.message));');
console.log('"');

console.log('\n==================================');
console.log('Diagnostic complete!');