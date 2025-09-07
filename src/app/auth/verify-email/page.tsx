'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error')
      setMessage('Invalid verification link. No token provided.')
      setIsVerifying(false)
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 400 && data.error.includes('expired')) {
            setVerificationStatus('expired')
            setMessage('This verification link has expired. Please request a new one.')
          } else {
            setVerificationStatus('error')
            setMessage(data.error || 'Verification failed')
          }
        } else {
          setVerificationStatus('success')
          setMessage('Your email has been successfully verified! You can now sign in to your account.')
        }
      } catch (error) {
        setVerificationStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token])

  const handleResendVerification = async () => {
    const email = searchParams.get('email')
    if (!email) {
      setMessage('Unable to resend verification. Email not found.')
      return
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage('A new verification email has been sent to your email address.')
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to resend verification email')
      }
    } catch (error) {
      setMessage('An error occurred while resending the verification email.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Islamic decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          {/* Islamic star icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white transform rotate-45"></div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            {verificationStatus === 'success' ? 'Email Verified! ✅' :
             verificationStatus === 'expired' ? 'Link Expired ⏰' :
             verificationStatus === 'error' ? 'Verification Failed ❌' :
             'Verifying Email...'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isVerifying ? 'Please wait while we verify your email address.' : message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isVerifying && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-700 text-center">🎉 Your email has been successfully verified!</p>
              </div>
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
              >
                Continue to Sign In
              </Button>
            </div>
          )}

          {verificationStatus === 'expired' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-center">⏰ This verification link has expired.</p>
              </div>
              <Button
                onClick={handleResendVerification}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
              >
                Resend Verification Email
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-center">{message}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  Resend Email
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  Sign Up Again
                </Button>
              </div>
            </div>
          )}

          <div className="text-center space-y-3 pt-4">
            <div className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/auth/signin" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                Contact Support
              </Link>
            </div>
            <div>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                  ← Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
