#!/usr/bin/env node

/**
 * Production Database Backup Script
 * Exports data from production PostgreSQL database and creates compressed backups
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  BACKUP_DIR: path.join(__dirname, '..', 'backups'),
  RETENTION_DAYS: 7, // Keep backups for 7 days
  COMPRESS: true,
  MAX_BACKUPS: 50, // Maximum number of backups to keep
  LOG_FILE: path.join(__dirname, '..', 'logs', 'backup.log')
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

// Generate backup filename
function getBackupFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `production-backup-${timestamp}.json`;
}

// Clean up old backups
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(CONFIG.BACKUP_DIR)
      .filter(file => file.startsWith('production-backup-') && file.endsWith('.json.gz'))
      .map(file => ({
        name: file,
        path: path.join(CONFIG.BACKUP_DIR, file),
        mtime: fs.statSync(path.join(CONFIG.BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // Remove backups older than retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.RETENTION_DAYS);

    files.forEach(file => {
      if (file.mtime < cutoffDate) {
        fs.unlinkSync(file.path);
        log(`Removed old backup: ${file.name}`);
      }
    });

    // Remove excess backups if we have too many
    if (files.length > CONFIG.MAX_BACKUPS) {
      const toRemove = files.slice(CONFIG.MAX_BACKUPS);
      toRemove.forEach(file => {
        fs.unlinkSync(file.path);
        log(`Removed excess backup: ${file.name}`);
      });
    }

  } catch (error) {
    log(`Error cleaning up old backups: ${error.message}`, 'ERROR');
  }
}

// Backup production database
async function backupProductionDatabase() {
  log('🚀 STARTING PRODUCTION DATABASE BACKUP');

  const startTime = Date.now();
  const prisma = new PrismaClient();
  let backupPath = null;

  try {
    // Connect to database
    log('🔌 Connecting to production database...');
    await prisma.$connect();
    log('✅ Connected to production database');

    // Export data from all tables (sequential to avoid connection issues)
    log('📊 Exporting data from all tables...');

    log('👥 Exporting users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpires: true
      }
    });

    log('🙏 Exporting durood entries...');
    const duroodEntries = await prisma.duroodEntry.findMany();

    log('🏆 Exporting daily rankings...');
    const dailyRankings = await prisma.dailyRanking.findMany();

    log('🕌 Exporting prayer completions...');
    const prayerCompletions = await prisma.prayerCompletion.findMany();

    log('🔑 Exporting password resets...');
    const passwordResets = await prisma.passwordReset.findMany({
      select: {
        id: true,
        email: true,
        token: true,
        expires: true,
        createdAt: true
      }
    });

    log('📊 Exporting total counters...');
    const totalCounters = await prisma.totalCounter.findMany();

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        source: 'production',
        recordCounts: {
          users: users.length,
          duroodEntries: duroodEntries.length,
          dailyRankings: dailyRankings.length,
          prayerCompletions: prayerCompletions.length,
          passwordResets: passwordResets.length,
          totalCounters: totalCounters.length
        }
      },
      data: {
        users,
        duroodEntries,
        dailyRankings,
        prayerCompletions,
        passwordResets,
        totalCounters
      }
    };

    log(`📈 Data exported: ${users.length} users, ${duroodEntries.length} durood entries, ${dailyRankings.length} rankings`);

    // Save to file
    const filename = getBackupFilename();
    const jsonPath = path.join(CONFIG.BACKUP_DIR, filename);
    const jsonData = JSON.stringify(exportData, null, 2);

    fs.writeFileSync(jsonPath, jsonData);
    log(`💾 Backup saved: ${filename}`);

    // Compress the backup
    if (CONFIG.COMPRESS) {
      const compressedPath = `${jsonPath}.gz`;
      execSync(`gzip "${jsonPath}"`);
      backupPath = compressedPath;
      log(`🗜️  Backup compressed: ${filename}.gz`);
    } else {
      backupPath = jsonPath;
    }

    // Clean up old backups
    cleanupOldBackups();

    const duration = (Date.now() - startTime) / 1000;
    log(`✅ PRODUCTION BACKUP COMPLETED in ${duration.toFixed(2)}s`);
    log(`📁 Backup location: ${backupPath}`);

    // Summary
    const totalRecords = users.length + duroodEntries.length + dailyRankings.length +
                        prayerCompletions.length + passwordResets.length + totalCounters.length;

    log(`📊 BACKUP SUMMARY:`);
    log(`   👥 Users: ${users.length}`);
    log(`   🙏 Durood Entries: ${duroodEntries.length}`);
    log(`   🏆 Daily Rankings: ${dailyRankings.length}`);
    log(`   🕌 Prayer Completions: ${prayerCompletions.length}`);
    log(`   🔑 Password Resets: ${passwordResets.length}`);
    log(`   📊 Total Counters: ${totalCounters.length}`);
    log(`   📈 Total Records: ${totalRecords}`);
    log(`   💾 File Size: ${fs.existsSync(backupPath) ? (fs.statSync(backupPath).size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}`);

    return { success: true, backupPath, recordCount: totalRecords };

  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    log(`❌ PRODUCTION BACKUP FAILED after ${duration.toFixed(2)}s: ${error.message}`, 'ERROR');
    log(`Error details: ${error.stack}`, 'ERROR');

    return { success: false, error: error.message };

  } finally {
    await prisma.$disconnect();
    log('🔌 Disconnected from production database');
  }
}

// Main execution
async function main() {
  ensureDirectories();

  log('='.repeat(60));
  log('🛡️  PRODUCTION DATABASE BACKUP SYSTEM');
  log('='.repeat(60));

  const result = await backupProductionDatabase();

  log('='.repeat(60));
  if (result.success) {
    log('🎉 BACKUP COMPLETED SUCCESSFULLY');
    process.exit(0);
  } else {
    log('💥 BACKUP FAILED');
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Production Database Backup Script

Usage: node scripts/production-backup.js [options]

Options:
  --help, -h          Show this help message
  --no-compress       Don't compress the backup file
  --retention <days>  Number of days to keep backups (default: 7)
  --max-backups <n>   Maximum number of backups to keep (default: 50)

Examples:
  node scripts/production-backup.js
  node scripts/production-backup.js --no-compress
  node scripts/production-backup.js --retention 14 --max-backups 100
    `);
    process.exit(0);
  }

  // Parse arguments
  if (args.includes('--no-compress')) {
    CONFIG.COMPRESS = false;
  }

  const retentionIndex = args.indexOf('--retention');
  if (retentionIndex !== -1 && args[retentionIndex + 1]) {
    CONFIG.RETENTION_DAYS = parseInt(args[retentionIndex + 1]);
  }

  const maxBackupsIndex = args.indexOf('--max-backups');
  if (maxBackupsIndex !== -1 && args[maxBackupsIndex + 1]) {
    CONFIG.MAX_BACKUPS = parseInt(args[maxBackupsIndex + 1]);
  }

  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { backupProductionDatabase, CONFIG };
