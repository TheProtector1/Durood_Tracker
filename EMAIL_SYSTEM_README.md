# 📧 Custom Email System for Durood Tracker

Complete email service implementation using Nodemailer with beautiful Islamic/Durood themed templates. Features email activation, password reset, and daily recitation reminders.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Email Templates](#email-templates)
- [Setup & Configuration](#setup--configuration)
- [Usage](#usage)
- [Daily Reminders](#daily-reminders)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

## 🎯 Overview

The Durood Tracker email system provides a complete, custom email solution that eliminates dependency on third-party email services. It features:

- **Email Activation**: Beautiful welcome emails for new users
- **Password Reset**: Secure password recovery system
- **Daily Reminders**: Automated Islamic-themed recitation reminders
- **Beautiful Templates**: Custom HTML templates with Islamic/Durood content
- **Comprehensive Logging**: Full audit trail of email activities
- **Cron Automation**: Automated daily reminder scheduling

## ✨ Features

### Core Features
- ✅ **Custom Nodemailer Integration**: No third-party dependencies
- ✅ **Beautiful Islamic Templates**: Durood-rich, RTL-supporting designs
- ✅ **Email Activation System**: Secure user verification
- ✅ **Password Reset**: One-click secure recovery
- ✅ **Daily Reminders**: Automated 8 PM recitation reminders
- ✅ **Responsive Design**: Mobile-friendly email templates

### Advanced Features
- 🔄 **Automated Scheduling**: Cron-based daily reminders
- 📊 **Delivery Tracking**: Success/failure monitoring
- 🛡️ **Security**: Token-based verification and encryption
- 🌐 **RTL Support**: Full Arabic/Islamic content support
- 📱 **Mobile Optimized**: Responsive email templates
- 📈 **Statistics**: User recitation progress tracking

## 📧 Email Templates

### 1. Email Verification Template
**File**: `src/lib/email-templates/email-verification.html`

Features:
- Islamic geometric patterns
- Beautiful Arabic typography
- Clear call-to-action buttons
- Security information
- Responsive design

**Content Includes:**
- Welcome message in Arabic
- Verification instructions
- Security tips
- Islamic quotes
- Footer with branding

### 2. Password Reset Template
**File**: `src/lib/email-templates/password-reset.html`

Features:
- Security-focused design
- Clear reset instructions
- Time-limited tokens
- Trust indicators
- Islamic motivational quotes

**Content Includes:**
- Secure reset instructions
- Token validity information
- Security best practices
- Islamic encouragement
- Professional branding

### 3. Daily Reminder Template
**File**: `src/lib/email-templates/daily-reminder.html`

Features:
- Daily Durood recitation
- Personal statistics
- Prayer times integration
- Islamic calligraphy
- Progress visualization

**Content Includes:**
- Daily Durood of the day
- Personal recitation stats
- Prayer times for the day
- Islamic motivational content
- Direct app links

## ⚙️ Setup & Configuration

### 1. Environment Variables

Add to your `.env.local` file:

```bash
# SMTP Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
FROM_EMAIL=your-email@gmail.com

# Application URLs (Required)
NEXTAUTH_URL=http://localhost:3000

# Optional: Test Email
TEST_EMAIL=test@example.com
```

### 2. Gmail SMTP Setup

For Gmail, you need to:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### 3. Alternative SMTP Providers

#### Outlook/Hotmail:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo:
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP:
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## 📖 Usage

### Manual Email Testing

#### Test Email Verification:
```bash
# Send test verification email
node scripts/test-email-system.js --no-send
```

#### Test Password Reset:
```bash
# Send test password reset email
node scripts/test-email-system.js --no-send
```

#### Test Daily Reminder:
```bash
# Send test daily reminder email
node scripts/test-email-system.js --no-send
```

#### Full System Test:
```bash
# Test everything without sending emails
node scripts/test-email-system.js --no-send
```

### Daily Reminder System

#### Setup Automated Reminders:
```bash
# Setup cron job for daily reminders
node scripts/setup-daily-reminders.js
```

#### Test Reminder System:
```bash
# Test without sending emails
node scripts/setup-daily-reminders.js --test
```

#### Manual Reminder Run:
```bash
# Send reminders immediately (force)
node scripts/daily-reminders.js --force

# Test mode (simulation)
node scripts/daily-reminders.js --test
```

#### Manage Cron Jobs:
```bash
# List current cron jobs
node scripts/setup-daily-reminders.js --list

# Remove automated reminders
node scripts/setup-daily-reminders.js --remove
```

## 🔔 Daily Reminders

### How It Works

1. **Scheduling**: Runs every day at 8:00 PM (20:00)
2. **Timing**: 4 hours before end of day (perfect reminder timing)
3. **Target**: All verified users with email addresses
4. **Content**: Personalized with user's recitation statistics

### Reminder Content

Each reminder includes:
- **Daily Durood**: Featured Durood recitation
- **Personal Stats**: Today's, week's, month's recitation counts
- **Prayer Times**: Current day's prayer schedule
- **Islamic Quotes**: Motivational Islamic content
- **App Links**: Direct links to app and statistics

### Automation Flow

```
8:00 PM Daily → Cron Job Triggers → Fetch User Data → Generate Personal Content → Send Emails → Log Results
```

### Manual Override

```bash
# Send reminders right now (bypass timing)
node scripts/daily-reminders.js --force

# Test reminder generation (no emails sent)
node scripts/daily-reminders.js --test
```

## 🧪 Testing

### Quick Test (No Emails)
```bash
node scripts/test-email-system.js --no-send
```

### Full System Test
```bash
# ⚠️ WARNING: This sends real emails
node scripts/test-email-system.js --yes
```

### Individual Component Tests

#### Email Templates:
```bash
# Check if templates exist and are readable
ls -la src/lib/email-templates/
```

#### SMTP Connection:
```bash
# Test SMTP connection manually
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.verify((error, success) => {
  if (error) console.log('❌ SMTP Error:', error);
  else console.log('✅ SMTP Connected');
});
"
```

#### Cron System:
```bash
# Test cron job setup
node scripts/setup-daily-reminders.js --test

# Check cron logs
tail -f logs/daily-reminders.log
```

## 🔧 Troubleshooting

### Common Issues

#### SMTP Connection Failed
```bash
# Check SMTP settings
cat .env.local | grep SMTP

# Test SMTP connection
node scripts/test-email-system.js --no-send
```

**Solutions:**
- Verify SMTP credentials
- Check firewall settings
- Try different SMTP port (587 vs 465)
- Enable less secure app access (Gmail)

#### Emails Not Sending
```bash
# Check email logs
tail -f logs/email-test.log

# Test with simple email
node -e "
const { sendEmail } = require('./src/lib/email');
sendEmail('test@example.com', 'Test', '<h1>Test Email</h1>')
  .then(() => console.log('✅ Email sent'))
  .catch(e => console.log('❌ Error:', e.message));
"
```

#### Cron Job Not Running
```bash
# Check if cron is running
sudo systemctl status cron  # Linux
sudo launchctl list | grep cron  # macOS

# List cron jobs
crontab -l

# Check cron logs
grep CRON /var/log/syslog  # Linux
log show --predicate 'process == \"cron\"' --last 1h  # macOS
```

#### Template Not Loading
```bash
# Check template files
ls -la src/lib/email-templates/

# Verify template content
head -20 src/lib/email-templates/email-verification.html
```

### Error Messages

#### "Invalid login: Username and Password not accepted"
- **Cause**: Incorrect SMTP credentials
- **Solution**: Use Gmail App Password instead of regular password

#### "Couldn't connect to host"
- **Cause**: Network or firewall issues
- **Solution**: Check internet connection and firewall settings

#### "Template not found"
- **Cause**: Missing template files
- **Solution**: Ensure all template files exist in `src/lib/email-templates/`

#### "Cron job not running"
- **Cause**: Cron service not active
- **Solution**: Start cron service or use alternative scheduling

## 🛡️ Security

### Email Security Features

#### Token Security:
- **Expiration**: Verification tokens expire in 24 hours
- **One-time Use**: Tokens can only be used once
- **Secure Generation**: Cryptographically secure token generation

#### Content Security:
- **No Sensitive Data**: Emails never contain passwords
- **Secure Links**: All links use HTTPS
- **Input Validation**: All user inputs validated

#### Delivery Security:
- **SMTP Encryption**: TLS/SSL encryption for email transmission
- **Authentication**: Secure SMTP authentication
- **Logging**: All email activities logged (no sensitive data)

### Best Practices

#### Password Security:
- Never send passwords in emails
- Use secure token-based reset system
- Implement rate limiting for reset requests

#### User Privacy:
- Only verified users receive emails
- Users can opt-out of reminders
- No email sharing with third parties

#### System Security:
- Secure credential storage
- Regular security updates
- Access control for email system

## 📊 Monitoring & Logs

### Log Files

#### Email Logs:
```
logs/email-test.log          # Email system test logs
logs/daily-reminders.log     # Daily reminder execution logs
```

#### Cron Logs:
```
logs/cron.log               # Cron job execution logs
```

### Monitoring Commands

#### Check Email Status:
```bash
# View recent email activity
tail -20 logs/email-test.log

# Check daily reminder status
tail -20 logs/daily-reminders.log
```

#### System Health:
```bash
# Test email system health
node scripts/test-email-system.js --no-send

# Check cron job status
node scripts/setup-daily-reminders.js --list
```

#### Performance Monitoring:
```bash
# Monitor log file sizes
du -sh logs/*.log

# Check for errors in logs
grep -i error logs/*.log | tail -10
```

## 🚀 Advanced Configuration

### Custom Templates

To modify email templates:

1. Edit HTML files in `src/lib/email-templates/`
2. Use `{{VARIABLE_NAME}}` for dynamic content
3. Test changes with `--no-send` flag
4. Ensure mobile responsiveness

### Custom SMTP Settings

For advanced SMTP configuration:

```javascript
// In src/lib/email.ts
const customTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Additional options
  tls: {
    rejectUnauthorized: false
  }
});
```

### Batch Email Processing

For large user bases:

```javascript
// Process emails in batches to avoid rate limits
const BATCH_SIZE = 50;
const users = await getUsersForReminders();

for (let i = 0; i < users.length; i += BATCH_SIZE) {
  const batch = users.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(sendUserReminder));

  // Rate limiting delay
  if (i + BATCH_SIZE < users.length) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

## 📞 Support

### Getting Help

1. **Check Documentation**: Review this README
2. **Run Tests**: Use `node scripts/test-email-system.js --no-send`
3. **Check Logs**: Review log files in `logs/` directory
4. **Verify Configuration**: Ensure `.env.local` is correct

### Emergency Contacts
- **System Administrator**: Configure in your team documentation
- **Email Issues**: Check SMTP provider documentation
- **Template Issues**: Verify HTML template syntax

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Compatibility**: Node.js 16+, All SMTP providers
