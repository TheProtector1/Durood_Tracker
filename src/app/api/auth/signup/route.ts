import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmailVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

type SignupBody = {
  email: string
  username: string
  password: string
  displayName?: string
}

// Input validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateUsername(username: string): boolean {
  // Username should only contain letters, numbers, underscores, and hyphens
  // Should be 3-20 characters long
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

function validateDisplayName(displayName: string): boolean {
  // Display name should only contain letters, spaces, and basic punctuation
  // Should be 2-50 characters long
  const displayNameRegex = /^[a-zA-Z\s\-_.]{2,50}$/
  return displayNameRegex.test(displayName)
}

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, displayName }: SignupBody = await request.json()

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      )
    }

    // Email validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Username validation
    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters long and contain only letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Display name validation (if provided)
    if (displayName && !validateDisplayName(displayName)) {
      return NextResponse.json(
        { error: 'Display name must be 2-50 characters long and contain only letters, spaces, hyphens, underscores, and periods' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true } // minimal select for existence check
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

    // Create user (do not return password)
    // Try with new fields first, fallback to old schema if fields don't exist
    let user
    try {
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          displayName: displayName || username,
          emailVerificationToken: hashedToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          createdAt: true,
          updatedAt: true
        }
      })
    } catch (dbError) {
      console.warn('New database fields not available, falling back to old schema:', dbError)
      // Fallback to old schema without email verification fields
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          displayName: displayName || username
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          createdAt: true,
          updatedAt: true
        }
      })
    }

    // Send verification email (if email service is configured)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    let emailSent = false
    if (process.env.SMTP_HOST || process.env.RESEND_API_KEY) {
      try {
        await sendEmailVerificationEmail(email, verificationUrl)
        emailSent = true
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Don't fail the signup if email fails, but log it
        // User can still request verification later
      }
    }

    return NextResponse.json(
      {
        message: emailSent
          ? 'User created successfully. Please check your email to verify your account.'
          : 'User created successfully. Email verification is currently unavailable, but you can still use your account.',
        user,
        requiresVerification: emailSent,
        emailSent
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    console.error('Signup error:', err)
    // Provide more detailed error information for debugging
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Detailed error:', errorMessage)

    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
