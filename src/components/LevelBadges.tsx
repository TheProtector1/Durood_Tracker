'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface UserLevel {
  level: number
  points: number
  title: string
  jumuahBadge: boolean
}

interface LevelBadgesProps {
  compact?: boolean
}

const LEVELS = [
  { level: 1, title: 'Bronze', points: 0, color: 'from-amber-600 to-amber-800', icon: '🥉' },
  { level: 2, title: 'Silver', points: 100, color: 'from-gray-400 to-gray-600', icon: '🥈' },
  { level: 3, title: 'Gold', points: 500, color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
  { level: 4, title: 'Diamond', points: 1000, color: 'from-cyan-400 to-cyan-600', icon: '💎' },
  { level: 5, title: 'Platinum', points: 2500, color: 'from-slate-300 to-slate-500', icon: '⚱️' }
]

export default function LevelBadges({ compact = false }: LevelBadgesProps) {
  const { data: session } = useSession()
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserLevel = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/level')
        if (response.ok) {
          const data = await response.json()
          setUserLevel(data)
        }
      } catch (error) {
        console.error('Error fetching user level:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserLevel()
  }, [session])

  if (!session?.user?.id) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md mx-auto"}>
        <CardContent className="p-4 text-center">
          <p className="text-gray-600 text-sm">Sign in to view your level progress!</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md mx-auto"}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading level...</p>
        </CardContent>
      </Card>
    )
  }

  const currentLevel = LEVELS.find(l => l.level === (userLevel?.level || 1)) || LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === (userLevel?.level || 1) + 1)
  const currentPoints = userLevel?.points || 0
  const pointsToNext = nextLevel ? nextLevel.points - currentPoints : 0
  const progressPercent = nextLevel
    ? ((currentPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100
    : 100

  if (compact) {
    return (
      <Card className="w-full bg-white shadow-lg border-0">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg font-bold text-gray-800">
            Achievement Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Level Display */}
          <div className="flex items-center justify-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentLevel.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
              {currentLevel.icon}
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-emerald-700">{currentLevel.title}</div>
              <div className="text-sm text-gray-600">Level {userLevel?.level || 1}</div>
            </div>
          </div>

          {/* Points Info */}
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-emerald-600">
              {currentPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>

          {/* Progress Bar */}
          {nextLevel && (
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <div className="text-xs text-gray-600 text-center">
                {pointsToNext.toLocaleString()} points to {nextLevel.title}
              </div>
            </div>
          )}

          {/* Special Badge */}
          {userLevel?.jumuahBadge && (
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1">
                🕌 Jumu&apos;ah Master
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🏆</span>
        </div>
        <CardTitle className="text-2xl">Achievement Levels</CardTitle>
        <CardDescription>
          Earn points by completing daily goals and prayers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r ${currentLevel.color} text-white shadow-xl`}>
            <span className="text-4xl">{currentLevel.icon}</span>
            <div>
              <h3 className="text-xl font-bold">{currentLevel.title}</h3>
              <p className="text-sm opacity-90">Level {userLevel?.level || 1}</p>
            </div>
          </div>

          {userLevel?.jumuahBadge && (
            <div className="mt-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm font-medium">
                🕌 Special Jumu&apos;ah Badge Earned!
              </Badge>
            </div>
          )}
        </div>

        {/* Points and Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Points</span>
            <span className="font-semibold text-emerald-700">{currentPoints.toLocaleString()}</span>
          </div>

          {nextLevel && (
            <>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Progress to {nextLevel.title}</span>
                <span className="font-semibold text-emerald-700">
                  {pointsToNext.toLocaleString()} points needed
                </span>
              </div>
            </>
          )}
        </div>

        {/* Level Progression Grid */}
        <div className="grid grid-cols-5 gap-3">
          {LEVELS.map((level) => {
            const isCurrent = level.level === (userLevel?.level || 1)
            const isCompleted = level.level < (userLevel?.level || 1)
            const isLocked = level.level > (userLevel?.level || 1)
            const isNext = level.level === (userLevel?.level || 1) + 1

            return (
              <div
                key={level.level}
                className={`relative p-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                  isCurrent
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg ring-2 ring-emerald-200'
                    : isCompleted
                    ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100'
                    : isNext
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 animate-pulse'
                    : isLocked
                    ? 'border-gray-300 bg-gray-50 opacity-60 hover:opacity-80'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className={`text-2xl mb-1 transition-all ${isLocked ? 'grayscale brightness-75' : ''}`}>
                  {isLocked ? '🔒' : level.icon}
                </div>
                <div className={`text-xs font-medium transition-colors ${
                  isCurrent ? 'text-emerald-700' :
                  isCompleted ? 'text-green-700' :
                  isNext ? 'text-yellow-700' :
                  'text-gray-600'
                }`}>
                  {level.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {level.points.toLocaleString()} pts
                </div>
                {isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
                {isNext && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white">
                    <div className="w-full h-full bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                )}
                {isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* How to Earn Points */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
          <h4 className="font-semibold text-emerald-800 mb-3">How to Earn Points</h4>
          <div className="space-y-2 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">📿</span>
              <span>+1 point for every 10 duroods recited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">🎯</span>
              <span>+50 bonus points for completing daily goal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">🕌</span>
              <span>+2 points per prayer completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">🕌</span>
              <span>+5 points for completing all 5 daily prayers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">⚡</span>
              <span>+20 points for completing goal timer session</span>
            </div>
          </div>
        </div>

        {/* Jumu'ah Special Badge Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            🕌 Special Jumu&apos;ah Badge
          </h4>
          <p className="text-sm text-yellow-700 mb-2">
            Earn this special badge by completing all 5 daily prayers on Friday!
          </p>
          {!userLevel?.jumuahBadge && (
            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
              Not yet earned
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
