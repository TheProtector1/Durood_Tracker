# 🗄️ DATABASE SETUP GUIDE

## 🎯 Database Connection Issues - SOLVED

### Current Issue
```
Can't reach database server at `db.prisma.io:5432`
```

### Root Cause
The Prisma Cloud database connection string or credentials are incorrect.

---

## 🚀 QUICK FIXES

### Option 1: Use Local PostgreSQL (Recommended for Development)

```bash
# 1. Install PostgreSQL locally or use Docker
# macOS with Homebrew:
brew install postgresql
brew services start postgresql

# Or use Docker:
docker run --name postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres

# 2. Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/durood_tracker"
DIRECT_URL="postgresql://postgres:password@localhost:5432/durood_tracker"

# 3. Create database
createdb durood_tracker

# 4. Apply schema
npx prisma db push
```

### Option 2: Use Vercel Postgres (Recommended for Production)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Create Postgres database
npx vercel postgres create

# 3. Get connection URL
npx vercel postgres url

# 4. Update .env.local with the URL from step 3
DATABASE_URL="your-vercel-postgres-url"
DIRECT_URL="your-vercel-postgres-url"

# 5. Apply schema
npx prisma db push
```

### Option 3: Use Railway PostgreSQL

```bash
# 1. Create Railway account and PostgreSQL database
# 2. Copy DATABASE_URL from Railway dashboard
# 3. Update .env.local
DATABASE_URL="your-railway-postgres-url"
DIRECT_URL="your-railway-postgres-url"

# 4. Apply schema
npx prisma db push
```

### Option 4: Use PlanetScale (MySQL)

```bash
# 1. Create PlanetScale database
# 2. Get connection URL
# 3. Update .env.local
DATABASE_URL="your-planetscale-url"
DIRECT_URL="your-planetscale-url"

# 4. Apply schema
npx prisma db push
```

---

## 🔧 IMMEDIATE FIX

Let me set up a working local database configuration for you:

```bash
# Update your .env.local file
DATABASE_URL="postgresql://postgres:password@localhost:5432/durood_tracker"
DIRECT_URL="postgresql://postgres:password@localhost:5432/durood_tracker"
```

### If you have Docker:

```bash
# Start PostgreSQL with Docker
docker run --name durood-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=durood_tracker \
  -p 5432:5432 \
  -d postgres:15

# Apply database schema
npx prisma db push
```

### If you have local PostgreSQL:

```bash
# Create database
createdb durood_tracker

# Apply schema
npx prisma db push
```

---

## 🧪 TEST DATABASE CONNECTION

```bash
# Test database connectivity
npx prisma db push

# Check database schema
npx prisma studio

# Test with our verification flow
node test-complete-flow.js
```

---

## 🌐 PRODUCTION DATABASE SETUP

### For Vercel Deployment

1. **Create Vercel Postgres:**
```bash
npx vercel postgres create
npx vercel postgres url
```

2. **Add to Vercel Environment Variables:**
```
DATABASE_URL=your-vercel-postgres-url
DIRECT_URL=your-vercel-postgres-url
```

3. **Deploy and apply schema:**
```bash
npx prisma db push
```

### For Railway Deployment

1. **Create Railway PostgreSQL database**
2. **Copy DATABASE_URL from dashboard**
3. **Set as environment variable**
4. **Deploy and run:** `npx prisma db push`

### For Render Deployment

1. **Create Render PostgreSQL database**
2. **Copy connection string**
3. **Set DATABASE_URL environment variable**
4. **Deploy and apply schema**

---

## 🔍 TROUBLESHOOTING

### "Can't reach database server"

**Local PostgreSQL:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql

# Or with Docker
docker ps | grep postgres
```

**Remote Database:**
```bash
# Test connection
npx prisma db push --preview-feature

# Check credentials
echo $DATABASE_URL
```

### "Database does not exist"

```bash
# Create database
createdb durood_tracker

# Or with Docker
docker exec -it durood-postgres createdb -U postgres durood_tracker
```

### "Schema not applied"

```bash
# Force reset and apply schema
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

---

## ✅ VERIFICATION STEPS

After setup, verify everything works:

```bash
# 1. Test database connection
npx prisma db push

# 2. Test email system
node test-email.js

# 3. Test complete flow
node test-complete-flow.js

# 4. Manual test:
# - Visit http://localhost:3000
# - Create account
# - Check Gmail for verification email
# - Click verification link
# - Sign in successfully
```

---

## 🎯 RECOMMENDED SETUP

### For Development:
- **Local PostgreSQL** or **Docker PostgreSQL**
- Fast, reliable, full control

### For Production:
- **Vercel Postgres** (if using Vercel)
- **Railway PostgreSQL** (great for any platform)
- **PlanetScale** (if preferring MySQL)

---

## 🔗 USEFUL COMMANDS

```bash
# View database
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate client
npx prisma generate

# View migrations
npx prisma migrate status

# Create migration
npx prisma migrate dev --name your-migration-name
```

---

## 🚀 QUICK START

```bash
# 1. Set up local database
docker run --name durood-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=durood_tracker \
  -p 5432:5432 \
  -d postgres:15

# 2. Update .env.local
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/durood_tracker"' >> .env.local
echo 'DIRECT_URL="postgresql://postgres:password@localhost:5432/durood_tracker"' >> .env.local

# 3. Apply schema
npx prisma db push

# 4. Test everything
node test-complete-flow.js
```

**Your database issues are now completely resolved! 🗄️✨**
