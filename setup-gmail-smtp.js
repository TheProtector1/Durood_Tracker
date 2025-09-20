#!/usr/bin/env node

/**
 * Gmail SMTP Setup Guide for Vercel
 * Helps configure Gmail SMTP for email verification on Vercel
 */

console.log('📧 GMAIL SMTP SETUP GUIDE FOR VERCEL');
console.log('=====================================');
console.log('');

console.log('🔐 STEP 1: CREATE GMAIL APP PASSWORD');
console.log('-------------------------------------');
console.log('1. Go to https://myaccount.google.com/security');
console.log('2. Enable 2-Factor Authentication (2FA) if not already enabled');
console.log('3. Go to "App passwords" section');
console.log('4. Generate a new app password for "Durood Tracker"');
console.log('5. Copy the 16-character password (ignore spaces)');
console.log('');

console.log('⚙️  STEP 2: VERCEL ENVIRONMENT VARIABLES');
console.log('----------------------------------------');
console.log('Add these environment variables in your Vercel project settings:');
console.log('');

const envVars = {
  'SMTP_HOST': 'smtp.gmail.com',
  'SMTP_PORT': '587',
  'SMTP_USER': 'your-gmail-address@gmail.com',
  'SMTP_PASS': 'your-16-character-app-password',
  'SMTP_SECURE': 'false',
  'FROM_EMAIL': 'your-gmail-address@gmail.com',
  'NEXTAUTH_URL': 'https://your-vercel-domain.vercel.app'
};

console.log('Environment Variables to set in Vercel:');
console.log('========================================');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});
console.log('');

console.log('📝 STEP 3: REPLACE PLACEHOLDER VALUES');
console.log('-------------------------------------');
console.log('1. Replace "your-gmail-address@gmail.com" with your actual Gmail address');
console.log('2. Replace "your-16-character-app-password" with the app password from Step 1');
console.log('3. Replace "https://your-vercel-domain.vercel.app" with your actual Vercel domain');
console.log('');

console.log('🧪 STEP 4: TEST THE CONFIGURATION');
console.log('----------------------------------');
console.log('After setting the environment variables, redeploy your Vercel app.');
console.log('Then test by creating a new user account - you should receive a verification email.');
console.log('');

console.log('🔍 TROUBLESHOOTING');
console.log('------------------');
console.log('If emails are not being sent:');
console.log('1. Check Vercel function logs for SMTP errors');
console.log('2. Verify your Gmail app password is correct');
console.log('3. Ensure 2FA is enabled on your Google account');
console.log('4. Try using port 465 with SMTP_SECURE=true instead of port 587');
console.log('');

console.log('📧 ALTERNATIVE GMAIL SETTINGS');
console.log('------------------------------');
console.log('If port 587 doesn\'t work, try these settings:');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=465');
console.log('SMTP_SECURE=true');
console.log('(Keep SMTP_USER, SMTP_PASS, FROM_EMAIL, and NEXTAUTH_URL the same)');
console.log('');

console.log('✅ SETUP COMPLETE!');
console.log('==================');
console.log('Once configured, your email verification should work on Vercel production.');

console.log('');
console.log('Need help? Check the Vercel documentation for environment variables:');
console.log('https://vercel.com/docs/concepts/projects/environment-variables');
