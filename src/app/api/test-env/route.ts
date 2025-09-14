import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  const hasDbUrl = !!dbUrl
  const dbUrlMasked = dbUrl ? dbUrl.replace(/:([^:@]{8})[^:@]*@/, ':***masked***@') : 'NOT SET'
  
  return NextResponse.json({
    DATABASE_URL: dbUrlMasked,
    hasDatabaseUrl: hasDbUrl,
    smtpHost: process.env.SMTP_HOST,
    smtpUser: process.env.SMTP_USER ? 'SET' : 'NOT SET',
    nextAuthUrl: process.env.NEXTAUTH_URL
  })
}
