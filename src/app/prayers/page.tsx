'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { getPakistanDate, formatPakistanDate } from '@/lib/timezone'
import TimezoneDisplay from '@/components/TimezoneDisplay'

interface PrayerHistory {
  [date: string]: Array<{
    prayerName: string
    completed: boolean
    completedAt: Date | null
  }>
}

interface PrayerStats {
  totalDays: number
  totalPrayers: number
  completedPrayers: number
  averageCompletionRate: number
  perfectDays: number
  totalPossiblePrayers: number
  actualCompletedPrayers: number
}

export default function PrayersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [history, setHistory] = useState<PrayerHistory | null>(null)
  const [stats, setStats] = useState<PrayerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [loadStartTime, setLoadStartTime] = useState<Date | null>(null)

  console.log('🕌 PrayersPage render:', {
    session: !!session,
    sessionUser: session?.user?.id,
    status,
    isLoading,
    error
  })

  const loadPrayerHistory = useCallback(async (showRefreshing = false) => {
    if (!session?.user?.id) return

    try {
      if (showRefreshing) {
        setIsRefreshing(true)
        console.log('Prayer history: Force refreshing data')
      } else {
        setIsLoading(true)
        setLoadStartTime(new Date())
        console.log('Prayer history: Loading data for date:', currentDate)
      }
      setError('')

      // Add timeout to prevent infinite loading
      let controller: AbortController | null = null
      let timeoutId: NodeJS.Timeout | null = null

      let response: Response

      try {
        // Check if AbortController is available (compatibility with different environments)
        if (typeof AbortController !== 'undefined') {
          controller = new AbortController()
          timeoutId = setTimeout(() => {
            if (controller) {
              controller.abort()
            }
          }, 10000) // 10 second timeout
        }

        const fetchOptions: RequestInit = {}
        if (controller?.signal) {
          fetchOptions.signal = controller.signal
        }

        response = await fetch('/api/prayers/history', fetchOptions)

        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      } catch (fetchError) {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        throw fetchError
      }

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
        setStats(data.stats)
        setLoadStartTime(null)
        console.log('Prayer history: Data loaded successfully, stats:', data.stats)
        setLastUpdate(new Date())
      } else {
        console.error('Prayer history: Failed to load data, status:', response.status)
        setError('Failed to load prayer history')
        setLoadStartTime(null)
      }
    } catch (error: unknown) {
      console.error('Prayer history: Error loading data:', error)

      // Check for abort error in a way that works across different environments
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorName = error instanceof Error ? error.name : ''

      if (errorName === 'AbortError' || errorMessage.includes('aborted') || errorMessage.includes('timeout')) {
        setError('Request timeout - please try again')
      } else {
        setError('Failed to load prayer history')
      }
      setLoadStartTime(null)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [session, currentDate])

  // Update current Pakistan date
  useEffect(() => {
    const updateDate = () => {
      const today = getPakistanDate()
      setCurrentDate(today)
      console.log('Prayer history: Pakistan date updated to:', today)
    }

    updateDate()
    // Update date every minute to catch date changes in Pakistan timezone
    const interval = setInterval(updateDate, 60000)
    return () => clearInterval(interval)
  }, [])

  // Reload prayer history when date changes
  useEffect(() => {
    if (currentDate) {
      loadPrayerHistory()
    }
  }, [currentDate, loadPrayerHistory])

  // Handle page visibility changes to reload prayer history when user comes back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.id) {
        console.log('Prayer history page became visible, reloading data')
        loadPrayerHistory(true) // Force refresh
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [session?.user?.id, loadPrayerHistory])

  // Handle different loading states
  if (status === 'loading') {
    console.log('🕌 Authentication loading...')
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Authenticating...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    console.log('🕌 No session found, redirecting to signin')
    router.push('/auth/signin')
    return null
  }

  console.log('🕌 Session found, proceeding with prayer page')

  // Check prayer data loading with timeout fallback
  if (isLoading) {
    console.log('🕌 Prayer data loading...')

    // Show fallback content if loading takes too long (more than 3 seconds)
    const loadingTime = loadStartTime ? Date.now() - loadStartTime.getTime() : 0
    if (loadingTime > 3000) {
      console.log('🕌 Loading taking too long, showing fallback')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading prayer history...</p>
            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your prayer data</p>
            {loadingTime > 3000 && (
              <div className="mt-4">
                <p className="text-sm text-amber-600 mb-2">Taking longer than expected...</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Reload Page
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getPrayerDisplayName = (prayerName: string) => {
    const names: { [key: string]: string } = {
      fajr: 'Fajr',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    }
    return names[prayerName] || prayerName
  }

  const getCompletionIcon = (completed: boolean) => {
    return completed ? '✅' : '❌'
  }

  const sortedDates = history ? Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) : []

  return (
    <div>
      <h1>Prayer History</h1>
      <p>Track your daily prayer completions</p>
    </div>
  )
}
