# Email Setup Guide for Durood Tracker

## Required Environment Variables

To enable email functionality for password reset, you need to set the following environment variables:

### 1. Resend API Key
```bash
RESEND_API_KEY=your-resend-api-key-here
```

### 2. From Email Address
```bash
FROM_EMAIL=noreply@yourdomain.com
```

### 3. NextAuth URL
```bash
NEXTAUTH_URL=https://yourdomain.com
```

## How to Get Resend API Key

1. Go to [Resend.com](https://resend.com) and create an account
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key and add it to your environment variables

## Vercel Configuration

### Environment Variables
Add the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: Your verified domain email (e.g., noreply@yourdomain.com)
   - `NEXTAUTH_URL`: Your production domain (e.g., https://yourdomain.com)

### Domain Verification
If you want to send emails from a custom domain:

1. In Resend, go to Domains section
2. Add and verify your domain
3. Update the `FROM_EMAIL` to use your verified domain

## Local Development

For local development, create a `.env.local` file in your project root:

```bash
RESEND_API_KEY=your-resend-api-key-here
FROM_EMAIL=noreply@yourdomain.com
NEXTAUTH_URL=http://localhost:3000
```

## Testing

1. Start your development server
2. Go to the forgot password page
3. Enter a valid email address
4. Check your email for the password reset link
5. Verify the link works and allows password reset

## Troubleshooting

### Email Not Sending
- Check if `RESEND_API_KEY` is set correctly
- Verify the `FROM_EMAIL` domain is verified in Resend
- Check Vercel function logs for any errors

### Invalid API Key
- Ensure the API key is copied correctly
- Check if the API key has the necessary permissions
- Verify the API key is active in Resend

### Domain Issues
- Make sure your domain is verified in Resend
- Check DNS records are configured correctly
- Allow some time for DNS propagation
