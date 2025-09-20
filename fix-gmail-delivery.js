#!/usr/bin/env node

/**
 * Gmail SMTP Delivery Fix Guide
 * Comprehensive troubleshooting for email delivery issues
 */

console.log('📧 GMAIL SMTP DELIVERY TROUBLESHOOTING');
console.log('======================================');

console.log('\n🚨 COMMON ISSUE: "Emails sent but not received"');
console.log('This is usually due to Gmail\'s security features.');

console.log('\n🔍 MOST COMMON CAUSES & SOLUTIONS:');

console.log('\n1️⃣ 📁 CHECK SPAM/JUNK FOLDER FIRST');
console.log('   • Gmail automatically sends automated emails to spam');
console.log('   • Check your spam/junk folder immediately after sending');
console.log('   • Mark emails as "Not spam" to improve future delivery');

console.log('\n2️⃣ 🔒 GMAIL SECURITY BLOCKS');
console.log('   • Gmail may block "suspicious" login attempts');
console.log('   • Check: https://myaccount.google.com/security');
console.log('   • Look for "Recent security activity"');
console.log('   • You may need to allow the sign-in');

console.log('\n3️⃣ 🔑 APP PASSWORD ISSUES');
console.log('   • Make sure you\'re using an App Password, NOT your regular password');
console.log('   • App passwords are 16 characters long');
console.log('   • Regenerate if the current one isn\'t working');
console.log('   • Create a new app password specifically for "Durood Tracker"');

console.log('\n4️⃣ 📊 GMAIL SENDING LIMITS');
console.log('   • Free Gmail: 500 emails per day');
console.log('   • Google Workspace: Higher limits (up to 10,000/day)');
console.log('   • Check limits: https://support.google.com/mail/answer/22839');
console.log('   • If exceeded, wait 24 hours or upgrade account');

console.log('\n5️⃣ 🏷️ EMAIL REPUTATION');
console.log('   • First emails from new senders go to spam');
console.log('   • Send test emails to build sender reputation');
console.log('   • Avoid sending to invalid/non-existent addresses');
console.log('   • Use consistent FROM_EMAIL address');

console.log('\n🛠️ STEP-BY-STEP FIX PROCESS:');

console.log('\nSTEP 1: VERIFY GMAIL APP PASSWORD');
console.log('1. Go to https://myaccount.google.com/security');
console.log('2. Ensure 2-Factor Authentication is ENABLED');
console.log('3. Go to "App passwords"');
console.log('4. Delete any existing "Durood Tracker" app password');
console.log('5. Create new app password for "Durood Tracker"');
console.log('6. Use the 16-character password (no spaces)');

console.log('\nSTEP 2: TEST WITH MINIMAL SETUP');
console.log('Set environment variables and test:');
console.log('SMTP_HOST=smtp.gmail.com \\');
console.log('SMTP_PORT=587 \\');
console.log('SMTP_USER=your-gmail@gmail.com \\');
console.log('SMTP_PASS=your-16-char-app-password \\');
console.log('SMTP_SECURE=false \\');
console.log('FROM_EMAIL=your-gmail@gmail.com \\');
console.log('node test-gmail-smtp.js');

console.log('\nSTEP 3: CHECK GMAIL ACCOUNT STATUS');
console.log('1. Sign into Gmail web interface');
console.log('2. Check "Recent security activity"');
console.log('3. Ensure no security alerts are blocking SMTP');
console.log('4. Check "Account storage" isn\'t full');

console.log('\nSTEP 4: TEST EMAIL FLOW');
console.log('1. Send test email to your own Gmail address');
console.log('2. Check inbox and spam folder');
console.log('3. If received, test with other email addresses');
console.log('4. If not received, check Gmail security settings');

console.log('\n🔄 ALTERNATIVE GMAIL SETTINGS (if port 587 fails):');
console.log('SMTP_PORT=465');
console.log('SMTP_SECURE=true');
console.log('(Keep all other settings the same)');

console.log('\n🌐 IF GMAIL SMTP CONTINUES FAILING:');
console.log('Consider switching to professional email services:');

console.log('\n📧 RECOMMENDED ALTERNATIVES:');
console.log('1. SendGrid - Excellent for bulk emails');
console.log('   • Set SENDGRID_API_KEY=your-api-key');
console.log('   • Remove all SMTP_* variables');

console.log('\n2. Mailgun - Great for transactional emails');
console.log('   • Set MAILGUN_API_KEY=your-api-key');
console.log('   • Set MAILGUN_DOMAIN=your-verified-domain');

console.log('\n3. AWS SES - Highly reliable, pay-per-use');
console.log('   • Set AWS_ACCESS_KEY_ID=your-key');
console.log('   • Set AWS_SECRET_ACCESS_KEY=your-secret');
console.log('   • Set AWS_REGION=us-east-1');

console.log('\n🧪 TESTING ON VERCEL:');
console.log('After fixing locally:');
console.log('1. Set environment variables on Vercel');
console.log('2. Redeploy your application');
console.log('3. Test user registration (should send verification email)');
console.log('4. Check Vercel function logs for SMTP errors');
console.log('5. Visit: https://your-domain.vercel.app/api/email-config');

console.log('\n📞 STILL HAVING ISSUES?');
console.log('1. Check Vercel function logs for detailed SMTP errors');
console.log('2. Test with different email providers (Outlook, Yahoo)');
console.log('3. Verify FROM_EMAIL matches SMTP_USER');
console.log('4. Check if your Gmail account has business restrictions');

console.log('\n✅ SUCCESS INDICATORS:');
console.log('• Test email arrives in inbox (not spam)');
console.log('• User registration sends verification email');
console.log('• Password reset emails are delivered');
console.log('• No SMTP errors in Vercel function logs');

console.log('\n======================================');
console.log('📧 Run: node test-gmail-smtp.js');
console.log('To test your Gmail SMTP configuration locally.');

console.log('\n💡 REMEMBER: Gmail SMTP works reliably, but has strict security.');
console.log('Professional email services (SendGrid, Mailgun) are more reliable for production apps.');
