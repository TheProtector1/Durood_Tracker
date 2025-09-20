import { NextResponse } from 'next/server';

// Diagnostic endpoint to check email configuration
export async function GET() {
  console.log('🔧 EMAIL CONFIGURATION DIAGNOSTIC');
  console.log('==================================');

  // Check what environment variables are available
  const emailEnvVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_SECURE',
    'FROM_EMAIL',
    'RESEND_API_KEY',
    'SENDGRID_API_KEY',
    'MAILGUN_API_KEY',
    'MAILGUN_DOMAIN',
    'NEXTAUTH_URL'
  ];

  console.log('📋 Environment Variables Check:');
  const envStatus = {};
  emailEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      if (envVar.includes('KEY') || envVar.includes('PASS') || envVar.includes('SECRET')) {
        console.log(`✅ ${envVar}: ${value.substring(0, 10)}... (masked)`);
        envStatus[envVar] = 'set (masked)';
      } else {
        console.log(`✅ ${envVar}: ${value}`);
        envStatus[envVar] = value;
      }
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
      envStatus[envVar] = null;
    }
  });

  // Determine which email service will be used
  let detectedService = 'none';
  let serviceDetails = {};

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    detectedService = 'smtp';
    serviceDetails = {
      provider: 'Gmail SMTP',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE === 'true',
      from: process.env.FROM_EMAIL
    };
    console.log('✅ DETECTED: SMTP (Gmail) configuration');
  } else if (process.env.RESEND_API_KEY) {
    detectedService = 'resend';
    serviceDetails = {
      provider: 'Resend API',
      note: 'Limited to verified emails only'
    };
    console.log('⚠️  DETECTED: Resend API (limited usage)');
  } else if (process.env.SENDGRID_API_KEY) {
    detectedService = 'sendgrid';
    serviceDetails = {
      provider: 'SendGrid API'
    };
    console.log('✅ DETECTED: SendGrid API');
  } else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    detectedService = 'mailgun';
    serviceDetails = {
      provider: 'Mailgun API'
    };
    console.log('✅ DETECTED: Mailgun API');
  } else {
    console.log('❌ NO EMAIL SERVICE CONFIGURED');
  }

  console.log('==================================');

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envStatus,
    detectedService,
    serviceDetails,
    recommendations: detectedService === 'resend'
      ? [
          'Remove RESEND_API_KEY from Vercel environment variables',
          'Set up Gmail SMTP instead (see setup-gmail-smtp.js)',
          'Required SMTP variables: SMTP_HOST, SMTP_USER, SMTP_PASS, FROM_EMAIL'
        ]
      : detectedService === 'smtp'
      ? ['Configuration looks good for Gmail SMTP!']
      : ['Set up email service (Gmail SMTP recommended)']
  });
}
