'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

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

  // Update current date
  useEffect(() => {
    const updateDate = () => {
      const today = new Date().toISOString().split('T')[0]
      setCurrentDate(today)
    }

    updateDate()
    // Update date every minute to catch date changes
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Islamic decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                ← Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPrayerHistory(true)}
              disabled={isRefreshing}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  🔄 Refresh
                </>
              )}
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🕌 Prayer History</h1>
          <p className="text-gray-600">Track your daily prayer completion history</p>
          <div className="text-xs text-blue-600 mt-2 space-y-1">
            <div>🔄 Refreshes automatically when you complete prayers on the home page</div>
            {lastUpdate && (
              <div className="text-green-600">
                ✅ Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <div className="mt-2">
              <Button
                onClick={() => loadPrayerHistory(true)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">Days Tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{stats.totalDays}</div>
                <div className="text-xs text-emerald-600 mt-1">Total days recorded</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Possible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalPossiblePrayers}</div>
                <div className="text-xs text-blue-600 mt-1">Prayers available</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Actually Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.actualCompletedPrayers}</div>
                <div className="text-xs text-green-600 mt-1">Prayers performed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Perfect Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.perfectDays}</div>
                <div className="text-xs text-purple-600 mt-1">All 5 prayers completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600">{stats.averageCompletionRate}%</div>
                <div className="text-xs text-orange-600 mt-1">Average daily completion</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prayer History */}
        {history && sortedDates.length > 0 ? (
          <div className="space-y-4">
            {sortedDates.map(date => (
              <Card key={date} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg text-gray-800">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</span>
                    {date === new Date().toISOString().split('T')[0] && (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold">
                        🕌 Today
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-emerald-700 font-medium flex items-center gap-2">
                    <span>
                      {history[date].filter(p => p.completed).length}/5 prayers completed
                      <span className="ml-2 text-sm text-emerald-600">
                        ({Math.round((history[date].filter(p => p.completed).length / 5) * 100)}%)
                      </span>
                    </span>
                    {history[date].filter(p => p.completed).length === 5 && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                        ⭐ Perfect Day
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(prayerName => {
                      const prayerData = history[date].find(p => p.prayerName === prayerName)
                      const completed = prayerData?.completed || false

                      return (
                        <div
                          key={prayerName}
                          className={`relative group p-6 rounded-2xl border-2 transition-all duration-500 select-none min-h-[120px] ${
                            completed
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400 text-white shadow-xl'
                              : 'bg-gradient-to-br from-white to-gray-50 border-gray-300 text-gray-700 hover:border-emerald-400 hover:shadow-xl hover:scale-105'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-4xl mb-2 transition-transform duration-300 ${completed ? 'animate-pulse' : 'group-hover:rotate-12'}`}>
                              {completed ? '✅' : '🕌'}
                            </div>
                            <div className={`font-bold text-lg mb-1 ${completed ? 'text-white' : 'text-gray-800'}`}>
                              {getPrayerDisplayName(prayerName)}
                            </div>
                            <div className={`text-sm font-medium ${completed ? 'text-emerald-100' : 'text-gray-500'}`}>
                              {completed ? 'Completed' : 'Pending'}
                            </div>
                            {completed && prayerData?.completedAt && (
                              <div className="mt-2 text-xs text-emerald-100 font-medium bg-white/20 rounded px-2 py-1 border border-white/30">
                                {format(new Date(prayerData.completedAt), 'HH:mm')}
                              </div>
                            )}
                          </div>
                          {completed && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Locked
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🕌</div>
                <p className="text-xl font-semibold mb-2 text-gray-700">No Prayer History Yet</p>
                <p className="text-sm mb-6">Start tracking your daily prayers to see your history here.</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                    🏠 Go to Home & Start Tracking
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
