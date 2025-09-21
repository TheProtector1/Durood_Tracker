'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Lock, CheckCircle, Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string | null
  category: string
  requirement: number
  points: number
  rarity: string
  unlocked: boolean
  unlockedAt: string | null
}

export default function AchievementsPage() {
  const { data: session, status } = useSession()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated') {
      fetchAchievements()
    }
  }, [status])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'epic': return 'bg-purple-100 text-purple-800'
      case 'legendary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'durood': return '🤲'
      case 'prayers': return '🕌'
      case 'streak': return '🔥'
      case 'special': return '⭐'
      default: return '🏆'
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Achievements</h1>
          <p className="text-gray-600">Track your spiritual milestones and unlock rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">{unlockedCount}</div>
              <div className="text-gray-600">Achievements Unlocked</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-gray-600">Points Earned</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </div>
              <div className="text-gray-600">Completion Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-md'
                  : 'bg-white border-gray-200 opacity-75 hover:opacity-90'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl transition-all ${achievement.unlocked ? '' : 'grayscale brightness-75'}`}>
                      {achievement.unlocked ? achievement.icon || getCategoryIcon(achievement.category) : '🔒'}
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${achievement.unlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                        {achievement.name}
                      </CardTitle>
                      <Badge className={`${getRarityColor(achievement.rarity)} ${achievement.unlocked ? '' : 'opacity-60'}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">Unlocked</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Lock className="h-5 w-5 text-gray-400" />
                      <span className="text-xs text-gray-500">Locked</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className={`mb-4 ${achievement.unlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={achievement.unlocked ? 'text-gray-600' : 'text-gray-500'}>Requirement:</span>
                    <span className="font-semibold">{achievement.requirement}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className={achievement.unlocked ? 'text-gray-600' : 'text-gray-500'}>Reward:</span>
                    <span className="font-semibold text-emerald-600">
                      {achievement.points} points
                    </span>
                  </div>

                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      🎉 Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}

                  {!achievement.unlocked && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      🔒 Complete the requirement to unlock
                    </div>
                  )}
                </div>

                {/* Progress indicator for locked achievements */}
                {!achievement.unlocked && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>0 / {achievement.requirement}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-400 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {achievements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Achievements Yet</h3>
              <p className="text-gray-500">
                Start your spiritual journey to unlock achievements and earn points!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
