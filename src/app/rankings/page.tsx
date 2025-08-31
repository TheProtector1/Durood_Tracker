'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { getPakistanDate } from '@/lib/timezone'
import TimezoneDisplay from '@/components/TimezoneDisplay'

interface Ranking {
  id: string
  date: string
  username: string
  displayName: string
  count: number
  rank: number
  streak: number
}

interface RankingsResponse {
  date: string
  rankings: Ranking[]
  total: number
  note?: string
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(getPakistanDate())

  useEffect(() => {
    fetchRankings(selectedDate)
  }, [selectedDate])

  const fetchRankings = async (date: string) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/rankings?date=${date}&limit=20`)
      if (!response.ok) {
        throw new Error('Failed to fetch rankings')
      }
      
      const data: RankingsResponse = await response.json()
      setRankings(data)
    } catch (error) {
      setError('Failed to load rankings')
      console.error('Error fetching rankings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
    return 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        {/* Islamic decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white transform rotate-45"></div>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading rankings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        {/* Islamic decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        {/* Timezone Display - Absolute Top Right Corner */}
        <div className="fixed top-4 right-4 z-50">
          <TimezoneDisplay variant="compact" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                  ← Back to Home
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  👤 Profile
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Rankings</h1>
            <p className="text-gray-600">Compete and track your progress</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">{error}</div>
            </CardContent>
          </Card>
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

      {/* Timezone Display - Absolute Top Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <TimezoneDisplay variant="compact" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with Timezone Display */}
        <div className="relative mb-8">
          {/* Main Header Content */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                  ← Back to Home
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  👤 Profile
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Daily Rankings</h1>
            <p className="text-gray-600">Top 20 Durood Reciters</p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-lg">🔥</span>
                <span className="text-gray-600">7+ day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">⚡</span>
                <span className="text-gray-600">3+ day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">✨</span>
                <span className="text-gray-600">1+ day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
              />
              <button
                onClick={() => setSelectedDate(getPakistanDate())}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
              >
                Today
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        {!rankings ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">No rankings available</div>
            </CardContent>
          </Card>
        ) : (
          <>
            {rankings.note && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">{rankings.note}</p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  Rankings for {format(new Date(rankings.date), 'MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {rankings.total} participants • Updated daily • 🔥 Streak tracking included
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rankings.rankings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No rankings available for this date
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rankings.rankings.map((ranking) => (
                      <div
                        key={ranking.id}
                        className={
                          ranking.rank <= 3
                            ? 'flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                            : 'flex items-center justify-between p-4 rounded-lg border bg-white'
                        }
                      >
                        <div className="flex items-center gap-4">
                          <Badge className={getRankBadgeColor(ranking.rank)}>
                            #{ranking.rank}
                          </Badge>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {ranking.displayName || ranking.username}
                            </h3>
                            <p className="text-sm text-gray-600">@{ranking.username}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <div className="text-2xl font-bold text-emerald-600">
                              {ranking.count.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Durood</div>
                          </div>

                          {/* Streak indicator */}
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <div className="text-lg">
                                {ranking.streak >= 7 ? '🔥' :
                                 ranking.streak >= 3 ? '⚡' :
                                 ranking.streak >= 1 ? '✨' : '📅'}
                              </div>
                              <div className="text-sm font-medium text-orange-600">
                                {ranking.streak}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {ranking.streak === 1 ? 'day' : 'days'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Streak Leaderboard */}
            {rankings.rankings.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔥 Streak Champions
                  </CardTitle>
                  <CardDescription>
                    Users with the longest current streaks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rankings.rankings
                      .filter(ranking => ranking.streak > 0)
                      .sort((a, b) => b.streak - a.streak)
                      .slice(0, 10)
                      .map((ranking, index) => (
                        <div
                          key={`streak-${ranking.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                              #{index + 1}
                            </Badge>
                            <div>
                              <h4 className="font-medium">
                                {ranking.displayName || ranking.username}
                              </h4>
                              <p className="text-sm text-gray-600">@{ranking.username}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <div className="text-xl">
                                {ranking.streak >= 30 ? '🏆' :
                                 ranking.streak >= 14 ? '🔥' :
                                 ranking.streak >= 7 ? '⚡' : '✨'}
                              </div>
                              <div className="text-lg font-bold text-orange-600">
                                {ranking.streak}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">day streak</div>
                          </div>
                        </div>
                      ))}

                    {rankings.rankings.filter(ranking => ranking.streak > 0).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No active streaks yet. Start your journey today! ✨
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Streak Milestones */}
            {rankings.rankings.length > 0 && rankings.rankings.some(r => r.streak >= 7) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏆 Streak Milestones
                  </CardTitle>
                  <CardDescription>
                    Congratulations to users who reached significant streak milestones!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { milestone: 100, label: 'Century Club', icon: '💯' },
                      { milestone: 50, label: 'Golden Streak', icon: '🥇' },
                      { milestone: 30, label: 'Month Master', icon: '🏆' },
                      { milestone: 14, label: 'Fortnight Hero', icon: '🔥' },
                      { milestone: 7, label: 'Week Warrior', icon: '⚡' }
                    ].map(({ milestone, label, icon }) => {
                      const achievers = rankings.rankings.filter(r => r.streak >= milestone)
                      if (achievers.length === 0) return null

                      return (
                        <div key={milestone} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="text-2xl mb-2">{icon}</div>
                          <div className="text-lg font-bold text-yellow-800">{milestone}+ days</div>
                          <div className="text-sm text-gray-600 mb-2">{label}</div>
                          <div className="text-xs text-gray-500">
                            {achievers.length} {achievers.length === 1 ? 'user' : 'users'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}