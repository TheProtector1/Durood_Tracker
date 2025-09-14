require('dotenv').config({ path: '.env.local' });

function getEmailConfig() {
  // Option 1: SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY
    };
  }

  // Option 2: Mailgun
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return {
      provider: 'mailgun',
      apiKey: process.env.MAILGUN_API_KEY
    };
  }

  // Option 3: AWS SES
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
    return {
      provider: 'aws-ses'
    };
  }

  // Option 4: SMTP (Gmail, Outlook, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      provider: 'nodemailer',
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    };
  }

  return null;
}

console.log('🔧 Email Configuration Check:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

const config = getEmailConfig();
console.log('\n📧 Email Config Result:', config ? config.provider : '❌ No email service configured');
