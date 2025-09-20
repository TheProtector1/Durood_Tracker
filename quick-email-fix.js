#!/usr/bin/env node

/**
 * Quick Email Delivery Fix
 * Most common solutions for Gmail SMTP delivery issues
 */

console.log('🚀 QUICK EMAIL DELIVERY FIX');
console.log('===========================');

console.log('\n🎯 MOST LIKELY SOLUTION: Check Spam/Junk Folder');
console.log('Gmail automatically sends automated emails to spam.');
console.log('Check your spam folder FIRST!');

console.log('\n📋 CHECKLIST:');

console.log('\n✅ STEP 1: Verify App Password');
console.log('1. Go to: https://myaccount.google.com/security');
console.log('2. Enable 2-Factor Authentication');
console.log('3. Go to "App passwords"');
console.log('4. Create "Durood Tracker" app password');
console.log('5. Use 16-character password in SMTP_PASS');

console.log('\n✅ STEP 2: Set Vercel Environment Variables');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=your-gmail@gmail.com');
console.log('SMTP_PASS=your-16-char-app-password');
console.log('SMTP_SECURE=false');
console.log('FROM_EMAIL=your-gmail@gmail.com');
console.log('NEXTAUTH_URL=https://your-domain.vercel.app');

console.log('\n✅ STEP 3: Test Locally First');
console.log('SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_USER=your@gmail.com SMTP_PASS=your-password SMTP_SECURE=false FROM_EMAIL=your@gmail.com node test-gmail-smtp.js');

console.log('\n✅ STEP 4: Deploy to Vercel');
console.log('1. Set environment variables on Vercel');
console.log('2. Redeploy application');
console.log('3. Test user registration');

console.log('\n🔍 IF STILL NOT WORKING:');
console.log('• Check Vercel function logs for SMTP errors');
console.log('• Visit: https://your-domain.vercel.app/api/email-config');
console.log('• Try SendGrid or Mailgun instead');

console.log('\n📧 ALTERNATIVE: Switch to SendGrid');
console.log('1. Sign up at sendgrid.com');
console.log('2. Get API key');
console.log('3. Set: SENDGRID_API_KEY=your-api-key');
console.log('4. Remove all SMTP_* variables');

console.log('\n===========================');
console.log('💡 99% of delivery issues are solved by checking spam folder!');
console.log('🔧 Run: node fix-gmail-delivery.js');
console.log('For comprehensive troubleshooting.');
