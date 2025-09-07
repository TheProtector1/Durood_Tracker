# 🚀 Durood Tracker Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

1. **Database**: PostgreSQL database (recommended: Vercel Postgres, PlanetScale, or Railway)
2. **Email Service**: Choose one of the supported providers (SendGrid, Mailgun, Gmail, etc.)
3. **Domain**: Custom domain for your application
4. **SSL Certificate**: HTTPS support (provided by most hosting platforms)

## Environment Variables Setup

### For Vercel Deployment

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# NextAuth (Required)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-secret-here

# Email Service (Choose ONE provider)
# SendGrid (Recommended)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# OR Mailgun
MAILGUN_API_KEY=key-your-mailgun-key
MAILGUN_DOMAIN=yourdomain.com
FROM_EMAIL=noreply@yourdomain.com

# OR Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
```

### For Other Hosting Platforms

Create a `.env.production` file with the same variables listed above.

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. **Install Vercel Postgres:**
   ```bash
   npx vercel postgres create
   ```

2. **Get your connection string:**
   ```bash
   npx vercel postgres url
   ```

3. **Apply database schema:**
   ```bash
   npx prisma db push
   ```

### Option 2: PlanetScale

1. **Create a PlanetScale database**
2. **Get your connection string from the dashboard**
3. **Set DATABASE_URL and DIRECT_URL environment variables**
4. **Apply schema:** `npx prisma db push`

### Option 3: Railway

1. **Create a PostgreSQL database on Railway**
2. **Copy the DATABASE_URL from the dashboard**
3. **Set it as an environment variable**
4. **Apply schema:** `npx prisma db push`

## Email Service Setup

### SendGrid (Recommended for Production)

1. **Sign up at [sendgrid.com](https://sendgrid.com)**
2. **Create an API key in Settings → API Keys**
3. **Verify your domain for better deliverability**
4. **Add environment variables**

### Mailgun

1. **Sign up at [mailgun.com](https://mailgun.com)**
2. **Verify your domain**
3. **Get API key from Settings → API Keys**
4. **Add environment variables**

### Gmail SMTP (Free but Limited)

1. **Enable 2-Factor Authentication on Gmail**
2. **Generate an App Password**
3. **Use the App Password (not your regular password)**
4. **Add SMTP environment variables**

## Deployment Steps

### Vercel Deployment (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables in Vercel dashboard**
3. **Deploy the application**
4. **Run database migrations:**
   ```bash
   npx vercel prisma db push
   ```

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set environment variables**
3. **Apply database schema:**
   ```bash
   npx prisma db push
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

## Post-Deployment Checklist

- ✅ **Database Connection**: Test database connectivity
- ✅ **Email Service**: Verify email sending works
- ✅ **User Registration**: Test user signup and email verification
- ✅ **Authentication**: Test login/logout functionality
- ✅ **HTTPS**: Ensure SSL certificate is active
- ✅ **Domain**: Verify custom domain is working

## Troubleshooting

### Database Issues

```bash
# Test database connection
npx prisma db push --preview-feature

# Check database schema
npx prisma studio
```

### Email Issues

```bash
# Test email configuration
node test-email.js
```

### Authentication Issues

```bash
# Check NextAuth configuration
# Verify NEXTAUTH_URL matches your domain
# Ensure NEXTAUTH_SECRET is set
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to Git
2. **API Keys**: Rotate regularly and use restricted permissions
3. **Database**: Use connection pooling and prepared statements
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Caching**: Use Redis for session storage if needed
3. **CDN**: Use a CDN for static assets
4. **Compression**: Enable gzip compression

## Monitoring

1. **Error Logging**: Set up error tracking (Sentry, LogRocket)
2. **Analytics**: Add user analytics (Google Analytics, Mixpanel)
3. **Database Monitoring**: Monitor query performance
4. **Uptime Monitoring**: Set up uptime alerts

## Support

For deployment issues:
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Test database connectivity
- Check email service status

---

**Your Durood Tracker is now ready for production! 🕌✨**
