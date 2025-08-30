'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { format, startOfMonth, startOfYear, isSameDay, subDays } from 'date-fns'

interface DuroodEntry {
  id: string
  date: string
  count: number
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<DuroodEntry[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [inputCount, setInputCount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [publicTotal, setPublicTotal] = useState<number | null>(null)
  const [publicTotalLoading, setPublicTotalLoading] = useState(true)
  const [publicTotalLive, setPublicTotalLive] = useState<number | null>(null)
  const [currentCount, setCurrentCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const pendingCountRef = useRef(0)
  const [userCount, setUserCount] = useState<number | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/durood')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
    }
  }, [])

  // Load entries from API when authenticated
  //  adding comment
  useEffect(() => {
    if (session?.user?.id) {
      fetchEntries()
    }
  }, [session, fetchEntries])

  // Update today's count whenever entries change
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayEntry = entries.find(entry => entry.date === today)
    const actualCount = todayEntry?.count || 0
    setTodayCount(actualCount)
    pendingCountRef.current = 0 // Reset pending count when entries are loaded
    setPendingCount(0) // Reset pending count when entries are loaded
  }, [entries])

  // Load community total for unauthenticated landing
  useEffect(() => {
    const loadTotal = async () => {
      try {
        const res = await fetch('/api/durood/total')
        if (res.ok) {
          const json = await res.json()
          setPublicTotal(json.total ?? 0)
          setPublicTotalLive(json.total ?? 0)
        }
      } finally {
        setPublicTotalLoading(false)
      }
    }
    loadTotal()
  }, [])

  // Live updates for community total (unauthenticated landing)
  useEffect(() => {
    if (session) return
    const es = new EventSource('/api/durood/total/stream')
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (typeof data.total === 'number') {
          setPublicTotalLive(data.total)
        }
      } catch {}
    }
    es.onerror = () => {
      es.close()
    }
    return () => es.close()
  }, [session])

  // Load user count
  useEffect(() => {
    const loadUserCount = async () => {
      try {
        console.log('Loading user count...')
        const res = await fetch('/api/users/count')
        if (res.ok) {
          const json = await res.json()
          console.log('User count loaded:', json.count)
          setUserCount(json.count ?? 0)
          console.log('User count state set to:', json.count)
        } else {
          console.error('Failed to load user count:', res.status)
        }
      } catch (error) {
        console.error('Error loading user count:', error)
      }
    }
    
    // Load user count for both authenticated and unauthenticated users
    loadUserCount()
  }, [])

  // Helper function to get total pending count
  const getTotalPendingCount = useCallback(() => {
    return pendingCountRef.current
  }, [])

  // Debounced function to sync with database
  const syncWithDatabase = useCallback(async (totalPending: number) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await fetch('/api/durood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today, count: totalPending }),
      })

      if (response.ok) {
        // Refresh entries from database to get accurate totals
        await fetchEntries()
      }
    } catch (error) {
      console.error('Error syncing with database:', error)
      // If sync fails, revert to actual count from database
      await fetchEntries()
    }
  }, [fetchEntries])

  const addDurood = async () => {
    if (!inputCount || parseInt(inputCount) <= 0) return

    const count = parseInt(inputCount)
    const today = format(new Date(), 'yyyy-MM-dd')
    
    // Update UI instantly
    setTodayCount(prev => prev + count)
    setPendingCount(prev => {
      const newPending = prev + count
      pendingCountRef.current = newPending
      return newPending
    })
    
    // Clear input
    setInputCount('')
    
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set new debounced timer to sync with database
    const timer = setTimeout(() => {
      // Send the total pending count that has accumulated
      const totalPending = getTotalPendingCount()
      syncWithDatabase(totalPending)
      pendingCountRef.current = 0
      setPendingCount(0)
    }, 1000) // 1 second debounce
    
    setDebounceTimer(timer)
  }

  const incrementCount = useCallback(async (increment: number) => {
    const newCount = todayCount + increment
    
    // Update UI instantly
    setTodayCount(newCount)
    setPendingCount(prev => {
      const newPending = prev + increment
      pendingCountRef.current = newPending
      return newPending
    })
    
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set new debounced timer
    const timer = setTimeout(() => {
      // Send the total pending count that has accumulated
      const totalPending = getTotalPendingCount()
      syncWithDatabase(totalPending)
      pendingCountRef.current = 0
      setPendingCount(0)
    }, 250) // 1 second debounce
    
    setDebounceTimer(timer)
  }, [todayCount, debounceTimer, syncWithDatabase, getTotalPendingCount])

  const deleteEntry = async (dateString: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Delete the Durood count for this day? This cannot be undone.')
      if (!confirmed) return
    }

    try {
      const response = await fetch(`/api/durood?date=${dateString}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEntries() // Refresh entries
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetTodayCount = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    deleteEntry(today)
  }

  const getStats = () => {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const yearStart = startOfYear(today)
    
    const thisMonth = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= monthStart
    }).reduce((sum, entry) => sum + entry.count, 0)
    
    const thisYear = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= yearStart
    }).reduce((sum, entry) => sum + entry.count, 0)
    
    return { thisMonth, thisYear }
  }

  const getTotalCount = () => {
    return entries.reduce((sum, entry) => sum + entry.count, 0)
  }

  const getCurrentStreak = () => {
    if (entries.length === 0) return 0
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let streak = 0
    let currentDate = new Date()
    
    // Check if today has an entry
    const today = format(currentDate, 'yyyy-MM-dd')
    const todayEntry = sortedEntries.find(entry => entry.date === today)
    
    if (todayEntry && todayEntry.count > 0) {
      streak = 1
      currentDate = subDays(currentDate, 1) // Move to yesterday
    }
    
    // Count consecutive days backwards
    for (let i = 0; i < 365; i++) { // Limit to 1 year to prevent infinite loop
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      const entry = sortedEntries.find(e => e.date === dateStr)
      
      if (entry && entry.count > 0) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break // Streak broken
      }
    }
    
    return streak
  }

  const stats = getStats()

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // Note: Avoid blocking UI on "loading" to prevent stuck spinners in dev

  // Show landing page if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        {/* Islamic decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Islamic crescent icon */}
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-full"></div>
            </div>
            <h1 className="text-6xl font-bold text-gray-800 mb-4">Durood Tracker</h1>
            <p className="text-xl text-gray-600 mb-8">Track your daily Durood readings and compete with others</p>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 py-3 text-white font-medium transition-all duration-200 transform hover:scale-105">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-200">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">📊 Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Monitor your daily, monthly, and yearly Durood readings with detailed statistics
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">👥 Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-700">
                    {userCount !== null ? userCount.toLocaleString() : '...'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Registered users</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🌍 Community Total</CardTitle>
              </CardHeader>
              <CardContent>
                {publicTotalLoading ? (
                  <p className="text-center text-gray-600">Loading...</p>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-700">{(publicTotalLive ?? publicTotal ?? 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600 mt-1">Durood read by the community</div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🏆 Daily Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Compete with other users and see who leads in daily Durood recitation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Public Rankings + Community Total */}
          <PublicRankingsAndTotal />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Islamic decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with User Info */}
        <div className="text-center mb-8">
          {/* Islamic star icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white transform rotate-45"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Durood Tracker</h1>
          <p className="text-gray-600 mb-4">Track your daily Durood readings</p>
          
          {/* User Info and Navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Welcome,</span>
              <Badge variant="secondary" className="text-sm bg-emerald-100 text-emerald-800 border-emerald-200">
                {session.user.displayName || session.user.username}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Link href="/rankings">
                <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  View Rankings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Streak Display */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-sm bg-orange-50 text-orange-700 border-orange-200">
              🔥 Durood Streak: {getCurrentStreak()} days
            </Badge>
            {getCurrentStreak() > 0 && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                Keep it up!
              </Badge>
            )}
          </div>
        </div>

        {/* Tasbih-style Counter + Manual Entry */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Today&apos;s Reading</CardTitle>
            <CardDescription className='text-2xl text-center'>اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Counter */}
              <div className="lg:col-span-2">
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-white via-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="text-sm text-gray-600 mb-2">Tap to count</div>
                  <div className="text-6xl md:text-7xl font-extrabold text-emerald-700 drop-shadow-sm select-none">
                    {todayCount.toLocaleString()}
                  </div>
                  {/* {pendingCount > 0 && (
                    <div className="mt-2 text-sm text-emerald-600 font-medium">
                      +{pendingCount} pending sync
                    </div>
                  )} */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {[1,2,3,4,5,6,7,8,9,10,15,30,50,100].map((n) => (
                      <button
                        key={n}
                        onClick={() => incrementCount(n)}
                        className="px-3 py-1 rounded-full border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-sm transition"
                        disabled={isLoading}
                        aria-label={`Add ${n}`}
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => incrementCount(1)}
                      className="w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-3xl md:text-4xl font-bold shadow-lg active:scale-95 transition-transform"
                      disabled={isLoading}
                      aria-label="Add 1"
                    >
                      +1
                    </button>
                  </div>
                  {todayCount > 0 && (
                    <div className="mt-4 flex gap-2">
                      <Button onClick={resetTodayCount} variant="destructive" size="sm">
                        Reset Today
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual add */}
              <div className="lg:col-span-1">
                <div className="p-4 rounded-xl bg-white border border-emerald-100">
                  <Label htmlFor="durood-count">Add a specific number</Label>
                  <div className="mt-2 flex items-end gap-2">
                    <Input
                      id="durood-count"
                      type="number"
                      placeholder="Enter count"
                      value={inputCount}
                      onChange={(e) => setInputCount(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button onClick={addDurood} disabled={isLoading}>
                      Add
                    </Button>
                  </div>
                  {todayCount > 0 && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                      Today&apos;s total: <span className="font-semibold">{todayCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{todayCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.thisYear}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total All Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{getTotalCount()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar and Recent Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Select a date to view entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              {selectedDate && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  {(() => {
                    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
                    const entry = entries.find(e => e.date === selectedDateStr)
                    return (
                      <div className="flex items-center justify-between">
                        <p className="text-emerald-800">
                          <strong>{format(selectedDate, 'MMMM d, yyyy')}:</strong>
                          {entry ? ` ${entry.count} Durood` : ' No entries'}
                        </p>
                        {entry && (
                          <Button variant="destructive" size="sm" onClick={() => deleteEntry(selectedDateStr)}>
                            Delete Day
                          </Button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your latest Durood readings</CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No entries yet. Start by adding today&apos;s reading!</p>
              ) : (
                <div className="space-y-2">
                  {entries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          isSameDay(new Date(entry.date), new Date()) 
                            ? 'bg-emerald-100 border border-emerald-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </span>
                          {isSameDay(new Date(entry.date), new Date()) && (
                            <Badge variant="secondary" className="ml-2">Today</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-emerald-600">
                            {entry.count} Durood
                          </span>
                          <Button variant="destructive" size="sm" onClick={() => deleteEntry(entry.date)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PublicRankingsAndTotal() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState<number | null>(null)
  const [rankings, setRankings] = useState<{
    date: string
    rankings: { id: string; displayName: string | null; username: string; count: number; rank: number }[]
    total: number
    note?: string
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [totalRes, rankingsRes] = await Promise.all([
          fetch('/api/durood/total'),
          fetch('/api/rankings?limit=10')
        ])

        if (!totalRes.ok) throw new Error('Failed total')
        if (!rankingsRes.ok) throw new Error('Failed rankings')

        const totalJson = await totalRes.json()
        const rankingsJson = await rankingsRes.json()
        setTotal(totalJson.total ?? 0)
        setRankings(rankingsJson)
      } catch (e) {
        setError('Failed to load community stats')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Quran Verse: Surah Al-Ahzab (33:56) */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-center">Surah Al-Ahzab (33:56)</CardTitle>
          <CardDescription className="text-center">Sending salutations upon the Prophet ﷺ</CardDescription>
        </CardHeader>
        <CardContent>
          <div dir="rtl" className="text-right text-3xl md:text-4xl font-semibold text-gray-800 leading-relaxed">
            إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا
          </div>
          <div dir="rtl" className="mt-4 p-4 bg-white/70 border border-emerald-100 rounded-lg text-gray-800 text-lg text-center leading-relaxed">
            بیشک اللہ اور اس کے فرشتے نبی پر درود بھیجتے ہیں۔ اے ایمان والو! تم بھی ان پر درود و سلام بھیجا کرو۔
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Community Total Durood</CardTitle>
          <CardDescription className="text-center">Sum of all users&apos; recorded recitations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-700">{(total ?? 0).toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Durood read by all users</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Today&apos;s Top Rankings</CardTitle>
          <CardDescription className="text-center">
            See who&apos;s leading today&apos;s Durood recitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : !rankings || rankings.rankings.length === 0 ? (
            <div className="text-center text-gray-500">No rankings available</div>
          ) : (
            <div className="space-y-2">
              {rankings.rankings.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white border">
                  <div className="flex items-center gap-3">
                    <Badge>#{r.rank}</Badge>
                    <span className="font-medium">{r.displayName || r.username}</span>
                  </div>
                  <div className="text-emerald-700 font-semibold">{r.count.toLocaleString()}</div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link href="/rankings">
                  <Button variant="outline">View full rankings</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
