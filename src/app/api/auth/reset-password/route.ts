import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log('Reset password request received:', { token: token ? 'present' : 'missing', passwordLength: password?.length })

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('Looking for password reset record with token...')

    // Find the password reset record
    let resetRecord;
    try {
      resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token,
          expires: {
            gt: new Date()
          }
        }
      })
    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw new Error('Database query failed');
    }

    console.log('Reset record found:', resetRecord ? 'yes' : 'no')

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    console.log('Hashing new password...')

    // Hash the new password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12)
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      throw new Error('Password hashing failed');
    }

    console.log('Updating user password...')

    // Update user's password
    try {
      await prisma.user.update({
        where: { email: resetRecord.email },
        data: { password: hashedPassword }
      })
    } catch (updateError) {
      console.error('User update error:', updateError);
      throw new Error('Failed to update user password');
    }

    console.log('Deleting used reset token...')

    // Delete the used reset token
    try {
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id }
      })
    } catch (deleteError) {
      console.error('Token deletion error:', deleteError);
      // Don't throw here as the password was already updated
      console.log('Warning: Failed to delete reset token, but password was updated');
    }

    console.log('Password reset completed successfully')

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    return NextResponse.json(
      { error: 'An error occurred while resetting your password.' },
      { status: 500 }
    )
  }
}
