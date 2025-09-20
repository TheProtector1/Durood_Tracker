'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Reward {
  id: string
  name: string
  description: string
  cost: number
  category: 'digital' | 'physical' | 'spiritual'
  icon: string
  available: boolean
}

const REWARDS: Reward[] = [
  // Digital Rewards
  {
    id: 'custom_dua',
    name: 'Custom Dua Request',
    description: 'Request a personalized dua from our spiritual guide',
    cost: 500,
    category: 'spiritual',
    icon: '🤲',
    available: true
  },
  {
    id: 'premium_features',
    name: 'Premium Features (1 Month)',
    description: 'Access to advanced analytics and personalized insights',
    cost: 300,
    category: 'digital',
    icon: '⭐',
    available: true
  },
  {
    id: 'exclusive_content',
    name: 'Exclusive Islamic Content',
    description: 'Access to premium Islamic lectures and articles',
    cost: 200,
    category: 'digital',
    icon: '📚',
    available: true
  },

  // Physical Rewards
  {
    id: 'prayer_mat',
    name: 'Premium Prayer Mat',
    description: 'High-quality prayer mat with Islamic design',
    cost: 1500,
    category: 'physical',
    icon: '🕌',
    available: true
  },
  {
    id: 'quran_book',
    name: 'Beautiful Quran Copy',
    description: 'Hardcover Quran with translation and commentary',
    cost: 2000,
    category: 'physical',
    icon: '📖',
    available: true
  },
  {
    id: 'tasbih',
    name: 'Premium Tasbih',
    description: 'Handcrafted wooden tasbih with 99 beads',
    cost: 800,
    category: 'physical',
    icon: '📿',
    available: true
  },

  // Spiritual Rewards
  {
    id: 'dua_ceremony',
    name: 'Special Dua Ceremony',
    description: 'Join a special prayer session dedicated to you',
    cost: 1000,
    category: 'spiritual',
    icon: '🙏',
    available: true
  },
  {
    id: 'name_in_prayers',
    name: 'Name in Community Prayers',
    description: 'Your name will be mentioned in our weekly prayers',
    cost: 250,
    category: 'spiritual',
    icon: '✨',
    available: true
  }
]

export default function RewardsPage() {
  const { data: session } = useSession()
  const [userPoints, setUserPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)

  useEffect(() => {
    const loadPoints = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/points')
          if (response.ok) {
            const data = await response.json()
            setUserPoints(data.points || 0)
          }
        } catch (error) {
          console.error('Error loading points:', error)
        }
      }
      setLoading(false)
    }

    loadPoints()
  }, [session])

  const handleRedeem = async (reward: Reward) => {
    if (!session?.user?.id) return

    if (userPoints < reward.cost) {
      alert('You don\'t have enough points for this reward!')
      return
    }

    setRedeeming(reward.id)

    try {
      const response = await fetch('/api/user/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'redeem',
          rewardId: reward.id,
          rewardName: reward.name
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local points
        setUserPoints(data.points)

        alert(`🎉 Congratulations! You have successfully redeemed "${reward.name}"!\n\nOur team will contact you within 24-48 hours to arrange your reward.`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to redeem reward. Please try again.')
      }
    } catch (error) {
      console.error('Error redeeming reward:', error)
      alert('An error occurred while redeeming the reward. Please try again.')
    } finally {
      setRedeeming(null)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'digital': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'physical': return 'bg-green-100 text-green-800 border-green-200'
      case 'spiritual': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hover:bg-gray-50">
                  ← Back to Home
                </Button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🎁 Rewards Store</h1>
            <p className="text-gray-600">Sign in to redeem your hard-earned points!</p>
          </div>

          <Card className="text-center p-8">
            <CardContent>
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
              <p className="text-gray-600 mb-4">You need to be signed in to view and redeem rewards.</p>
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  Sign In to Continue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading rewards...</p>
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
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

          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎁 Rewards Store</h1>
          <p className="text-gray-600">Redeem your points for amazing rewards!</p>

          {/* Points Display */}
          <div className="mt-6">
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg inline-block">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💎</div>
                  <div>
                    <div className="text-2xl font-bold">{userPoints.toLocaleString()}</div>
                    <div className="text-sm text-emerald-100">Available Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How to Earn Points */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              💰 How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">📿</span>
                <div>
                  <div className="font-semibold">Durood Recitation</div>
                  <div className="text-sm text-gray-600">1 point per 10 duroods</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">🕌</span>
                <div>
                  <div className="font-semibold">Prayer Completion</div>
                  <div className="text-sm text-gray-600">25 points per prayer</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold">Daily Goals</div>
                  <div className="text-sm text-gray-600">50 bonus points</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="font-semibold">Timer Sessions</div>
                  <div className="text-sm text-gray-600">20 points per session</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-semibold">Achievements</div>
                  <div className="text-sm text-gray-600">Various point rewards</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <span className="text-2xl">🎰</span>
                <div>
                  <div className="font-semibold">Daily Spin</div>
                  <div className="text-sm text-gray-600">Bonus points</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards by Category */}
        {['spiritual', 'digital', 'physical'].map(category => {
          const categoryRewards = REWARDS.filter(reward => reward.category === category)
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1)

          return (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {category === 'spiritual' && '🙏'}
                {category === 'digital' && '💻'}
                {category === 'physical' && '📦'}
                {categoryName} Rewards
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryRewards.map(reward => {
                  const canAfford = userPoints >= reward.cost
                  const isRedeeming = redeeming === reward.id

                  return (
                    <Card key={reward.id} className={`relative overflow-hidden transition-all hover:shadow-lg ${
                      canAfford ? 'border-emerald-200 hover:border-emerald-300' : 'border-gray-200 opacity-75'
                    }`}>
                      <CardHeader className="text-center pb-3">
                        <div className="text-4xl mb-2">{reward.icon}</div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <Badge className={getCategoryColor(reward.category)}>
                            {categoryName}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <CardDescription className="text-center mb-4">
                          {reward.description}
                        </CardDescription>

                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-emerald-600">
                            {reward.cost.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">points</div>
                        </div>

                        <Button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canAfford || isRedeeming}
                          className={`w-full ${
                            canAfford
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {isRedeeming ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Redeeming...
                            </div>
                          ) : canAfford ? (
                            '🎁 Redeem Now'
                          ) : (
                            '💎 Not Enough Points'
                          )}
                        </Button>

                        {!canAfford && (
                          <div className="text-xs text-gray-500 text-center mt-2">
                            Need {Math.max(0, reward.cost - userPoints).toLocaleString()} more points
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Redemption Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              ℹ️ Redemption Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-700">
              <p>• <strong>Processing Time:</strong> Rewards are typically processed within 24-48 hours.</p>
              <p>• <strong>Contact:</strong> Our team will contact you via email to arrange delivery or access.</p>
              <p>• <strong>Digital Rewards:</strong> Access links will be sent via email.</p>
              <p>• <strong>Physical Rewards:</strong> Shipping information will be collected separately.</p>
              <p>• <strong>Spiritual Rewards:</strong> Special arrangements will be made for prayer sessions.</p>
              <p>• <strong>No Refunds:</strong> Points spent on rewards cannot be refunded.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
