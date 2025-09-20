#!/usr/bin/env node

/**
 * Debug Email Verification Issues
 * Comprehensive diagnostic for email verification problems
 */

console.log('🔧 EMAIL VERIFICATION DEBUG');
console.log('============================');

console.log('\n1️⃣ CHECKING ENVIRONMENT VARIABLES:');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✅ SET' : '❌ NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ SET' : '❌ NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET (masked)' : '❌ NOT SET');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'false (default)');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL ? '✅ SET' : '❌ NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ SET' : '❌ NOT SET');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '⚠️ STILL SET' : '✅ REMOVED');

console.log('\n2️⃣ EMAIL VERIFICATION LOGIC CHECK:');
// Simulate the NextAuth authorize function logic
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const resendConfigured = !!process.env.RESEND_API_KEY;
const emailServiceConfigured = smtpConfigured || resendConfigured;

console.log('SMTP configured:', smtpConfigured);
console.log('Resend configured:', resendConfigured);
console.log('Any email service configured:', emailServiceConfigured);

console.log('\n3️⃣ SIMULATING LOGIN SCENARIO:');
// Simulate what happens when an unverified user tries to login
const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  username: 'testuser',
  emailVerified: false, // This user is NOT verified
  password: 'hashedpassword'
};

console.log('Mock user:', mockUser.email);
console.log('Email verified:', mockUser.emailVerified);

if (!mockUser.emailVerified && emailServiceConfigured) {
  console.log('❌ RESULT: User would be BLOCKED from signing in');
  console.log('   Error message: "Please verify your email before signing in. Check your email for the verification link."');
} else if (!mockUser.emailVerified && !emailServiceConfigured) {
  console.log('⚠️  RESULT: User would be ALLOWED to sign in (no email service configured)');
  console.log('   This is the PROBLEM - email verification is disabled!');
} else {
  console.log('✅ RESULT: User would be allowed to sign in (email verified)');
}

console.log('\n4️⃣ DIAGNOSIS:');
if (!emailServiceConfigured) {
  console.log('🚨 ROOT CAUSE: No email service is configured on this system!');
  console.log('   This means email verification is completely disabled.');
  console.log('   Users can sign in without verifying their email.');
} else if (resendConfigured) {
  console.log('🚨 ROOT CAUSE: RESEND_API_KEY is still set!');
  console.log('   This might be causing conflicts or limitations.');
} else {
  console.log('✅ Email service is properly configured.');
  console.log('   Email verification should be working.');
}

console.log('\n5️⃣ RECOMMENDED FIXES:');
if (!emailServiceConfigured) {
  console.log('📧 Set up Gmail SMTP on Vercel:');
  console.log('   SMTP_HOST=smtp.gmail.com');
  console.log('   SMTP_PORT=587');
  console.log('   SMTP_USER=your-gmail@gmail.com');
  console.log('   SMTP_PASS=your-16-char-app-password');
  console.log('   SMTP_SECURE=false');
  console.log('   FROM_EMAIL=your-gmail@gmail.com');
  console.log('   NEXTAUTH_URL=https://your-domain.vercel.app');
} else if (resendConfigured) {
  console.log('🗑️  Remove RESEND_API_KEY from Vercel environment variables');
  console.log('📧 Ensure Gmail SMTP variables are set (see above)');
} else {
  console.log('✅ Configuration looks correct.');
  console.log('🔍 Check Vercel function logs for detailed errors.');
}

console.log('\n6️⃣ TESTING ON VERCEL:');
console.log('Visit: https://your-domain.vercel.app/api/email-config');
console.log('This will show you the exact configuration on Vercel.');

console.log('\n7️⃣ MANUAL TEST:');
console.log('Try signing in with an unverified account:');
console.log('- Go to signin page');
console.log('- Enter credentials for unverified user');
console.log('- Should show: "Please verify your email before signing in"');
console.log('- If it allows login, email verification is disabled');

console.log('\n============================');
console.log('Run: node setup-gmail-smtp.js');
console.log('For complete setup instructions.');
