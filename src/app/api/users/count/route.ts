import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('User count API called')
    
    // Test Prisma client
    console.log('Prisma client status:', prisma ? 'initialized' : 'not initialized')
    
    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    const userCount = await prisma.user.count()
    console.log('User count retrieved:', userCount)
    
    return NextResponse.json({ count: userCount })
  } catch (error) {
    console.error('Error getting user count - details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    return NextResponse.json(
      { error: 'Failed to get user count' },
      { status: 500 }
    )
  }
}
