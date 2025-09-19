'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'

interface DailySpinWheelProps {
  currentCount?: number
  onGoalSelected?: (goal: number) => void
  onDuroodIncrement?: () => void
}

export default function DailySpinWheel({ currentCount = 0, onGoalSelected, onDuroodIncrement }: DailySpinWheelProps) {
  const { data: session } = useSession()
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null)
  const [showGoalSelector, setShowGoalSelector] = useState(false)
  const [customGoal, setCustomGoal] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Local goal progress counter (isolated from main counter)
  const [goalProgress, setGoalProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Goal options
  const goals = [
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 200, label: '200' }
  ]

  // Check if user has already set today's goal
  useEffect(() => {
    const checkTodayGoal = async () => {
      if (!session?.user?.id) {
        setShowGoalSelector(false) // Hide goal selector if not authenticated
        return
      }

      // Show goal selector to let user choose
      setShowGoalSelector(true)
    }

    checkTodayGoal()
  }, [session])

  // Calculate progress percentage based on local goal progress
  const progressPercentage = selectedGoal ? Math.min((goalProgress / selectedGoal) * 100, 100) : 0

  // Check for goal completion when local progress changes
  useEffect(() => {
    if (selectedGoal && goalProgress >= selectedGoal && !isCompleted) {
      setIsCompleted(true)
    }
  }, [goalProgress, selectedGoal, isCompleted])

  const selectGoal = async (goal: number) => {
    if (!session?.user?.id) return

    setIsLoading(true)

    try {
      // Just set the goal locally - no API call needed for basic functionality
      setSelectedGoal(goal)
      setShowGoalSelector(false)
      setCustomGoal('')
      onGoalSelected?.(goal)
    } catch (error) {
      console.error('Error setting goal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomGoal = () => {
    const goal = parseInt(customGoal)
    if (goal > 0 && goal <= 10000) { // Max 10,000 to prevent abuse
      selectGoal(goal)
    }
  }

  const resetGoal = () => {
    setSelectedGoal(null)
    setShowGoalSelector(true)
    setIsCompleted(false)
    setGoalProgress(0)
    setCustomGoal('')
  }

  const handleDuroodClick = () => {
    if (!selectedGoal) return

    if (!session?.user?.id) {
      alert('Please sign in to add durood')
      return
    }

    // Increment local goal progress (isolated from main counter)
    setGoalProgress(prev => prev + 1)
  }

  const handleSubmitGoal = async () => {
    if (!selectedGoal || goalProgress < selectedGoal || !session?.user?.id) return

    setIsSubmitting(true)

    const today = new Date().toISOString().split('T')[0]

    try {
      const response = await fetch('/api/durood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, count: selectedGoal }),
      })

      if (response.ok) {
        setGoalProgress(0)
        setIsCompleted(false)
        setShowGoalSelector(true)
        setSelectedGoal(null)
        onDuroodIncrement?.()
        alert(`✅ Goal submitted! Added ${selectedGoal} duroods to your main counter!`)
      } else {
        const errorText = await response.text()
        alert(`❌ Error submitting goal: ${errorText}`)
      }
    } catch (error) {
      alert(`💥 Error submitting goal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-lg border-0">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-bold text-gray-800">
          Today&apos;s Durood Goal
        </CardTitle>
        <CardDescription className="text-gray-600">
          Set your target and track progress
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Goal Progress Display */}
        {selectedGoal && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {goalProgress}
            </div>
            <div className="text-sm text-gray-600">Goal Progress</div>
          </div>
        )}

        {/* Goal Selector */}
        {showGoalSelector && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-3">Choose Your Goal</h3>

              {/* Preset Goals */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {goals.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => selectGoal(goal.value)}
                    disabled={isLoading}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 text-center disabled:opacity-50"
                  >
                    <div className="font-bold text-lg text-emerald-700">
                      {goal.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Goal */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Or set custom goal:</div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter goal..."
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className="text-center"
                    min="1"
                    max="10000"
                  />
                  <Button
                    onClick={handleCustomGoal}
                    disabled={!customGoal || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Circle */}
        {selectedGoal && !showGoalSelector && (
          <div className="flex flex-col items-center space-y-4">
            {/* Circular Progress */}
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-500 ease-out"
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-emerald-700">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {goalProgress}/{selectedGoal}
                </div>
              </div>
            </div>

            {/* Add Durood Button */}
            <Button
              onClick={handleDuroodClick}
              disabled={!session?.user?.id || isCompleted}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleted
                ? '🎉 Goal Completed!'
                : session?.user?.id
                  ? '➕ Add Durood'
                  : '🔒 Sign in to add durood'
              }
            </Button>

            {/* Completion Status */}
            {isCompleted && (
              <div className="space-y-3 w-full">
                <Badge className="bg-green-500 text-white px-4 py-2 text-sm w-full justify-center">
                  🎉 Goal Completed! +50 Points
                </Badge>
                <Button
                  onClick={handleSubmitGoal}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 text-sm shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? 'Submitting...' : `📤 Submit ${selectedGoal} Duroods`}
                </Button>
              </div>
            )}

            {/* Change Goal */}
            <Button
              onClick={resetGoal}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Change Goal
            </Button>
          </div>
        )}

        {/* Info */}
        {!session?.user?.id ? (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Please sign in to set goals
            </p>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500">
            <p>Set your goal and track your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}