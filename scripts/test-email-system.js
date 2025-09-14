#!/usr/bin/env node

/**
 * Email System Test Script
 * Tests all email functionality including templates and delivery
 */

const path = require('path');
const fs = require('fs');

// Import our email functions
let emailService;
let dailyReminderService;

try {
  emailService = require('../src/lib/email');
  dailyReminderService = require('../src/lib/daily-reminder');
} catch (error) {
  console.error('❌ Failed to load email services:', error.message);
  console.log('💡 Make sure you are running this from the project root');
  process.exit(1);
}

// Test email configuration
const CONFIG = {
  TEST_EMAIL: process.env.TEST_EMAIL || 'test@example.com',
  VERIFICATION_URL: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=test-token`,
  RESET_URL: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=test-token`
};

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  console.log(logMessage.trim());

  try {
    const logFile = path.join(__dirname, '..', 'logs', 'email-test.log');
    const logDir = path.dirname(logFile);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Test email configuration
async function testEmailConfig() {
  log('🔧 Testing email configuration...');

  try {
    // Check if email config exists
    const { getEmailConfig } = emailService;
    const config = getEmailConfig();

    if (!config) {
      log('❌ No email configuration found', 'ERROR');
      log('💡 Set up SMTP credentials in .env.local:', 'ERROR');
      log('   SMTP_HOST=smtp.gmail.com', 'ERROR');
      log('   SMTP_PORT=587', 'ERROR');
      log('   SMTP_USER=your-email@gmail.com', 'ERROR');
      log('   SMTP_PASS=your-app-password', 'ERROR');
      log('   SMTP_SECURE=false', 'ERROR');
      log('   FROM_EMAIL=your-email@gmail.com', 'ERROR');
      return false;
    }

    log(`✅ Email provider configured: ${config.provider}`);
    if (config.provider === 'nodemailer') {
      log(`📧 SMTP Host: ${config.smtp.host}:${config.smtp.port}`);
      log(`🔐 Auth: ${config.smtp.auth.user ? 'Configured' : 'Missing'}`);
    }

    return true;
  } catch (error) {
    log(`❌ Email config test failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Test email templates
function testEmailTemplates() {
  log('📧 Testing email templates...');

  const templates = [
    'email-verification.html',
    'password-reset.html',
    'daily-reminder.html'
  ];

  let allTemplatesExist = true;

  templates.forEach(template => {
    const templatePath = path.join(__dirname, '..', 'src/lib/email-templates', template);
    if (fs.existsSync(templatePath)) {
      const stats = fs.statSync(templatePath);
      log(`✅ ${template} (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      log(`❌ ${template} - File not found`, 'ERROR');
      allTemplatesExist = false;
    }
  });

  return allTemplatesExist;
}

// Test email verification
async function testEmailVerification() {
  log('📧 Testing email verification functionality...');

  if (!CONFIG.TEST_EMAIL.includes('test@example.com')) {
    log('⚠️  Using real email address - this will send actual email!');
    const shouldContinue = process.argv.includes('--yes') ||
      await askConfirmation('Send test verification email to ' + CONFIG.TEST_EMAIL + '?');
    if (!shouldContinue) {
      log('⏭️  Skipping email verification test');
      return true;
    }
  }

  try {
    await emailService.sendEmailVerificationEmail(CONFIG.TEST_EMAIL, CONFIG.VERIFICATION_URL);
    log('✅ Email verification sent successfully');
    return true;
  } catch (error) {
    log(`❌ Email verification failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Test password reset
async function testPasswordReset() {
  log('🔐 Testing password reset functionality...');

  if (!CONFIG.TEST_EMAIL.includes('test@example.com')) {
    log('⚠️  Using real email address - this will send actual email!');
    const shouldContinue = process.argv.includes('--yes') ||
      await askConfirmation('Send test password reset email to ' + CONFIG.TEST_EMAIL + '?');
    if (!shouldContinue) {
      log('⏭️  Skipping password reset test');
      return true;
    }
  }

  try {
    await emailService.sendPasswordResetEmail(CONFIG.TEST_EMAIL, CONFIG.RESET_URL);
    log('✅ Password reset email sent successfully');
    return true;
  } catch (error) {
    log(`❌ Password reset failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Test daily reminder
async function testDailyReminder() {
  log('🔔 Testing daily reminder functionality...');

  if (!CONFIG.TEST_EMAIL.includes('test@example.com')) {
    log('⚠️  Using real email address - this will send actual email!');
    const shouldContinue = process.argv.includes('--yes') ||
      await askConfirmation('Send test daily reminder email to ' + CONFIG.TEST_EMAIL + '?');
    if (!shouldContinue) {
      log('⏭️  Skipping daily reminder test');
      return true;
    }
  }

  try {
    const testData = {
      userName: 'Test User',
      currentDate: new Date().toLocaleDateString('ar-SA'),
      todayCount: '50',
      weekCount: '350',
      monthCount: '1500',
      totalCount: '25000',
      appLink: CONFIG.VERIFICATION_URL.replace('/verify-email', ''),
      statsLink: CONFIG.VERIFICATION_URL.replace('/verify-email', '/profile'),
      fajrTime: '5:30 AM',
      dhuhrTime: '12:15 PM',
      asrTime: '3:45 PM',
      maghribTime: '6:30 PM',
      ishaTime: '8:00 PM',
      jummahTime: '1:30 PM'
    };

    await emailService.sendDailyReminderEmail(CONFIG.TEST_EMAIL, testData);
    log('✅ Daily reminder email sent successfully');
    return true;
  } catch (error) {
    log(`❌ Daily reminder failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Test daily reminder system
async function testDailyReminderSystem() {
  log('🔄 Testing daily reminder system...');

  try {
    // Test the reminder timing function
    const { shouldSendDailyReminders } = dailyReminderService;
    const shouldSend = shouldSendDailyReminders();

    log(`⏰ Should send reminders now: ${shouldSend}`);

    // Test getting users (without sending emails)
    const { getUsersForReminders } = dailyReminderService;
    const users = await getUsersForReminders();

    log(`👥 Found ${users.length} users eligible for reminders`);

    if (users.length > 0) {
      log(`📧 Sample users: ${users.slice(0, 3).map(u => u.username).join(', ')}`);
    }

    return true;
  } catch (error) {
    log(`❌ Daily reminder system test failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Ask for confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question + ' (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main test function
async function runEmailTests() {
  log('='.repeat(60));
  log('🧪 EMAIL SYSTEM COMPREHENSIVE TEST');
  log('='.repeat(60));

  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;

  const tests = [
    { name: 'Email Configuration', fn: testEmailConfig },
    { name: 'Email Templates', fn: testEmailTemplates },
    { name: 'Email Verification', fn: testEmailVerification },
    { name: 'Password Reset', fn: testPasswordReset },
    { name: 'Daily Reminder', fn: testDailyReminder },
    { name: 'Daily Reminder System', fn: testDailyReminderSystem }
  ];

  // Skip email sending tests if --no-send flag is used
  if (process.argv.includes('--no-send')) {
    log('📧 Skipping actual email sending (--no-send flag used)');
    tests.splice(2, 3); // Remove email sending tests
  }

  for (const test of tests) {
    totalTests++;
    log(`\n🔍 Running: ${test.name}`);
    log('-'.repeat(40));

    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
        log(`✅ ${test.name}: PASSED`);
      } else {
        log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      log(`❌ ${test.name}: ERROR - ${error.message}`, 'ERROR');
    }
  }

  const duration = (Date.now() - startTime) / 1000;

  log('\n' + '='.repeat(60));
  log('📊 TEST RESULTS SUMMARY');
  log('='.repeat(60));
  log(`⏱️  Total time: ${duration.toFixed(2)} seconds`);
  log(`✅ Passed: ${passedTests}/${totalTests}`);
  log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

  if (passedTests === totalTests) {
    log('\n🎉 ALL TESTS PASSED!');
    log('✨ Email system is fully operational');
  } else {
    log('\n⚠️  SOME TESTS FAILED');
    log('🔧 Check the logs above for details');
  }

  log('='.repeat(60));

  // Recommendations
  if (passedTests < totalTests) {
    log('\n💡 TROUBLESHOOTING TIPS:');
    log('1. Check your SMTP credentials in .env.local');
    log('2. Verify email templates exist in src/lib/email-templates/');
    log('3. Test with --no-send flag first');
    log('4. Check logs in logs/email-test.log');
  }

  return passedTests === totalTests;
}

// Main execution
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Email System Test Script

Tests all email functionality including configuration, templates, and delivery.

Usage: node scripts/test-email-system.js [options]

Options:
  --help, -h          Show this help message
  --no-send           Skip actual email sending tests
  --yes               Auto-confirm sending test emails

Environment Variables:
  TEST_EMAIL          Email address for testing (default: test@example.com)
  NEXTAUTH_URL        Base URL for the application
  SMTP_*             SMTP configuration for email sending

Examples:
  node scripts/test-email-system.js              # Full test
  node scripts/test-email-system.js --no-send    # Test without sending emails
  node scripts/test-email-system.js --yes        # Auto-confirm email sending

Note: By default, uses test@example.com to avoid sending real emails.
Set TEST_EMAIL environment variable to test with real email.
    `);
    process.exit(0);
  }

  const success = await runEmailTests();

  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Export for testing
module.exports = { runEmailTests };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}