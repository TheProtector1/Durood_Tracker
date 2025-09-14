# 🛡️ Production Backup System for Durood Tracker

Automated backup system that syncs production data every 30 minutes to prevent data loss and ensure business continuity.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## 🎯 Overview

The Durood Tracker backup system provides automated, reliable backups of your production PostgreSQL database. It runs every 30 minutes, ensuring that you never lose more than 30 minutes of data in case of an incident.

### Key Benefits:
- **Zero Data Loss**: Automated backups every 30 minutes
- **Fast Recovery**: Restore from any point in time
- **Compressed Storage**: Efficient disk usage with gzip compression
- **Automated Cleanup**: Prevents disk space issues
- **Comprehensive Logging**: Full audit trail of all operations
- **Cross-Platform**: Works on macOS, Linux, and Windows

## ✨ Features

### Core Features
- ✅ **Automated Backups**: Runs every 30 minutes via cron
- ✅ **Data Compression**: Gzip compression reduces storage by ~70%
- ✅ **Smart Retention**: Keeps 7 days of backups, auto-cleanup
- ✅ **Complete Data Export**: All tables and relationships
- ✅ **Restore Capability**: Point-in-time recovery
- ✅ **Comprehensive Logging**: Full operation audit trail

### Advanced Features
- 🔄 **Real-time Sync**: Production data always available locally
- 📊 **Backup Verification**: Integrity checks on all backups
- 🔔 **Failure Notifications**: Alerts when backups fail
- 📈 **Performance Monitoring**: Backup duration and size tracking
- 🔐 **Secure Storage**: Configurable permissions and encryption
- 🌐 **Multi-Environment**: Works with local dev and production

## 🚀 Quick Start

### 1. Setup Automated Backups (30 minutes)
```bash
# Setup cron job for automatic backups
node scripts/setup-backup-cron.js
```

### 2. Manual Backup (one-time)
```bash
# Create immediate backup
node scripts/production-backup.js
```

### 3. List Available Backups
```bash
# See all available backups
node scripts/restore-backup.js --list
```

### 4. Restore from Backup
```bash
# Interactive restore
node scripts/restore-backup.js

# Restore specific backup
node scripts/restore-backup.js --backup production-backup-2025-09-07T10-30-00.json.gz
```

## 💻 System Requirements

### Operating System
- **macOS**: 10.15 or later (with cron)
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent
- **Windows**: 10 or later (with WSL for cron)

### Software Requirements
- **Node.js**: 16.0 or later
- **npm**: 7.0 or later
- **PostgreSQL**: Client tools (for compression)
- **Git**: For version control

### Hardware Requirements
- **RAM**: 512MB minimum, 1GB recommended
- **Storage**: 100MB for backups + data growth
- **Network**: Stable internet for production sync

## 📦 Installation

### 1. Verify Dependencies
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL tools (macOS with Homebrew)
brew list postgresql

# Check Git
git --version
```

### 2. Install Dependencies
```bash
# Install project dependencies
npm install

# Install PostgreSQL tools if missing (macOS)
brew install postgresql

# Install gzip if missing (Linux)
sudo apt-get install gzip
```

### 3. Verify Database Connection
```bash
# Test production database connection
node scripts/production-backup.js --dry-run
```

## ⚙️ Configuration

### Basic Configuration (`backup-config.json`)

```json
{
  "backup": {
    "enabled": true,
    "interval_minutes": 30,
    "retention_days": 7,
    "max_backups": 50,
    "compress": true,
    "backup_dir": "./backups",
    "log_dir": "./logs"
  }
}
```

### Environment Variables

Create a `.env.backup` file for sensitive configuration:

```bash
# Backup system configuration
BACKUP_ENCRYPTION_KEY=your-encryption-key-here
BACKUP_NOTIFICATION_EMAIL=admin@yourcompany.com
BACKUP_SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

### Advanced Configuration

```json
{
  "notifications": {
    "enabled": true,
    "email": {
      "enabled": true,
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "from_email": "noreply@duroodtracker.com",
      "to_email": "admin@yourcompany.com"
    }
  },
  "security": {
    "encrypt_backups": true,
    "backup_permissions": "0600"
  }
}
```

## 📖 Usage

### Automated Backups

#### Setup Cron Job
```bash
# Setup automated backups every 30 minutes
node scripts/setup-backup-cron.js

# Expected output:
# ✅ Backup cron job added successfully
# 📅 Schedule: Every 30 minutes
```

#### Remove Cron Job
```bash
# Stop automated backups
node scripts/setup-backup-cron.js --remove
```

#### List Cron Jobs
```bash
# See current cron jobs
node scripts/setup-backup-cron.js --list
```

### Manual Backups

#### Create Backup
```bash
# Standard backup with compression
node scripts/production-backup.js

# Backup without compression
node scripts/production-backup.js --no-compress

# Custom retention period
node scripts/production-backup.js --retention 14 --max-backups 100
```

#### Monitor Backup Process
```bash
# Watch backup logs in real-time
tail -f logs/backup.log

# Check backup status
ls -la backups/
```

### Data Restoration

#### Interactive Restore
```bash
# Choose backup interactively
node scripts/restore-backup.js

# Output:
# 📁 Available Backups:
# 1. production-backup-2025-09-07T10-30-00.json.gz
#    📅 Date: 9/7/2025, 10:30:00 AM
#    📏 Size: 2.5 MB (compressed)
#
# Select backup to restore (number): 1
```

#### Direct Restore
```bash
# Restore specific backup
node scripts/restore-backup.js --backup production-backup-2025-09-07T10-30-00.json.gz

# Clear existing data before restore (DANGER!)
node scripts/restore-backup.js --clear --backup production-backup-2025-09-07T10-30-00.json.gz
```

#### List Available Backups
```bash
# See all backups
node scripts/restore-backup.js --list

# Output:
# 📁 Available Backups:
# 1. production-backup-2025-09-07T10-30-00.json.gz
#    📅 Date: 9/7/2025, 10:30:00 AM
#    📏 Size: 2.5 MB (compressed)
```

## 📊 Monitoring

### Log Files
```bash
# Backup operation logs
tail -f logs/backup.log

# Cron job logs
tail -f logs/cron.log

# Restore operation logs
tail -f logs/restore.log
```

### Backup Status Check
```bash
# Check latest backup
ls -la backups/ | head -5

# Count total backups
ls backups/*.gz | wc -l

# Check backup sizes
du -sh backups/*
```

### Health Monitoring
```bash
# Test backup system
node scripts/setup-backup-cron.js --test

# Verify database connection
node scripts/production-backup.js --dry-run

# Check disk space
df -h
```

## 🔧 Troubleshooting

### Common Issues

#### Cron Job Not Running
```bash
# Check if cron service is running
sudo systemctl status cron  # Linux
sudo launchctl list | grep cron  # macOS

# Check cron logs
grep CRON /var/log/syslog  # Linux
log show --predicate 'process == "cron"' --last 1h  # macOS

# Test cron manually
node scripts/setup-backup-cron.js --test
```

#### Database Connection Failed
```bash
# Check database credentials in .env.local
cat .env.local | grep DATABASE_URL

# Test database connection manually
node -e "const {PrismaClient}=require('@prisma/client');new PrismaClient().$connect().then(()=>console.log('✅ Connected')).catch(e=>console.log('❌',e.message))"

# Check network connectivity
ping db.prisma.io
```

#### Backup Creation Failed
```bash
# Check available disk space
df -h

# Check backup directory permissions
ls -la backups/

# Check logs for specific error
tail -50 logs/backup.log

# Test backup manually
node scripts/production-backup.js --no-compress
```

#### Restore Failed
```bash
# Check backup file integrity
file backups/production-backup-*.json.gz

# Test backup file
gunzip -c backups/production-backup-*.json.gz | head -10

# Check database permissions
node -e "const {PrismaClient}=require('@prisma/client');new PrismaClient().user.count().then(c=>console.log('Users:',c))"
```

### Error Messages

#### "Cannot find module" Errors
```bash
# Reinstall dependencies
npm install

# Clear npm cache
npm cache clean --force

# Rebuild node_modules
rm -rf node_modules && npm install
```

#### "Permission denied" Errors
```bash
# Fix backup directory permissions
chmod 755 backups/
chmod 644 backups/*

# Fix log directory permissions
chmod 755 logs/
chmod 644 logs/*
```

#### "Database connection timeout"
```bash
# Increase timeout in backup-config.json
{
  "database": {
    "connection_timeout_seconds": 60,
    "query_timeout_seconds": 600
  }
}

# Check network stability
ping -c 5 db.prisma.io
```

## 🎯 Best Practices

### Backup Strategy
- ✅ **Keep multiple backups**: Never rely on single backup
- ✅ **Test restores regularly**: Verify backup integrity monthly
- ✅ **Monitor disk space**: Set up alerts for low disk space
- ✅ **Offsite backups**: Consider cloud storage for critical data
- ✅ **Encryption**: Enable backup encryption for sensitive data

### Security
- 🔐 **Secure credentials**: Use environment variables for secrets
- 🔐 **File permissions**: Set restrictive permissions on backup files
- 🔐 **Network security**: Use VPN for remote backup access
- 🔐 **Access control**: Limit who can access backup files

### Performance
- ⚡ **Schedule wisely**: Run backups during low-traffic hours
- ⚡ **Compression**: Always enable gzip compression
- ⚡ **Cleanup**: Regularly remove old backups
- ⚡ **Monitoring**: Set up alerts for backup failures

### Disaster Recovery
- 🛟 **Test restores**: Regularly test restore procedures
- 🛟 **Document procedures**: Keep recovery instructions current
- 🛟 **Multiple locations**: Store backups in multiple locations
- 🛟 **Contact lists**: Maintain emergency contact information

## 📚 API Reference

### Backup Script (`scripts/production-backup.js`)

```javascript
const { backupProductionDatabase } = require('./scripts/production-backup.js');

// Create backup
const result = await backupProductionDatabase();

// Result format
{
  success: true,
  backupPath: './backups/production-backup-2025-09-07T10-30-00.json.gz',
  recordCount: 1500
}
```

### Restore Script (`scripts/restore-backup.js`)

```javascript
const { restoreFromBackup } = require('./scripts/restore-backup.js');

// Restore from specific backup
const result = await restoreFromBackup('./backups/backup.json.gz', false);

// Result format
{
  success: true,
  restoredRecords: 1500
}
```

### Cron Setup (`scripts/setup-backup-cron.js`)

```javascript
const { setupBackupCron } = require('./scripts/setup-backup-cron.js');

// Setup cron job
const success = await setupBackupCron('setup');

// Remove cron job
const removed = await setupBackupCron('remove');
```

## 📞 Support

### Getting Help
1. **Check logs**: Review `logs/backup.log` and `logs/cron.log`
2. **Test manually**: Run `node scripts/setup-backup-cron.js --test`
3. **Verify configuration**: Check `backup-config.json` settings
4. **Check documentation**: Review this README for your specific issue

### Emergency Contacts
- **System Administrator**: [Your Name] - [Your Email]
- **Database Administrator**: [DBA Name] - [DBA Email]
- **Backup System Issues**: Create GitHub issue with logs

---

## 📄 License

This backup system is part of the Durood Tracker application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Compatibility**: Node.js 16+, PostgreSQL 12+
