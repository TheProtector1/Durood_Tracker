'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Clock, Play, Pause, Square, Target, Zap, Trophy, Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function TimerPage() {
  const { data: session, status } = useSession()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [duroodCount, setDuroodCount] = useState(0)
  const [targetTime, setTargetTime] = useState(30) // minutes
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      handleComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const startTimer = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/timer/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ focusMode }),
      })

      if (response.ok) {
        setTimeLeft(targetTime * 60)
        setIsRunning(true)
        setDuroodCount(0)
      }
    } catch (error) {
      console.error('Failed to start timer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/timer/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duroodCount }),
      })

      if (response.ok) {
        setIsRunning(false)
        setTimeLeft(0)
        alert('Timer completed! Points awarded for your focus session.')
      }
    } catch (error) {
      console.error('Failed to complete timer:', error)
    } finally {
      setLoading(false)
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(targetTime * 60)
    setDuroodCount(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = targetTime > 0 ? ((targetTime * 60 - timeLeft) / (targetTime * 60)) * 100 : 0

  if (status === 'loading') {
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Focused Durood Timer</h1>
          <p className="text-gray-600">Dedicate focused time for your spiritual practice</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Display */}
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-emerald-600 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={progress} className="w-full" />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {!isRunning && timeLeft === 0 && (
                  <Button onClick={startTimer} disabled={loading} size="lg">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start
                  </Button>
                )}

                {isRunning && (
                  <Button onClick={pauseTimer} variant="outline" size="lg">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}

                {!isRunning && timeLeft > 0 && (
                  <>
                    <Button onClick={() => setIsRunning(true)} size="lg">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="lg">
                      <Square className="h-4 w-4" />
                      Reset
                    </Button>
                  </>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-mode" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Focus Mode (2x Points)
                  </Label>
                  <Switch
                    id="focus-mode"
                    checked={focusMode}
                    onCheckedChange={setFocusMode}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Duration:
                  </Label>
                  <select
                    value={targetTime}
                    onChange={(e) => setTargetTime(Number(e.target.value))}
                    disabled={isRunning}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value={5}>5 min</option>
                    <option value={10}>10 min</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Session Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Durood Counter */}
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {duroodCount}
                </div>
                <p className="text-gray-600">Durood Recited</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    onClick={() => setDuroodCount(Math.max(0, duroodCount - 1))}
                    variant="outline"
                    size="sm"
                    disabled={!isRunning}
                  >
                    -1
                  </Button>
                  <Button
                    onClick={() => setDuroodCount(duroodCount + 1)}
                    variant="outline"
                    size="sm"
                    disabled={!isRunning}
                  >
                    +1
                  </Button>
                </div>
              </div>

              {/* Session Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Session Time:</span>
                  <Badge variant="secondary">{formatTime(targetTime * 60 - timeLeft)}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Focus Mode:</span>
                  <Badge variant={focusMode ? "default" : "secondary"}>
                    {focusMode ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Points:</span>
                  <Badge variant="outline">
                    {Math.floor(duroodCount / 10) + (focusMode ? 50 : 0)}
                  </Badge>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-800 mb-2">Focus Tips</h3>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Find a quiet, comfortable place</li>
                  <li>• Focus on the meaning of the words</li>
                  <li>• Count each recitation carefully</li>
                  <li>• Use focus mode for deeper concentration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
