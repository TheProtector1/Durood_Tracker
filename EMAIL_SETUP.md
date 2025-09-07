# Email Provider Configuration Guide

This guide explains how to configure different email providers for Durood Tracker's email verification and password reset features.

## Supported Email Providers

### 1. SendGrid (Recommended)
**Free Tier:** 100 emails/day, then paid plans
**Setup:**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key in Settings > API Keys
3. Add to your `.env.local`:
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

### 2. Mailgun
**Free Tier:** 5,000 emails/month
**Setup:**
1. Sign up at [Mailgun](https://mailgun.com)
2. Verify your domain or use Mailgun's sandbox domain
3. Get your API key from Settings > API Keys
4. Add to your `.env.local`:
```bash
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Gmail SMTP
**Free:** Limited to 500 emails/day
**Setup:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password in Google Account Settings
3. Add to your `.env.local`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_SECURE=false
FROM_EMAIL=your-email@gmail.com
```

### 4. Outlook/Hotmail SMTP
**Free:** Limited daily sending limits
**Setup:**
1. Add to your `.env.local`:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your_password_here
SMTP_SECURE=false
FROM_EMAIL=your-email@outlook.com
```

### 5. Custom SMTP Server
**Setup:**
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_SECURE=false  # Set to true for port 465
FROM_EMAIL=noreply@yourdomain.com
```

## Configuration Priority

The system checks for email providers in this order:
1. SendGrid (SENDGRID_API_KEY)
2. Mailgun (MAILGUN_API_KEY + MAILGUN_DOMAIN)
3. AWS SES (AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION)
4. SMTP (SMTP_HOST + SMTP_USER + SMTP_PASS)

## Environment Variables

Create a `.env.local` file in your project root with your chosen provider's configuration:

```bash
# Choose ONE provider configuration:

# For SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@duroodtracker.com

# For Mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=duroodtracker.com
FROM_EMAIL=noreply@duroodtracker.com

# For Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-app@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
FROM_EMAIL=your-app@gmail.com

# For Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
FROM_EMAIL=your-email@outlook.com
```

## Testing Email Configuration

After setup, test the email functionality:

1. Try creating a new user account
2. Check if verification email is sent
3. Try the password reset feature

## Troubleshooting

### Common Issues:

1. **"Email service not configured"**
   - Check that your environment variables are set correctly
   - Ensure your `.env.local` file is in the project root

2. **"Authentication failed" (SMTP)**
   - For Gmail: Use App Password instead of regular password
   - For Outlook: Ensure you're using the correct SMTP settings

3. **"Domain not verified" (Mailgun)**
   - Use Mailgun's sandbox domain for testing
   - Or verify your own domain in Mailgun dashboard

4. **Rate Limits**
   - Check your provider's sending limits
   - Free tiers have daily/monthly limits

### Email Not Being Sent:

- Check server console for error messages
- Verify your API keys are correct
- Ensure your domain is verified (for Mailgun)
- Check spam/junk folder

## Security Notes

- Never commit your `.env.local` file to version control
- Use App Passwords for Gmail instead of regular passwords
- Rotate API keys regularly
- Monitor your email sending limits

## Support

For issues with specific email providers:
- **SendGrid:** Check their status page and documentation
- **Mailgun:** Review their knowledge base
- **Gmail/Outlook:** Check Microsoft's email sending guidelines

## Cost Comparison

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| SendGrid | 100/day | $19.95/month (50k emails) |
| Mailgun | 5,000/month | $35/month (50k emails) |
| Gmail | 500/day | N/A (personal use only) |
| Outlook | Limited | N/A (personal use only) |

Choose based on your expected email volume and budget requirements.