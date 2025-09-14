#!/usr/bin/env node

/**
 * Backup System Status Checker
 * Shows current backup status and provides quick commands
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  BACKUP_DIR: path.join(__dirname, '..', 'backups'),
  LOG_DIR: path.join(__dirname, '..', 'logs')
};

// Check if directories exist and create them if needed
function ensureDirectories() {
  [CONFIG.BACKUP_DIR, CONFIG.LOG_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Get backup files
function getBackupFiles() {
  try {
    return fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter(file => file.startsWith('production-backup-'))
      .map(file => {
        const filePath = path.join(CONFIG.BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          mtime: stats.mtime,
          age: Date.now() - stats.mtime.getTime()
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
  } catch (error) {
    return [];
  }
}

// Format file size
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format time ago
function formatTimeAgo(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
}

// Check if cron job is running (macOS/Linux)
function checkCronStatus() {
  try {
    const { execSync } = require('child_process');
    const crontab = execSync('crontab -l', { encoding: 'utf8' });
    return crontab.includes('production-backup.js');
  } catch (error) {
    return false;
  }
}

// Main status function
function showBackupStatus() {
  console.log('🛡️  DUROOD TRACKER BACKUP SYSTEM STATUS');
  console.log('='.repeat(50));

  ensureDirectories();

  // System Information
  console.log('\n📊 SYSTEM INFO:');
  console.log(`   📁 Backup Directory: ${CONFIG.BACKUP_DIR}`);
  console.log(`   📋 Log Directory: ${CONFIG.LOG_DIR}`);
  console.log(`   🖥️  Platform: ${process.platform}`);
  console.log(`   📅 Current Time: ${new Date().toLocaleString()}`);

  // Backup Files
  const backups = getBackupFiles();
  console.log('\n💾 BACKUP FILES:');
  if (backups.length === 0) {
    console.log('   ❌ No backup files found');
  } else {
    console.log(`   📊 Total Backups: ${backups.length}`);
    backups.slice(0, 5).forEach((backup, index) => {
      const compressed = backup.name.endsWith('.gz') ? ' (compressed)' : '';
      console.log(`   ${index + 1}. ${backup.name}`);
      console.log(`      📅 Created: ${backup.mtime.toLocaleString()}`);
      console.log(`      📏 Size: ${formatSize(backup.size)}${compressed}`);
      console.log(`      ⏰ Age: ${formatTimeAgo(backup.age)}`);
      console.log('');
    });

    if (backups.length > 5) {
      console.log(`   ... and ${backups.length - 5} more backups`);
    }
  }

  // Cron Job Status
  console.log('\n⏰ AUTOMATED BACKUPS:');
  const cronActive = checkCronStatus();
  if (cronActive) {
    console.log('   ✅ Cron job is ACTIVE');
    console.log('   📅 Schedule: Every 30 minutes');
  } else {
    console.log('   ❌ Cron job is NOT active');
    console.log('   💡 Run: node scripts/setup-backup-cron.js');
  }

  // Storage Information
  try {
    const stats = fs.statSync(CONFIG.BACKUP_DIR);
    console.log('\n💽 STORAGE INFO:');
    console.log(`   📁 Backup directory exists: ✅`);
    console.log(`   📋 Log directory exists: ✅`);
  } catch (error) {
    console.log('\n💽 STORAGE INFO:');
    console.log('   ❌ Error checking storage');
  }

  // Quick Commands
  console.log('\n🚀 QUICK COMMANDS:');
  console.log('   📋 List backups:     node scripts/restore-backup.js --list');
  console.log('   🔄 Manual backup:    node scripts/production-backup.js');
  console.log('   🔧 Setup cron:       node scripts/setup-backup-cron.js');
  console.log('   🔧 Remove cron:      node scripts/setup-backup-cron.js --remove');
  console.log('   📖 Help:             node scripts/production-backup.js --help');

  // Status Summary
  console.log('\n📈 STATUS SUMMARY:');
  const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
  const latestBackup = backups[0];

  if (latestBackup) {
    const ageHours = latestBackup.age / (1000 * 60 * 60);
    if (ageHours < 1) {
      console.log('   ✅ Latest backup: Less than 1 hour old');
    } else if (ageHours < 24) {
      console.log(`   ✅ Latest backup: ${Math.floor(ageHours)} hours old`);
    } else {
      console.log(`   ⚠️  Latest backup: ${Math.floor(ageHours / 24)} days old`);
    }
  }

  console.log(`   📊 Total backups: ${backups.length}`);
  console.log(`   💾 Total size: ${formatSize(totalSize)}`);
  console.log(`   🔄 Cron active: ${cronActive ? 'Yes' : 'No'}`);

  if (backups.length > 0 && cronActive) {
    console.log('\n🎉 BACKUP SYSTEM IS FULLY OPERATIONAL!');
  } else if (backups.length > 0) {
    console.log('\n⚠️  MANUAL BACKUPS WORKING - SETUP AUTOMATION');
  } else {
    console.log('\n🚨 NO BACKUPS FOUND - RUN MANUAL BACKUP');
  }

  console.log('='.repeat(50));
}

// Command line interface
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Backup System Status Checker

Shows current backup status, recent backups, and system information.

Usage: node scripts/backup-status.js [options]

Options:
  --help, -h          Show this help message
  --watch             Watch for changes (updates every 30 seconds)
  --json              Output status as JSON

Examples:
  node scripts/backup-status.js
  node scripts/backup-status.js --watch
    `);
    process.exit(0);
  }

  if (args.includes('--json')) {
    // JSON output mode
    const backups = getBackupFiles();
    const status = {
      timestamp: new Date().toISOString(),
      backups: backups.length,
      latestBackup: backups[0] ? {
        name: backups[0].name,
        age: backups[0].age,
        size: backups[0].size
      } : null,
      cronActive: checkCronStatus(),
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0)
    };
    console.log(JSON.stringify(status, null, 2));
  } else {
    // Normal display mode
    showBackupStatus();

    if (args.includes('--watch')) {
      console.log('\n👀 Watching for changes... (Ctrl+C to stop)');
      setInterval(() => {
        console.clear();
        showBackupStatus();
      }, 30000); // Update every 30 seconds
    }
  }
}

// Export for testing
module.exports = { showBackupStatus, getBackupFiles };

// Run if called directly
if (require.main === module) {
  main();
}
