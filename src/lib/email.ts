import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Email service configuration
interface EmailConfig {
  provider: 'nodemailer' | 'sendgrid' | 'mailgun' | 'aws-ses';
  apiKey?: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

// Template data interfaces
interface VerificationEmailData {
  verificationCode: string;
  verificationLink: string;
  verificationUrl: string;
  resendLink: string;
}

interface PasswordResetEmailData {
  resetCode: string;
  resetLink: string;
  resetUrl: string;
  loginLink: string;
}

interface DailyReminderEmailData {
  userName: string;
  currentDate: string;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  appLink: string;
  statsLink: string;
  fajrTime: string;
  dhuhrTime: string;
  asrTime: string;
  maghribTime: string;
  ishaTime: string;
  jummahTime: string;
}

// Load email template
function loadEmailTemplate(templateName: string): string {
  // Try multiple path resolutions for Next.js compatibility
  const possiblePaths = [
    path.join(__dirname, 'email-templates', `${templateName}.html`),
    path.join(__dirname, '../email-templates', `${templateName}.html`),
    path.join(process.cwd(), 'src/lib/email-templates', `${templateName}.html`),
    path.join(process.cwd(), 'email-templates', `${templateName}.html`)
  ];

  for (const templatePath of possiblePaths) {
    try {
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf8');
      }
    } catch (error) {
      // Continue to next path
      continue;
    }
  }

  // If none of the paths work, throw error with debug info
  const debugInfo = possiblePaths.map(p => `${p} (${fs.existsSync(p) ? 'exists' : 'not found'})`).join(', ');
  throw new Error(`Failed to load email template: ${templateName}. Tried paths: ${debugInfo}`);
}

// Replace template variables
function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key.toUpperCase()}}}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

// Get current year for templates
function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig | null => {
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
};

const emailConfig = getEmailConfig();

// Generic email sending function
async function sendEmail(to: string, subject: string, html: string) {
  if (!emailConfig) {
    throw new Error('No email service configured');
  }

  try {
    switch (emailConfig.provider) {
      case 'sendgrid':
        const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: to }]
            }],
            from: { email: process.env.FROM_EMAIL || 'noreply@duroodtracker.com' },
            subject,
            content: [{ type: 'text/html', value: html }]
          })
        });

        if (!sgResponse.ok) {
          throw new Error(`SendGrid API error: ${sgResponse.status}`);
        }
        break;

      case 'mailgun':
        const mgResponse = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`api:${emailConfig.apiKey}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            from: process.env.FROM_EMAIL || 'noreply@duroodtracker.com',
            to,
            subject,
            html
          })
        });

        if (!mgResponse.ok) {
          throw new Error(`Mailgun API error: ${mgResponse.status}`);
        }
        break;

      case 'aws-ses':
        // For AWS SES, you'd typically use the AWS SDK
        // This is a simplified implementation
        throw new Error('AWS SES implementation requires AWS SDK');

      case 'nodemailer':
        if (!emailConfig.smtp) {
          throw new Error('SMTP configuration missing');
        }

        const transporter = nodemailer.createTransport(emailConfig.smtp);
        await transporter.sendMail({
          from: process.env.FROM_EMAIL || 'noreply@duroodtracker.com',
          to,
          subject,
          html
        });
        break;

      default:
        throw new Error('Unsupported email provider');
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, resetCode?: string) {
  if (!emailConfig) {
    throw new Error('Email service not configured');
  }

  // Load the password reset template
  const template = loadEmailTemplate('password-reset');

  // Prepare template data
  const templateData: PasswordResetEmailData = {
    resetCode: resetCode || 'N/A',
    resetLink: resetUrl,
    resetUrl: resetUrl,
    loginLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin`
  };

  // Add current year to template data
  templateData.currentYear = getCurrentYear();

  // Replace template variables
  const html = replaceTemplateVariables(template, templateData);

  return await sendEmail(email, '🔐 إعادة تعيين كلمة المرور - Durood Tracker', html);
}

export async function sendEmailVerificationEmail(email: string, verificationUrl: string, verificationCode?: string) {
  if (!emailConfig) {
    throw new Error('Email service not configured');
  }

  // Load the email verification template
  const template = loadEmailTemplate('email-verification');

  // Prepare template data
  const templateData: VerificationEmailData = {
    verificationCode: verificationCode || 'N/A',
    verificationLink: verificationUrl,
    verificationUrl: verificationUrl,
    resendLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signup?resend=true&email=${encodeURIComponent(email)}`
  };

  // Add current year to template data
  templateData.currentYear = getCurrentYear();

  // Replace template variables
  const html = replaceTemplateVariables(template, templateData);

  return await sendEmail(email, 'ﷺ تفعيل حسابك في تطبيق الدروود - Durood Tracker', html);
}

export async function sendDailyReminderEmail(email: string, userData: DailyReminderEmailData) {
  if (!emailConfig) {
    throw new Error('Email service not configured');
  }

  // Load the daily reminder template
  const template = loadEmailTemplate('daily-reminder');

  // Add current year to template data
  userData.currentYear = getCurrentYear();

  // Replace template variables
  const html = replaceTemplateVariables(template, userData);

  return await sendEmail(email, '🔔 تذكير يومي بالدروود - Durood Tracker', html);
}
