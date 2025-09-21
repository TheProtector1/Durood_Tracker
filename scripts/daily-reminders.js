#!/usr/bin/env node

/**
 * Daily Reminders Cron Job Script
 * Sends daily durood recitation reminders to users at 8 PM daily
 */

// Simple approach: Use HTTP request to Next.js API instead of direct imports
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function callReminderAPI(endpoint, options = {}) {
  const url = `${BASE_URL}/api/${endpoint}`;
  console.log(`📡 Calling API: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API call failed:`, error.message);
    throw error;
  }
}

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  console.log(logMessage.trim());

  try {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '..', 'logs', 'daily-reminders.log');
    const logDir = path.dirname(logFile);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Check if we should run reminders
async function checkShouldRunReminders() {
  if (process.argv.includes('--force')) {
    log('🚀 FORCE MODE: Sending reminders regardless of time');
    return true;
  }

  if (process.argv.includes('--test')) {
    log('🧪 TEST MODE: Simulating reminder process');
    return true;
  }

  try {
    const response = await callReminderAPI('daily-reminders');
    return response.shouldSend;
  } catch (error) {
    log(`❌ Failed to check if should send reminders: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  log('='.repeat(60));
  log('🔔 DAILY REMINDERS CRON JOB');
  log('='.repeat(60));

  const startTime = Date.now();
  const currentTime = new Date().toLocaleString();

  log(`📅 Current time: ${currentTime}`);

  // Check if we should run reminders
  const shouldRun = await checkShouldRunReminders();

  if (!shouldRun) {
    log('⏰ Not the right time to send reminders (should run at 8 PM daily)');
    log('💡 Use --force to send reminders anyway');
    log('💡 Use --test to simulate the process');

    const nextRun = new Date();
    nextRun.setHours(20, 0, 0, 0);
    if (nextRun <= new Date()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNext = nextRun.getTime() - Date.now();
    const hoursUntilNext = Math.floor(timeUntilNext / (1000 * 60 * 60));
    const minutesUntilNext = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));

    log(`⏳ Next reminder run: ${nextRun.toLocaleString()} (${hoursUntilNext}h ${minutesUntilNext}m)`);
    log('='.repeat(60));
    return;
  }

  // Check for test mode
  if (process.argv.includes('--test')) {
    log('🧪 TEST MODE: Getting reminder statistics...');

    try {
      const response = await callReminderAPI('daily-reminders', {
        method: 'POST',
        body: JSON.stringify({ action: 'stats' })
      });

      const stats = response.stats;
      log(`📊 REMINDER STATISTICS:`);
      log(`   👥 Total Users: ${stats.totalUsers}`);
      log(`   ✅ Active Users: ${stats.activeUsers}`);
      log(`   📧 Today's Reminders: ${stats.todayReminders}`);
      log(`   📊 Weekly Activity: ${stats.weeklyReminders}`);
      log(`   📈 Monthly Activity: ${stats.monthlyReminders}`);
      log('🧪 This was a statistics check - no emails sent');

    } catch (error) {
      log(`❌ Test mode failed: ${error.message}`, 'ERROR');
    }

  } else {
    // Run actual reminder process
    try {
      const action = process.argv.includes('--force') ? 'force' : 'send';
      const response = await callReminderAPI('daily-reminders', {
        method: 'POST',
        body: JSON.stringify({ action })
      });

      if (response.success) {
        const result = response.result;
        log(`✅ Reminders sent successfully: ${result.success}`);
        log(`❌ Failed: ${result.failed}`);
        log(`📊 Total: ${result.total}`);
      } else {
        log(`⚠️  ${response.message || 'Reminders not sent'}`);
      }
    } catch (error) {
      log(`❌ Daily reminders failed: ${error.message}`, 'ERROR');
    }
  }

  const duration = (Date.now() - startTime) / 1000;
  log(`⏱️  Process completed in ${duration.toFixed(2)} seconds`);
  log('='.repeat(60));
}

// Handle command line arguments
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Daily Reminders Cron Job Script

Sends daily durood recitation reminders to all verified users at 8 PM daily.

Usage: node scripts/daily-reminders.js [options]

Options:
  --help, -h          Show this help message
  --force             Send reminders regardless of current time
  --test              Run in test mode (simulate without sending emails)

Examples:
  node scripts/daily-reminders.js              # Normal execution
  node scripts/daily-reminders.js --force      # Send immediately
  node scripts/daily-reminders.js --test       # Test mode

Default: Only runs at 8 PM daily (20:00)
    `);
    process.exit(0);
  }

  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { main };
