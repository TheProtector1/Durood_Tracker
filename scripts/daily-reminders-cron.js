#!/usr/bin/env node

/**
 * Daily Reminders Cron Job
 * Runs daily at 8:00 PM (20:00) to send durood reminder emails
 */

// Use API approach instead of direct imports
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

// Configuration
const CONFIG = {
  SCHEDULE_TIME: '0 20 * * *', // Every day at 8:00 PM (20:00)
  SCRIPT_PATH: __filename,
  LOG_FILE: './logs/daily-reminders.log'
};

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  console.log(logMessage.trim());

  try {
    require('fs').appendFileSync(CONFIG.LOG_FILE, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Ensure log directory exists
function ensureLogDirectory() {
  const fs = require('fs');
  const path = require('path');

  const logDir = path.dirname(CONFIG.LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Main execution
async function runDailyReminders() {
  log('🌅 STARTING DAILY REMINDERS CRON JOB');
  log('=====================================');

  const startTime = Date.now();

  try {
    // Log current date and time
    const now = new Date();
    log(`📅 Current Date: ${now.toLocaleDateString()}`);
    log(`🕐 Current Time: ${now.toLocaleTimeString()}`);
    log(`🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

    // Get reminder statistics
    log('📊 Getting reminder statistics...');
    const statsResponse = await callReminderAPI('daily-reminders', {
      method: 'POST',
      body: JSON.stringify({ action: 'stats' })
    });
    const stats = statsResponse.stats;
    log(`👥 Total Users: ${stats.totalUsers}`);
    log(`✅ Active Users: ${stats.activeUsers}`);
    log(`📧 Today's Reminders: ${stats.todayReminders}`);
    log(`📊 Weekly Activity: ${stats.weeklyReminders}`);
    log(`📈 Monthly Activity: ${stats.monthlyReminders}`);

    // Send daily reminders
    log('📧 Sending daily reminders...');
    const resultResponse = await callReminderAPI('daily-reminders', {
      method: 'POST',
      body: JSON.stringify({ action: 'send' })
    });
    const result = resultResponse.result;

    // Log results
    const duration = (Date.now() - startTime) / 1000;
    log(`✅ Reminders sent successfully: ${result.success}`);
    log(`❌ Reminders failed: ${result.failed}`);
    log(`📊 Total processed: ${result.total}`);
    log(`⏱️  Execution time: ${duration.toFixed(2)} seconds`);

    if (result.success > 0) {
      log('🎉 DAILY REMINDERS COMPLETED SUCCESSFULLY');
    } else {
      log('ℹ️  NO REMINDERS SENT (no eligible users found)');
    }

  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    log(`❌ DAILY REMINDERS FAILED after ${duration.toFixed(2)}s`, 'ERROR');
    log(`Error details: ${error.message}`, 'ERROR');
    log(`Stack trace: ${error.stack}`, 'ERROR');

    process.exit(1);
  }

  log('=====================================');
  log('🌙 DAILY REMINDERS CRON JOB COMPLETED');
}

// Handle command line arguments
if (require.main === module) {
  ensureLogDirectory();

  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Daily Reminders Cron Job

Runs daily at 8:00 PM to send personalized durood reminder emails to users.

Usage: node scripts/daily-reminders-cron.js [options]

Options:
  --help, -h          Show this help message
  --dry-run           Show what would be done without sending emails
  --stats-only        Only show statistics without sending emails
  --test              Send test reminder to first user only

Examples:
  node scripts/daily-reminders-cron.js              # Normal execution
  node scripts/daily-reminders-cron.js --dry-run    # Preview only
  node scripts/daily-reminders-cron.js --stats-only # Stats only
  node scripts/daily-reminders-cron.js --test       # Test with one user

Scheduled: Every day at 8:00 PM (20:00)
Timezone: System timezone (${Intl.DateTimeFormat().resolvedOptions().timeZone})
    `);
    process.exit(0);
  }

  if (args.includes('--stats-only')) {
    // Only show statistics
    log('📊 SHOWING REMINDER STATISTICS ONLY');
    callReminderAPI('daily-reminders', {
      method: 'POST',
      body: JSON.stringify({ action: 'stats' })
    })
      .then(response => {
        const stats = response.stats;
        console.log('\n📈 REMINDER STATISTICS:');
        console.log(`👥 Total Users: ${stats.totalUsers}`);
        console.log(`✅ Active Users: ${stats.activeUsers}`);
        console.log(`📧 Today's Reminders: ${stats.todayReminders}`);
        console.log(`📊 Weekly Activity: ${stats.weeklyReminders}`);
        console.log(`📈 Monthly Activity: ${stats.monthlyReminders}`);
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Error getting stats:', error.message);
        process.exit(1);
      });
  } else {
    // Normal execution
    runDailyReminders()
      .then(() => {
        process.exit(0);
      })
      .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
      });
  }
}

module.exports = { runDailyReminders, CONFIG };
