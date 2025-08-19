'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface Ranking {
  id: string
  date: string
  username: string
  displayName: string
  count: number
  rank: number
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

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
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                ← Back to Home
              </Button>
            </Link>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Rankings</h1>
          <p className="text-gray-600">Top 20 Durood Reciters</p>
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
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
              >
                Today
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">{error}</div>
            </CardContent>
          </Card>
        ) : rankings ? (
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
                  {rankings.total} participants • Updated daily
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
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          ranking.rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-white'
                        }`}
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
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            {ranking.count.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Durood</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
