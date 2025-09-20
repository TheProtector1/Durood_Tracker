#!/usr/bin/env node

/**
 * Check Vercel Email Configuration
 * Helps diagnose email configuration issues on Vercel
 */

console.log('🔍 VERCEL EMAIL CONFIGURATION CHECK');
console.log('=====================================');
console.log('');

console.log('📋 ISSUE IDENTIFIED:');
console.log('Your Vercel logs show Resend API is still being used, but you want Gmail SMTP.');
console.log('');

console.log('🔍 POSSIBLE CAUSES:');
console.log('1. RESEND_API_KEY is still set in Vercel environment variables');
console.log('2. Gmail SMTP variables are not set in Vercel');
console.log('3. Environment variables haven\'t been redeployed');
console.log('');

console.log('🛠️  SOLUTION STEPS:');
console.log('');

console.log('STEP 1: Check your Vercel environment variables');
console.log('-----------------------------------------------');
console.log('Go to: Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('');
console.log('Current variables you SHOULD have:');
console.log('✅ SMTP_HOST=smtp.gmail.com');
console.log('✅ SMTP_PORT=587');
console.log('✅ SMTP_USER=your-gmail@gmail.com');
console.log('✅ SMTP_PASS=your-16-char-app-password');
console.log('✅ SMTP_SECURE=false');
console.log('✅ FROM_EMAIL=your-gmail@gmail.com');
console.log('✅ NEXTAUTH_URL=https://your-vercel-domain.vercel.app');
console.log('');

console.log('Variables you should REMOVE (if present):');
console.log('❌ RESEND_API_KEY (remove this!)');
console.log('');

console.log('STEP 2: Redeploy your Vercel app');
console.log('---------------------------------');
console.log('After changing environment variables:');
console.log('1. Go to Vercel Dashboard → Your Project → Deployments');
console.log('2. Click "Redeploy" on the latest deployment');
console.log('3. Wait for deployment to complete');
console.log('');

console.log('STEP 3: Test email verification');
console.log('--------------------------------');
console.log('1. Create a new user account on your Vercel app');
console.log('2. Check if verification email is received');
console.log('3. Check Vercel function logs for any errors');
console.log('');

console.log('🔧 QUICK FIX SCRIPT:');
console.log('===================');
console.log('If you want to keep both services but prioritize Gmail, run this locally:');
console.log('');
console.log('node -e "');
console.log('const config = require(\'./src/lib/email.ts\');');
console.log('console.log(\'Current config:\', config.emailConfig);');
console.log('console.log(\'If SMTP is detected first, Gmail will be used over Resend\');');
console.log('"');
console.log('');

console.log('📞 NEED HELP?');
console.log('============');
console.log('If issues persist:');
console.log('1. Check Vercel function logs for detailed error messages');
console.log('2. Run: node test-email-config.js (locally)');
console.log('3. Verify your Gmail app password is correct');
console.log('4. Try alternative Gmail settings (port 465 with SMTP_SECURE=true)');
console.log('');

console.log('✅ EXPECTED RESULT:');
console.log('After fixing, you should see Gmail SMTP errors instead of Resend errors in logs.');
console.log('Gmail SMTP will show connection/authentication errors if misconfigured.');
console.log('');
