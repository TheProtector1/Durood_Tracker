#!/usr/bin/env node

/**
 * Vercel Environment Variable Checker
 * Helps verify that email configuration is set up correctly for production
 */

console.log('🔍 VERCEL ENVIRONMENT VARIABLE CHECKER');
console.log('======================================');
console.log('');

console.log('📋 REQUIRED ENVIRONMENT VARIABLES FOR GMAIL SMTP:');
console.log('=================================================');

const requiredVars = [
  { name: 'SMTP_HOST', value: 'smtp.gmail.com', description: 'Gmail SMTP server' },
  { name: 'SMTP_PORT', value: '587', description: 'SMTP port (587 for TLS, 465 for SSL)' },
  { name: 'SMTP_USER', value: 'your-gmail@gmail.com', description: 'Your Gmail address' },
  { name: 'SMTP_PASS', value: 'your-16-char-app-password', description: 'Gmail app password (not regular password)' },
  { name: 'SMTP_SECURE', value: 'false', description: 'Use TLS (false for port 587, true for port 465)' },
  { name: 'FROM_EMAIL', value: 'your-gmail@gmail.com', description: 'Email address for sending emails' },
  { name: 'NEXTAUTH_URL', value: 'https://your-vercel-domain.vercel.app', description: 'Your production Vercel URL' }
];

console.log('In Vercel Dashboard > Project Settings > Environment Variables:');
console.log('');
requiredVars.forEach((variable, index) => {
  console.log(`${index + 1}. ${variable.name}=${variable.value}`);
  console.log(`   📝 ${variable.description}`);
  console.log('');
});

console.log('🚨 CRITICAL: REMOVE THESE IF PRESENT:');
console.log('=====================================');
console.log('❌ RESEND_API_KEY - Remove this if you want to use Gmail SMTP');
console.log('❌ SENDGRID_API_KEY - Remove if not using SendGrid');
console.log('❌ MAILGUN_API_KEY - Remove if not using Mailgun');
console.log('');

console.log('🔍 TROUBLESHOOTING STEPS:');
console.log('=========================');
console.log('1. Go to Vercel Dashboard');
console.log('2. Select your Durood Tracker project');
console.log('3. Go to Settings > Environment Variables');
console.log('4. Remove any RESEND_API_KEY, SENDGRID_API_KEY, or MAILGUN_API_KEY');
console.log('5. Ensure all SMTP_* variables are set correctly');
console.log('6. Redeploy your application');
console.log('7. Test by creating a new user account');
console.log('');

console.log('✅ VERIFICATION:');
console.log('================');
console.log('After redeployment, check Vercel function logs when a new user signs up.');
console.log('You should see: "✅ SMTP (Gmail) configuration detected"');
console.log('Instead of any Resend API errors.');
console.log('');

console.log('💡 IF STILL GETTING RESEND ERRORS:');
console.log('===================================');
console.log('1. Check if you have multiple deployments');
console.log('2. Ensure the new code is deployed (check deployment status)');
console.log('3. Clear Vercel cache if needed');
console.log('4. Check if environment variables are set for the correct environment (Production/Preview)');
console.log('');

console.log('📞 NEED HELP?');
console.log('=============');
console.log('Run: node setup-gmail-smtp.js');
console.log('This will show you the complete Gmail SMTP setup guide.');
console.log('');

console.log('🎯 SUMMARY:');
console.log('===========');
console.log('✅ Set SMTP_* environment variables for Gmail');
console.log('❌ Remove RESEND_API_KEY from Vercel');
console.log('🔄 Redeploy your Vercel application');
console.log('🧪 Test email verification with a new user signup');
