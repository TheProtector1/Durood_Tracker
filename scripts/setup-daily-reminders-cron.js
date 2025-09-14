#!/usr/bin/env node

/**
 * Setup Daily Reminders Cron Job
 * Sets up automated daily reminder emails at 8:00 PM
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const CONFIG = {
  SCHEDULE_TIME: '0 20 * * *', // Every day at 8:00 PM (20:00)
  SCRIPT_PATH: path.join(__dirname, 'daily-reminders-cron.js'),
  LOG_DIR: path.join(__dirname, '..', 'logs'),
  CRON_COMMENT: '# Durood Tracker Daily Reminders (8:00 PM daily)'
};

// Ensure directories exist
function ensureDirectories() {
  [CONFIG.LOG_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Detect OS and package manager
function detectSystem() {
  const platform = os.platform();

  if (platform === 'darwin') {
    return { platform: 'macOS', cronCmd: 'crontab', packageManager: 'brew' };
  } else if (platform === 'linux') {
    return { platform: 'Linux', cronCmd: 'crontab', packageManager: 'apt' };
  } else if (platform === 'win32') {
    return { platform: 'Windows', cronCmd: null, packageManager: null };
  } else {
    return { platform: 'Unknown', cronCmd: null, packageManager: null };
  }
}

// Check if cron is available
function checkCronAvailability(system) {
  if (!system.cronCmd) {
    console.log('❌ Cron is not available on this system (Windows)');
    return false;
  }

  try {
    execSync(`${system.cronCmd} -l`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('❌ Cron service not available or not running');
    return false;
  }
}

// Get current crontab
function getCurrentCrontab(system) {
  try {
    const output = execSync(`${system.cronCmd} -l`, { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    // No existing crontab
    return '';
  }
}

// Set new crontab
function setCrontab(system, crontabContent) {
  const tempFile = path.join(os.tmpdir(), 'temp-crontab');

  try {
    fs.writeFileSync(tempFile, crontabContent);
    execSync(`${system.cronCmd} "${tempFile}"`);
    fs.unlinkSync(tempFile);
    return true;
  } catch (error) {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    throw error;
  }
}

// Check if our daily reminders job already exists
function dailyRemindersJobExists(crontab, cronCommand) {
  const lines = crontab.split('\n');
  return lines.some(line => line.trim() === cronCommand.trim());
}

// Generate cron job entry
function generateCronJob(system) {
  const projectPath = path.resolve(__dirname, '..');
  const nodeCmd = process.execPath;
  const scriptPath = CONFIG.SCRIPT_PATH;
  const logFile = path.join(CONFIG.LOG_DIR, 'daily-reminders-cron.log');

  // Ensure paths use forward slashes for cron
  const normalizedProjectPath = projectPath.replace(/\\/g, '/');
  const normalizedScriptPath = scriptPath.replace(/\\/g, '/');
  const normalizedLogFile = logFile.replace(/\\/g, '/');

  // Cron job command
  const cronCommand = `${CONFIG.SCHEDULE_TIME} cd "${normalizedProjectPath}" && ${nodeCmd} "${normalizedScriptPath}" >> "${normalizedLogFile}" 2>&1`;

  return cronCommand;
}

// Add daily reminders job to crontab
function addDailyRemindersJob(system) {
  console.log('🔔 Setting up daily reminders cron job...');

  const currentCrontab = getCurrentCrontab(system);
  const cronCommand = generateCronJob(system);

  if (dailyRemindersJobExists(currentCrontab, cronCommand)) {
    console.log('✅ Daily reminders cron job already exists');
    return true;
  }

  // Add our job to the crontab
  const newCrontab = currentCrontab
    ? `${currentCrontab}\n\n${CONFIG.CRON_COMMENT}\n${cronCommand}\n`
    : `${CONFIG.CRON_COMMENT}\n${cronCommand}\n`;

  try {
    setCrontab(system, newCrontab);
    console.log('✅ Daily reminders cron job added successfully');
    console.log(`📅 Schedule: Every day at 8:00 PM (20:00)`);
    console.log(`🔔 Reminder emails will be sent daily`);
    console.log(`📁 Project: ${path.resolve(__dirname, '..')}`);
    console.log(`📋 Command: ${cronCommand}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to add cron job: ${error.message}`);
    return false;
  }
}

// Remove daily reminders job from crontab
function removeDailyRemindersJob(system) {
  console.log('🔕 Removing daily reminders cron job...');

  const currentCrontab = getCurrentCrontab(system);
  const cronCommand = generateCronJob(system);

  if (!dailyRemindersJobExists(currentCrontab, cronCommand)) {
    console.log('ℹ️  Daily reminders cron job not found');
    return true;
  }

  // Remove our job from crontab
  const lines = currentCrontab.split('\n');
  const filteredLines = lines.filter((line, index) => {
    const trimmed = line.trim();
    // Remove the job line and the comment line above it
    if (trimmed === cronCommand.trim()) {
      return false;
    }
    if (trimmed === CONFIG.CRON_COMMENT && lines[index + 1]?.trim() === cronCommand.trim()) {
      return false;
    }
    return true;
  });

  const newCrontab = filteredLines.join('\n');

  try {
    setCrontab(system, newCrontab);
    console.log('✅ Daily reminders cron job removed successfully');
    return true;
  } catch (error) {
    console.log(`❌ Failed to remove cron job: ${error.message}`);
    return false;
  }
}

// List current cron jobs
function listCronJobs(system) {
  console.log('📋 Current Cron Jobs:');
  console.log('='.repeat(60));

  const currentCrontab = getCurrentCrontab(system);
  if (!currentCrontab) {
    console.log('No cron jobs found');
    return;
  }

  const lines = currentCrontab.split('\n');
  let foundOurJob = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      console.log(`${index + 1}. ${trimmed}`);
      if (trimmed.includes('daily-reminders-cron.js')) {
        foundOurJob = true;
        console.log('   🔔 This is the Durood Tracker daily reminders job');
      }
    } else if (trimmed.includes('Durood Tracker Daily Reminders')) {
      console.log(`${index + 1}. ${trimmed} (comment)`);
    }
  });

  if (!foundOurJob) {
    console.log('\n❌ Durood Tracker daily reminders job not found in cron');
  } else {
    console.log('\n✅ Durood Tracker daily reminders job is active');
  }
}

// Test cron job
function testCronJob(system) {
  console.log('🧪 Testing daily reminders cron job...');

  const cronCommand = generateCronJob(system);
  console.log(`📋 Would run: ${cronCommand}`);

  console.log('\n🔍 Testing reminder script manually...');
  try {
    execSync(`cd "${path.resolve(__dirname, '..')}" && node "${CONFIG.SCRIPT_PATH}" --stats-only`, { stdio: 'inherit' });
    console.log('✅ Daily reminders script test completed successfully');
    return true;
  } catch (error) {
    console.log(`❌ Daily reminders script test failed: ${error.message}`);
    return false;
  }
}

// Manual setup instructions
function showManualSetupInstructions(system) {
  const cronCommand = generateCronJob(system);
  const projectPath = path.resolve(__dirname, '..');

  console.log('\n📖 MANUAL CRON JOB SETUP:');
  console.log('='.repeat(60));
  console.log('If automatic setup failed, set up the cron job manually:');
  console.log('');
  console.log('1. Open crontab editor:');
  console.log(`   ${system.cronCmd} -e`);
  console.log('');
  console.log('2. Add this line at the end:');
  console.log(`   ${cronCommand}`);
  console.log('');
  console.log('3. Save and exit the editor');
  console.log('');
  console.log('4. Verify the job was added:');
  console.log(`   ${system.cronCmd} -l`);
  console.log('');
  console.log('5. Check cron logs:');
  console.log(`   tail -f ${path.join(CONFIG.LOG_DIR, 'daily-reminders-cron.log')}`);
  console.log('');
  console.log(`📁 Project Path: ${projectPath}`);
  console.log(`📋 Full Command: ${cronCommand}`);
  console.log(`🔔 Schedule: Every day at 8:00 PM (20:00)`);
}

// Main setup function
async function setupDailyRemindersCron(action = 'setup') {
  console.log('🔔 SETUP DAILY REMINDERS CRON JOB');
  console.log('='.repeat(60));

  const system = detectSystem();
  console.log(`🖥️  Detected System: ${system.platform}`);

  ensureDirectories();

  if (!checkCronAvailability(system)) {
    console.log('\n❌ Cron is not available on this system');
    console.log('💡 On Windows, consider using Task Scheduler instead');
    showManualSetupInstructions(system);
    return false;
  }

  switch (action) {
    case 'setup':
      const setupSuccess = addDailyRemindersJob(system);
      if (setupSuccess) {
        console.log('\n🎉 Daily reminders system is now active!');
        console.log('🔔 Reminder emails will be sent every day at 8:00 PM');
        console.log(`📁 Check logs: ${path.join(CONFIG.LOG_DIR, 'daily-reminders-cron.log')}`);
        console.log('\n📧 Users will receive beautiful personalized reminders with:');
        console.log('   • Daily durood recitation statistics');
        console.log('   • Weekly and monthly progress');
        console.log('   • Prayer times for the day');
        console.log('   • Motivational Islamic quotes');
        console.log('   • Links to continue their spiritual journey');
      }
      return setupSuccess;

    case 'remove':
      return removeDailyRemindersJob(system);

    case 'list':
      listCronJobs(system);
      return true;

    case 'test':
      return testCronJob(system);

    default:
      console.log('❌ Invalid action. Use: setup, remove, list, or test');
      return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let action = 'setup';

  // Parse arguments
  if (args.includes('--remove') || args.includes('-r')) {
    action = 'remove';
  } else if (args.includes('--list') || args.includes('-l')) {
    action = 'list';
  } else if (args.includes('--test') || args.includes('-t')) {
    action = 'test';
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Setup Daily Reminders Cron Job

Sets up automated daily reminder emails at 8:00 PM (20:00) every day.

Usage: node scripts/setup-daily-reminders-cron.js [options]

Options:
  --help, -h          Show this help message
  --remove, -r        Remove the daily reminders cron job
  --list, -l          List current cron jobs
  --test, -t          Test the reminder script without setting up cron

Examples:
  node scripts/setup-daily-reminders-cron.js          # Setup cron job
  node scripts/setup-daily-reminders-cron.js --test   # Test reminder script
  node scripts/setup-daily-reminders-cron.js --list   # List cron jobs
  node scripts/setup-daily-reminders-cron.js --remove # Remove cron job

Default: Sets up daily reminders at 8:00 PM (20:00)
    `);
    process.exit(0);
  }

  const success = await setupDailyRemindersCron(action);

  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Export for testing
module.exports = { setupDailyRemindersCron, generateCronJob, detectSystem };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
