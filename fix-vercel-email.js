#!/usr/bin/env node

/**
 * Fix Vercel Email Configuration
 * Helps resolve Resend API conflicts with Gmail SMTP
 */

console.log('🔧 FIX VERCEL EMAIL CONFIGURATION');
console.log('===================================');
console.log('');

console.log('❌ PROBLEM IDENTIFIED:');
console.log('Your Vercel app is still using Resend API instead of Gmail SMTP.');
console.log('The error shows: "You can only send testing emails to your own email address"');
console.log('');

console.log('🔍 ROOT CAUSE:');
console.log('RESEND_API_KEY is still set in your Vercel environment variables.');
console.log('Even with SMTP configured, Resend takes priority.');
console.log('');

console.log('🛠️  SOLUTION:');
console.log('Remove RESEND_API_KEY from Vercel environment variables.');
console.log('');

console.log('📋 STEPS TO FIX:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Find and DELETE the "RESEND_API_KEY" variable');
console.log('3. Ensure these Gmail SMTP variables are set:');
console.log('   - SMTP_HOST=smtp.gmail.com');
console.log('   - SMTP_PORT=587');
console.log('   - SMTP_USER=your-gmail@gmail.com');
console.log('   - SMTP_PASS=your-16-char-app-password');
console.log('   - SMTP_SECURE=false');
console.log('   - FROM_EMAIL=your-gmail@gmail.com');
console.log('   - NEXTAUTH_URL=https://your-domain.vercel.app');
console.log('4. Redeploy your Vercel app');
console.log('');

console.log('🧪 TESTING:');
console.log('After redeploying, visit: https://your-domain.vercel.app/api/email-config');
console.log('Check Vercel function logs to see "Using SMTP configuration"');
console.log('');

console.log('📧 ALTERNATIVE (if you want to keep Resend):');
console.log('1. Keep RESEND_API_KEY');
console.log('2. Remove all SMTP_* variables from Vercel');
console.log('3. Verify a domain at resend.com/domains');
console.log('4. Update FROM_EMAIL to use your verified domain');
console.log('');

console.log('⚡ QUICK CHECK:');
console.log('Visit this URL to see your current email configuration:');
console.log('https://your-domain.vercel.app/api/email-config');
console.log('');
console.log('This will show you exactly what email service is being detected.');
console.log('');

console.log('✅ EXPECTED RESULT:');
console.log('After fixing, you should see: "Using SMTP configuration for email sending"');
console.log('And email verification should work for all users.');
console.log('');

console.log('❓ NEED HELP?');
console.log('Run: node setup-gmail-smtp.js');
console.log('For complete Gmail SMTP setup instructions.');
