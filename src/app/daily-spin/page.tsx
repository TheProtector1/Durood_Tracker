'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, RotateCcw, Sparkles, Trophy, Star, Gift } from 'lucide-react'
import { redirect } from 'next/navigation'

interface SpinData {
  spinsLeft: number
  lastSpinAt: string | null
  canSpin: boolean
  level: number
}

const rewards = [
  { type: 'points', value: 10, icon: '⭐', color: 'text-yellow-600' },
  { type: 'points', value: 25, icon: '⭐', color: 'text-yellow-600' },
  { type: 'points', value: 50, icon: '⭐', color: 'text-yellow-600' },
  { type: 'points', value: 100, icon: '⭐', color: 'text-yellow-600' },
  { type: 'achievement', value: 'Bonus Spin', icon: '🎰', color: 'text-blue-600' },
  { type: 'special', value: 'Mystery Box', icon: '🎁', color: 'text-purple-600' },
  { type: 'points', value: 75, icon: '⭐', color: 'text-yellow-600' },
  { type: 'points', value: 200, icon: '⭐', color: 'text-yellow-600' },
]

export default function DailySpinPage() {
  const { data: session, status } = useSession()
  const [spinData, setSpinData] = useState<SpinData | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastReward, setLastReward] = useState<{ type: string; value: string | number; icon: string; color: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
    if (status === 'authenticated') {
      fetchSpinData()
    }
  }, [status])

  const fetchSpinData = async () => {
    try {
      const response = await fetch('/api/daily-spin')
      if (response.ok) {
        const data = await response.json()
        setSpinData(data)
      }
    } catch (error) {
      console.error('Failed to fetch spin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSpin = async () => {
    if (!spinData?.canSpin || isSpinning) return

    setIsSpinning(true)
    setLastReward(null)

    // Simulate spinning animation
    const spins = 5 + Math.random() * 5 // 5-10 full rotations
    const finalRotation = rotation + (spins * 360) + Math.floor(Math.random() * 360)
    setRotation(finalRotation)

    // Wait for animation
    setTimeout(async () => {
      try {
        const response = await fetch('/api/daily-spin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spinsToUse: 1 }),
        })

        if (response.ok) {
          const data = await response.json()
          setSpinData(data)

          // Random reward for demo
          const randomReward = rewards[Math.floor(Math.random() * rewards.length)]
          setLastReward(randomReward)
        }
      } catch (error) {
        console.error('Failed to perform daily spin:', error)
      } finally {
        setIsSpinning(false)
      }
    }, 3000)
  }

  const resetSpin = () => {
    setRotation(0)
    setLastReward(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Spin Wheel</h1>
          <p className="text-gray-600">Spin daily to earn points and unlock achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Spin Wheel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Spin Wheel
                </div>
                <Badge variant={spinData?.canSpin ? "default" : "secondary"}>
                  {spinData?.spinsLeft || 0} spins left
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wheel */}
              <div className="relative w-64 h-64 mx-auto">
                <div
                  className="w-full h-full rounded-full border-8 border-emerald-200 relative overflow-hidden transition-transform duration-3000 ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    background: 'conic-gradient(from 0deg, #10b981, #059669, #047857, #065f46, #064e3b, #10b981)'
                  }}
                >
                  {/* Wheel segments */}
                  {rewards.map((reward, index) => {
                    const angle = (360 / rewards.length) * index
                    return (
                      <div
                        key={index}
                        className="absolute w-full h-full flex items-start justify-center"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: '50% 50%'
                        }}
                      >
                        <div className="text-white font-bold text-sm mt-4 transform -translate-x-1/2">
                          {reward.icon} {reward.value}
                        </div>
                      </div>
                    )
                  })}

                  {/* Center circle */}
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-emerald-600"></div>

                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 w-0 h-0 transform -translate-x-1/2 -translate-y-1"
                       style={{
                         borderLeft: '8px solid transparent',
                         borderRight: '8px solid transparent',
                         borderBottom: '20px solid #dc2626'
                       }}>
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="text-center">
                <Button
                  onClick={handleSpin}
                  disabled={!spinData?.canSpin || isSpinning}
                  size="lg"
                  className="px-8 py-3"
                >
                  {isSpinning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Spinning...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Spin Now
                    </>
                  )}
                </Button>

                {!spinData?.canSpin && (
                  <p className="text-sm text-gray-500 mt-2">
                    Come back tomorrow for more spins!
                  </p>
                )}
              </div>

              {/* Last Reward */}
              {lastReward && (
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl mb-2">{lastReward.icon}</div>
                  <div className="font-semibold text-emerald-800">
                    You won {lastReward.value} {lastReward.type === 'points' ? 'points!' : '!'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats & Info */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Today&apos;s Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spins Used:</span>
                    <span className="font-semibold">
                      {spinData ? 3 - (spinData.spinsLeft || 0) : 0}/3
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Spin:</span>
                    <span className="font-semibold">
                      {spinData?.lastSpinAt
                        ? new Date(spinData.lastSpinAt).toLocaleTimeString()
                        : 'Never'
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Level:</span>
                    <Badge variant="outline">{spinData?.level || 1}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Possible Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {rewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-lg">{reward.icon}</span>
                      <span className="text-sm font-medium">{reward.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Spin Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Get 3 free spins every day</li>
                  <li>• Higher level = better rewards</li>
                  <li>• Complete achievements for bonus spins</li>
                  <li>• Points help you level up faster</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
