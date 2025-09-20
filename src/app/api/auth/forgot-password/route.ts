import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, you will receive password reset instructions.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expires: resetTokenExpiry,
      }
    })

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Try to send email if email service is configured
    const emailConfigured = process.env.SMTP_HOST || process.env.SENDGRID_API_KEY || process.env.MAILGUN_API_KEY || process.env.RESEND_API_KEY

    if (emailConfigured) {
      try {
        await sendPasswordResetEmail(email, resetUrl)
        console.log('Password reset email sent successfully to:', email)

        return NextResponse.json(
          { message: 'Password reset instructions have been sent to your email.' },
          { status: 200 }
        )
      } catch (emailError) {
        console.error('Email sending failed:', emailError)

        // If email fails, delete the token and return error
        await prisma.passwordReset.delete({
          where: { token: resetToken }
        })

        return NextResponse.json(
          { error: 'Failed to send password reset email. Please try again later.' },
          { status: 500 }
        )
      }
    } else {
      // Email not configured: return the URL for manual testing
      console.log('Password reset URL generated (email not configured):', resetUrl)

      return NextResponse.json(
        {
          message: 'Password reset link generated (email not configured).',
          resetUrl: resetUrl
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    )
  }
}
