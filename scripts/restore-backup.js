#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores data from compressed backup files to the database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Load configuration from backup-config.json
function loadConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'backup-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Failed to load backup configuration:', error.message);
    // Return default configuration
    return {
      backup: {
        enabled: true,
        interval_minutes: 30,
        retention_days: 7,
        max_backups: 50,
        compress: true,
        backup_dir: "./backups",
        log_dir: "./logs"
      }
    };
  }
}

const CONFIG_DATA = loadConfig();
const CONFIG = {
  BACKUP_DIR: path.resolve(__dirname, '..', CONFIG_DATA.backup.backup_dir || 'backups'),
  LOG_FILE: path.resolve(__dirname, '..', CONFIG_DATA.backup.log_dir || 'logs', 'restore.log')
};

// Ensure directories exist
function ensureDirectories() {
  [CONFIG.BACKUP_DIR, path.dirname(CONFIG.LOG_FILE)].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;

  console.log(logMessage.trim());

  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Get available backup files
function getAvailableBackups() {
  try {
    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter(file => file.startsWith('production-backup-'))
      .map(file => {
        const filePath = path.join(CONFIG.BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          mtime: stats.mtime,
          isCompressed: file.endsWith('.gz')
        };
      })
      .sort((a, b) => b.mtime - a.mtime); // Most recent first

    return files;
  } catch (error) {
    log(`Error reading backup directory: ${error.message}`, 'ERROR');
    return [];
  }
}

// Decompress backup file if needed
function decompressBackup(backupPath) {
  if (backupPath.endsWith('.gz')) {
    const decompressedPath = backupPath.slice(0, -3);
    log(`🗜️  Decompressing backup: ${path.basename(backupPath)}`);
    execSync(`gunzip -c "${backupPath}" > "${decompressedPath}"`);
    return decompressedPath;
  }
  return backupPath;
}

// Load backup data from file
function loadBackupData(backupPath) {
  try {
    const data = fs.readFileSync(backupPath, 'utf8');
    const backupData = JSON.parse(data);

    // Validate backup structure
    if (!backupData.metadata || !backupData.data) {
      throw new Error('Invalid backup file structure');
    }

    const version = backupData.metadata.version || '1.0';
    log(`📊 Backup loaded (v${version}): ${backupData.metadata.recordCounts.users || 0} users, ${backupData.metadata.recordCounts.duroodEntries || 0} durood entries`);
    log(`📅 Exported: ${new Date(backupData.metadata.exportedAt).toLocaleString()}`);
    log(`🔍 Source: ${backupData.metadata.source || 'unknown'}`);

    return backupData;
  } catch (error) {
    throw new Error(`Failed to load backup data: ${error.message}`);
  }
}

// Clear existing data (optional - with confirmation)
async function clearExistingData(prisma) {
  log('🧹 Clearing existing data...');

  try {
    // Clear in reverse order of dependencies (avoiding foreign key constraints)
    await prisma.duaFavorite.deleteMany();
    await prisma.goalTimerSession.deleteMany();
    await prisma.dailySpin.deleteMany();
    await prisma.prayerCompletion.deleteMany();
    await prisma.duroodEntry.deleteMany();
    await prisma.authenticPrayerTimes.deleteMany();
    await prisma.dua.deleteMany();
    await prisma.userLevel.deleteMany();
    await prisma.passwordReset.deleteMany();
    await prisma.totalCounter.deleteMany();
    await prisma.user.deleteMany();

    log('✅ Existing data cleared');
  } catch (error) {
    log(`❌ Failed to clear existing data: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Restore data to database
async function restoreData(prisma, backupData) {
  log('🔄 Starting data restoration...');

  const { data } = backupData;
  let restoredRecords = 0;

  try {
    // Restore users first (they have dependencies)
    if (data.users && data.users.length > 0) {
      log(`👥 Restoring ${data.users.length} users...`);
      for (const user of data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user
        });
      }
      restoredRecords += data.users.length;
    }

    // Restore password resets
    if (data.passwordResets && data.passwordResets.length > 0) {
      log(`🔑 Restoring ${data.passwordResets.length} password resets...`);
      for (const reset of data.passwordResets) {
        await prisma.passwordReset.upsert({
          where: { id: reset.id },
          update: reset,
          create: reset
        });
      }
      restoredRecords += data.passwordResets.length;
    }

    // Restore total counters
    if (data.totalCounters && data.totalCounters.length > 0) {
      log(`📊 Restoring ${data.totalCounters.length} total counters...`);
      for (const counter of data.totalCounters) {
        await prisma.totalCounter.upsert({
          where: { id: counter.id },
          update: counter,
          create: counter
        });
      }
      restoredRecords += data.totalCounters.length;
    }

    // Restore authentic prayer times
    if (data.authenticPrayerTimes && data.authenticPrayerTimes.length > 0) {
      log(`🕌 Restoring ${data.authenticPrayerTimes.length} prayer times...`);
      for (const prayerTime of data.authenticPrayerTimes) {
        await prisma.authenticPrayerTimes.upsert({
          where: { id: prayerTime.id },
          update: prayerTime,
          create: prayerTime
        });
      }
      restoredRecords += data.authenticPrayerTimes.length;
    }

    // Restore duas
    if (data.duas && data.duas.length > 0) {
      log(`📿 Restoring ${data.duas.length} duas...`);
      for (const dua of data.duas) {
        await prisma.dua.upsert({
          where: { id: dua.id },
          update: dua,
          create: dua
        });
      }
      restoredRecords += data.duas.length;
    }

    // Restore user levels
    if (data.userLevels && data.userLevels.length > 0) {
      log(`⭐ Restoring ${data.userLevels.length} user levels...`);
      for (const level of data.userLevels) {
        await prisma.userLevel.upsert({
          where: { id: level.id },
          update: level,
          create: level
        });
      }
      restoredRecords += data.userLevels.length;
    }

    // Restore durood entries
    if (data.duroodEntries && data.duroodEntries.length > 0) {
      log(`🙏 Restoring ${data.duroodEntries.length} durood entries...`);
      for (const entry of data.duroodEntries) {
        await prisma.duroodEntry.upsert({
          where: { id: entry.id },
          update: entry,
          create: entry
        });
      }
      restoredRecords += data.duroodEntries.length;
    }

    // Restore prayer completions
    if (data.prayerCompletions && data.prayerCompletions.length > 0) {
      log(`🕌 Restoring ${data.prayerCompletions.length} prayer completions...`);
      for (const completion of data.prayerCompletions) {
        await prisma.prayerCompletion.upsert({
          where: { id: completion.id },
          update: completion,
          create: completion
        });
      }
      restoredRecords += data.prayerCompletions.length;
    }

    // Restore daily spins
    if (data.dailySpins && data.dailySpins.length > 0) {
      log(`🎰 Restoring ${data.dailySpins.length} daily spins...`);
      for (const spin of data.dailySpins) {
        await prisma.dailySpin.upsert({
          where: { id: spin.id },
          update: spin,
          create: spin
        });
      }
      restoredRecords += data.dailySpins.length;
    }

    // Restore goal timer sessions
    if (data.goalTimerSessions && data.goalTimerSessions.length > 0) {
      log(`⏰ Restoring ${data.goalTimerSessions.length} timer sessions...`);
      for (const session of data.goalTimerSessions) {
        await prisma.goalTimerSession.upsert({
          where: { id: session.id },
          update: session,
          create: session
        });
      }
      restoredRecords += data.goalTimerSessions.length;
    }

    // Restore dua favorites (last, depends on users and duas)
    if (data.duaFavorites && data.duaFavorites.length > 0) {
      log(`❤️ Restoring ${data.duaFavorites.length} dua favorites...`);
      for (const favorite of data.duaFavorites) {
        await prisma.duaFavorite.upsert({
          where: { id: favorite.id },
          update: favorite,
          create: favorite
        });
      }
      restoredRecords += data.duaFavorites.length;
    }

    log(`✅ Data restoration completed: ${restoredRecords} records restored`);
    return restoredRecords;

  } catch (error) {
    log(`❌ Data restoration failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Interactive backup selection
function selectBackupInteractive(backups) {
  return new Promise((resolve) => {
    console.log('\n📁 Available Backups:');
    console.log('='.repeat(80));

    backups.forEach((backup, index) => {
      const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
      const date = backup.mtime.toLocaleString();
      const compressed = backup.isCompressed ? ' (compressed)' : '';
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   📅 Date: ${date}`);
      console.log(`   📏 Size: ${sizeMB} MB${compressed}`);
      console.log('');
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Select backup to restore (number) or "cancel" to exit: ', (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'cancel') {
        console.log('❌ Restore cancelled');
        process.exit(0);
      }

      const index = parseInt(answer) - 1;
      if (isNaN(index) || index < 0 || index >= backups.length) {
        console.log('❌ Invalid selection');
        process.exit(1);
      }

      resolve(backups[index]);
    });
  });
}

// Main restore function
async function restoreFromBackup(backupPath = null, clearData = false) {
  log('🚀 STARTING DATABASE RESTORE');

  const startTime = Date.now();
  const prisma = new PrismaClient();
  let tempFile = null;

  try {
    // Connect to database
    log('🔌 Connecting to database...');
    await prisma.$connect();
    log('✅ Connected to database');

    let selectedBackup;

    if (backupPath) {
      // Use provided backup path
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      selectedBackup = {
        name: path.basename(backupPath),
        path: backupPath,
        isCompressed: backupPath.endsWith('.gz')
      };
    } else {
      // Interactive selection
      const backups = getAvailableBackups();
      if (backups.length === 0) {
        throw new Error('No backup files found in backup directory');
      }

      selectedBackup = await selectBackupInteractive(backups);
    }

    // Decompress if needed
    const workingPath = selectedBackup.isCompressed
      ? decompressBackup(selectedBackup.path)
      : selectedBackup.path;

    if (selectedBackup.isCompressed) {
      tempFile = workingPath; // Mark for cleanup
    }

    // Load backup data
    const backupData = loadBackupData(workingPath);

    // Clear existing data if requested
    if (clearData) {
      await clearExistingData(prisma);
    }

    // Restore data
    const restoredRecords = await restoreData(prisma, backupData);

    // Cleanup temp file
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      log('🧹 Cleaned up temporary file');
    }

    const duration = (Date.now() - startTime) / 1000;
    log(`✅ DATABASE RESTORE COMPLETED in ${duration.toFixed(2)}s`);
    log(`📊 Records restored: ${restoredRecords}`);

    return { success: true, restoredRecords };

  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    log(`❌ DATABASE RESTORE FAILED after ${duration.toFixed(2)}s: ${error.message}`, 'ERROR');

    // Cleanup temp file on error
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      log('🧹 Cleaned up temporary file after error');
    }

    return { success: false, error: error.message };

  } finally {
    await prisma.$disconnect();
    log('🔌 Disconnected from database');
  }
}

// Main execution
async function main() {
  ensureDirectories();

  const args = process.argv.slice(2);

  // Help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Database Restore Script

Usage: node scripts/restore-backup.js [options] [backup-file]

Options:
  --help, -h              Show this help message
  --clear                 Clear existing data before restore (DANGER!)
  --list                  List available backups and exit
  --backup <file>         Specify backup file to restore (alternative to interactive)

Examples:
  node scripts/restore-backup.js                    # Interactive restore
  node scripts/restore-backup.js --list             # List backups
  node scripts/restore-backup.js --clear            # Clear data + interactive restore
  node scripts/restore-backup.js --backup backup.json.gz  # Restore specific file

WARNING: Using --clear will DELETE ALL existing data before restore!
    `);
    process.exit(0);
  }

  // List backups
  if (args.includes('--list')) {
    const backups = getAvailableBackups();
    console.log('\n📁 Available Backups:');
    console.log('='.repeat(80));

    if (backups.length === 0) {
      console.log('No backup files found');
    } else {
      backups.forEach((backup, index) => {
        const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
        const date = backup.mtime.toLocaleString();
        const compressed = backup.isCompressed ? ' (compressed)' : '';
        console.log(`${index + 1}. ${backup.name}`);
        console.log(`   📅 Date: ${date}`);
        console.log(`   📏 Size: ${sizeMB} MB${compressed}`);
        console.log('');
      });
    }
    process.exit(0);
  }

  // Parse arguments
  const clearData = args.includes('--clear');
  let backupPath = null;

  const backupIndex = args.indexOf('--backup');
  if (backupIndex !== -1 && args[backupIndex + 1]) {
    backupPath = args[backupIndex + 1];
  } else if (args.length > 0 && !args[0].startsWith('--')) {
    backupPath = args[0];
  }

  // Warning for clear operation
  if (clearData) {
    console.log('⚠️  WARNING: --clear will DELETE ALL existing data!');
    console.log('This action cannot be undone.');
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await new Promise((resolve) => {
      rl.question('Type "YES" to confirm: ', (answer) => {
        rl.close();
        if (answer !== 'YES') {
          console.log('❌ Operation cancelled');
          process.exit(0);
        }
        resolve();
      });
    });
  }

  log('='.repeat(60));
  log('🔄 DATABASE RESTORE SYSTEM');
  log('='.repeat(60));

  const result = await restoreFromBackup(backupPath, clearData);

  log('='.repeat(60));
  if (result.success) {
    log('🎉 RESTORE COMPLETED SUCCESSFULLY');
    process.exit(0);
  } else {
    log('💥 RESTORE FAILED');
    process.exit(1);
  }
}

// Export for testing
module.exports = { restoreFromBackup, getAvailableBackups };

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
