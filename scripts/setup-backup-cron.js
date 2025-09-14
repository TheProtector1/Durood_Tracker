#!/usr/bin/env node

/**
 * Backup Cron Job Setup Script
 * Sets up automated backups every 30 minutes using cron
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Configuration
const CONFIG = {
  BACKUP_INTERVAL: '*/30 * * * *', // Every 30 minutes
  SCRIPT_PATH: path.join(__dirname, 'production-backup.js'),
  LOG_DIR: path.join(__dirname, '..', 'logs'),
  CRON_LOG_FILE: path.join(__dirname, '..', 'logs', 'cron.log')
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

// Get current working directory for cron job
function getProjectPath() {
  return path.resolve(__dirname, '..');
}

// Generate cron job entry
function generateCronJob(system) {
  const projectPath = getProjectPath();
  const nodeCmd = process.execPath;
  const scriptPath = CONFIG.SCRIPT_PATH;
  const logFile = CONFIG.CRON_LOG_FILE;

  // Ensure paths use forward slashes for cron
  const normalizedProjectPath = projectPath.replace(/\\/g, '/');
  const normalizedScriptPath = scriptPath.replace(/\\/g, '/');
  const normalizedLogFile = logFile.replace(/\\/g, '/');

  // Cron job command
  const cronCommand = `${CONFIG.BACKUP_INTERVAL} cd "${normalizedProjectPath}" && ${nodeCmd} "${normalizedScriptPath}" >> "${normalizedLogFile}" 2>&1`;

  return cronCommand;
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

// Check if our backup job already exists
function backupJobExists(crontab, cronCommand) {
  const lines = crontab.split('\n');
  return lines.some(line => line.trim() === cronCommand.trim());
}

// Add backup job to crontab
function addBackupJob(system) {
  console.log('🔧 Setting up automated backup cron job...');

  const currentCrontab = getCurrentCrontab(system);
  const cronCommand = generateCronJob(system);

  if (backupJobExists(currentCrontab, cronCommand)) {
    console.log('✅ Backup cron job already exists');
    return true;
  }

  // Add our job to the crontab
  const newCrontab = currentCrontab
    ? `${currentCrontab}\n\n# Durood Tracker Production Backup (every 30 minutes)\n${cronCommand}\n`
    : `# Durood Tracker Production Backup (every 30 minutes)\n${cronCommand}\n`;

  try {
    setCrontab(system, newCrontab);
    console.log('✅ Backup cron job added successfully');
    console.log(`📅 Schedule: Every 30 minutes`);
    console.log(`📁 Project: ${getProjectPath()}`);
    console.log(`📋 Command: ${cronCommand}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to add cron job: ${error.message}`);
    return false;
  }
}

// Remove backup job from crontab
function removeBackupJob(system) {
  console.log('🗑️  Removing backup cron job...');

  const currentCrontab = getCurrentCrontab(system);
  const cronCommand = generateCronJob(system);

  if (!backupJobExists(currentCrontab, cronCommand)) {
    console.log('ℹ️  Backup cron job not found');
    return true;
  }

  // Remove our job from crontab
  const lines = currentCrontab.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed !== cronCommand.trim() &&
           !trimmed.includes('# Durood Tracker Production Backup');
  });

  const newCrontab = filteredLines.join('\n');

  try {
    setCrontab(system, newCrontab);
    console.log('✅ Backup cron job removed successfully');
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
      if (trimmed.includes('production-backup.js')) {
        foundOurJob = true;
        console.log('   ⭐ This is the Durood Tracker backup job');
      }
    } else if (trimmed.includes('Durood Tracker')) {
      console.log(`${index + 1}. ${trimmed} (comment)`);
    }
  });

  if (!foundOurJob) {
    console.log('\n❌ Durood Tracker backup job not found in cron');
  } else {
    console.log('\n✅ Durood Tracker backup job is active');
  }
}

// Test cron job
function testCronJob(system) {
  console.log('🧪 Testing backup cron job...');

  const cronCommand = generateCronJob(system);
  console.log(`📋 Would run: ${cronCommand}`);

  console.log('\n🔍 Testing backup script manually...');
  try {
    execSync(`cd "${getProjectPath()}" && node "${CONFIG.SCRIPT_PATH}"`, { stdio: 'inherit' });
    console.log('✅ Backup script test completed successfully');
    return true;
  } catch (error) {
    console.log(`❌ Backup script test failed: ${error.message}`);
    return false;
  }
}

// Manual setup instructions
function showManualSetupInstructions(system) {
  const cronCommand = generateCronJob(system);
  const projectPath = getProjectPath();

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
  console.log(`   tail -f ${CONFIG.CRON_LOG_FILE}`);
  console.log('');
  console.log(`📁 Project Path: ${projectPath}`);
  console.log(`📋 Full Command: ${cronCommand}`);
}

// Main setup function
async function setupBackupCron(action = 'setup') {
  console.log('🚀 CRON JOB SETUP FOR PRODUCTION BACKUPS');
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
      const setupSuccess = addBackupJob(system);
      if (setupSuccess) {
        console.log('\n🎉 Automated backup system is now active!');
        console.log('📅 Backups will run every 30 minutes');
        console.log(`📁 Check logs: ${CONFIG.CRON_LOG_FILE}`);
      }
      return setupSuccess;

    case 'remove':
      return removeBackupJob(system);

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
Cron Job Setup for Production Backups

Usage: node scripts/setup-backup-cron.js [options]

Options:
  --help, -h          Show this help message
  --remove, -r        Remove the backup cron job
  --list, -l          List current cron jobs
  --test, -t          Test the backup script without setting up cron

Examples:
  node scripts/setup-backup-cron.js          # Setup cron job
  node scripts/setup-backup-cron.js --test   # Test backup script
  node scripts/setup-backup-cron.js --list   # List cron jobs
  node scripts/setup-backup-cron.js --remove # Remove cron job

Default: Sets up automated backups every 30 minutes
    `);
    process.exit(0);
  }

  const success = await setupBackupCron(action);

  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Export for testing
module.exports = { setupBackupCron, generateCronJob, detectSystem };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
