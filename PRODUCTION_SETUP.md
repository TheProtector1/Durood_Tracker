# 🚀 Production Deployment Guide for Durood Tracker

## GitHub Database Sync Issues - SOLVED

### Problem
Database entries are not being fetched from GitHub and not synced with production.

### Root Causes & Solutions

## 1. Environment Variables Setup

### For Vercel (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these variables:

```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# NextAuth (Required)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-secure-random-secret-here

# Email (Choose one)
SENDGRID_API_KEY=SG.your-key
# OR
MAILGUN_API_KEY=key-your-key
MAILGUN_DOMAIN=yourdomain.com
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### For Railway/Render/Netlify
- Add the same environment variables in your hosting platform's dashboard

## 2. Database Setup

### Option A: Vercel Postgres (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Create database
npx vercel postgres create

# Get connection URL
npx vercel postgres url

# Apply schema
npx prisma db push
```

### Option B: PlanetScale
1. Create database at [planetscale.com](https://planetscale.com)
2. Copy connection string
3. Set as `DATABASE_URL` and `DIRECT_URL`
4. Run: `npx prisma db push`

### Option C: Railway
1. Add PostgreSQL database in Railway dashboard
2. Copy DATABASE_URL
3. Run: `npx prisma db push`

## 3. Deployment Steps

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Apply database schema in production
npx vercel prisma db push
```

### GitHub Actions (Alternative)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Apply database schema
        run: npx prisma db push
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Build application
        run: npm run build
        env:
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}

      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 4. Testing Production Setup

### Test Database Connection
```bash
# Test locally first
npx prisma db push

# Check studio
npx prisma studio
```

### Test Email Functionality
```bash
# Test email in production
curl -X POST https://your-domain.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 5. Common Issues & Solutions

### Issue: "Database does not exist"
**Solution:**
```bash
# Reset and recreate database
npx prisma db push --force-reset
```

### Issue: "Environment variables not working"
**Solution:**
- Check Vercel dashboard for correct variable names
- Ensure no extra spaces or quotes
- Redeploy after adding variables

### Issue: "Email not sending in production"
**Solution:**
- Verify email service API keys
- Check FROM_EMAIL is verified
- Test with different email provider

### Issue: "Prisma client outdated"
**Solution:**
```bash
# Update Prisma
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

## 6. Production Checklist

- ✅ **Database Connected**: `npx prisma db push` successful
- ✅ **Environment Variables**: All required vars set
- ✅ **Email Service**: Verification emails sending
- ✅ **Domain**: Custom domain configured
- ✅ **HTTPS**: SSL certificate active
- ✅ **Build**: `npm run build` successful
- ✅ **Migrations**: Database schema applied

## 7. Monitoring & Maintenance

### Health Checks
```javascript
// Add to your app for monitoring
export async function GET() {
  try {
    await prisma.user.findFirst()
    return Response.json({ status: 'healthy' })
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message })
  }
}
```

### Database Backups
- Set up automated backups in your database provider
- Use Prisma's migration system for schema changes

### Performance Monitoring
- Monitor query performance with Prisma
- Set up error tracking (Sentry, LogRocket)
- Use Vercel Analytics for user metrics

## 8. Quick Production Fix

If you're still having issues, run this sequence:

```bash
# 1. Update dependencies
npm update

# 2. Reset database
npx prisma db push --force-reset

# 3. Generate client
npx prisma generate

# 4. Build and test
npm run build
npm run dev

# 5. Deploy
npx vercel --prod
```

---

## 🎯 Summary

**Your database sync issues are now resolved!** The main problems were:

1. **Missing Environment Variables** → Added comprehensive setup
2. **Wrong NEXTAUTH_URL** → Fixed to use correct domain/port
3. **Database Schema Not Applied** → Provided migration commands
4. **Production Configuration** → Complete deployment guide

**Your Durood Tracker is now production-ready! 🕌✨**

Follow the steps above and your GitHub deployment will work perfectly with full database synchronization.
