import nodemailer from 'nodemailer';

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

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!emailConfig) {
    throw new Error('Email service not configured');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; color: #10b981;">﷽</div>
      </div>
      <h2 style="color: #065f46; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Assalamu Alaikum,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">You have requested to reset your password for your Durood Tracker account.</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Click the button below to reset your password:</p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}"
           style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
          Reset Password
        </a>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <p style="color: #166534; margin: 0; font-weight: 500;">If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #059669; margin: 10px 0 0 0; font-family: monospace;">${resetUrl}</p>
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-weight: 500;">⏰ This link will expire in 1 hour.</p>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">If you didn't request this password reset, please ignore this email.</p>

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Best regards,<br>
          <strong>The Durood Tracker Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'Password Reset Request - Durood Tracker', html);
}

export async function sendEmailVerificationEmail(email: string, verificationUrl: string) {
  if (!emailConfig) {
    throw new Error('Email service not configured');
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; color: #10b981;">﷽</div>
      </div>
      <h2 style="color: #065f46; text-align: center; margin-bottom: 20px;">Welcome to Durood Tracker!</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Assalamu Alaikum,</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Thank you for joining Durood Tracker. To complete your registration and start tracking your durood recitations, please verify your email address.</p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${verificationUrl}"
           style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
          Verify Your Email
        </a>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 30px 0;">
        <p style="color: #166534; margin: 0; font-weight: 500;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #059669; margin: 10px 0 0 0; font-family: monospace;">${verificationUrl}</p>
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-weight: 500;">⏰ This verification link will expire in 24 hours.</p>
      </div>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Once verified, you'll be able to:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
        <li>Track your daily durood recitations</li>
        <li>View comprehensive durood collections</li>
        <li>Monitor your prayer completion</li>
        <li>Join community rankings</li>
      </ul>

      <p style="color: #374151; font-size: 16px; line-height: 1.6;">If you didn't create this account, please ignore this email.</p>

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Best regards,<br>
          <strong>The Durood Tracker Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'Verify Your Email - Durood Tracker', html);
}
