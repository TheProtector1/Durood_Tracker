'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface GoalTimerProps {
  onComplete?: () => void
}

export default function GoalTimer({ onComplete }: GoalTimerProps) {
  const { data: session } = useSession()
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [])

  // Create soft tick sound
  const playTickSound = () => {
    if (!audioContextRef.current) return

    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + 0.2)
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1

          // Play tick sound every second in the last minute
          if (newTime <= 60 && newTime > 0) {
            playTickSound()
          }

          if (newTime <= 0) {
            handleTimerComplete()
            return 0
          }

          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setIsCompleted(true)

    // Play completion sound
    if (audioContextRef.current) {
      try {
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.frequency.setValueAtTime(523, audioContextRef.current.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContextRef.current.currentTime + 0.2) // E5
        oscillator.frequency.setValueAtTime(784, audioContextRef.current.currentTime + 0.4) // G5

        gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.8)

        oscillator.start(audioContextRef.current.currentTime)
        oscillator.stop(audioContextRef.current.currentTime + 0.8)
      } catch (error) {
        // Silently fail
      }
    }

    // Save completion to database
    if (session?.user?.id) {
      try {
        await fetch('/api/timer/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            duration: 300, // 5 minutes
            completedAt: new Date().toISOString()
          }),
        })
      } catch (error) {
        console.error('Error saving timer completion:', error)
      }
    }

    onComplete?.()
  }

  const startTimer = () => {
    setIsRunning(true)
    setIsCompleted(false)

    // Save timer start to database
    if (session?.user?.id) {
      fetch('/api/timer/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: 300,
          startedAt: new Date().toISOString()
        }),
      }).catch(error => {
        console.error('Error saving timer start:', error)
      })
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(300)
    setIsCompleted(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = ((300 - timeLeft) / 300) * 100

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <span className="text-xl">⏱️</span>
        </div>
        <CardTitle className="text-xl">Focus Recitation Timer</CardTitle>
        <CardDescription>
          Dedicate 5 minutes to focused durood recitation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className={`text-6xl font-mono font-bold mb-4 transition-colors ${
            timeLeft <= 60
              ? 'text-red-600'
              : timeLeft <= 120
              ? 'text-yellow-600'
              : 'text-emerald-600'
          }`}>
            {formatTime(timeLeft)}
          </div>

          <Progress value={progressPercent} className="h-3 mb-4" />

          <div className="flex justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              5:00 Total
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatTime(300 - timeLeft)} Elapsed
            </Badge>
          </div>
        </div>

        {/* Status Messages */}
        {isCompleted && (
          <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-semibold text-emerald-800 mb-2">Session Complete!</h3>
            <p className="text-emerald-700 text-sm mb-3">
              Great job! You've completed your 5-minute focus session.
            </p>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              +20 Points Earned
            </Badge>
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex flex-col gap-3">
          {!session?.user?.id ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-yellow-700 text-sm">
                Please sign in to use the focus timer and earn points.
              </p>
            </div>
          ) : isCompleted ? (
            <Button
              onClick={resetTimer}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Start New Session
            </Button>
          ) : isRunning ? (
            <div className="flex gap-2">
              <Button
                onClick={pauseTimer}
                variant="outline"
                className="flex-1"
              >
                ⏸️ Pause
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                🔄 Reset
              </Button>
            </div>
          ) : (
            <Button
              onClick={startTimer}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3"
              disabled={timeLeft === 0}
            >
              ▶️ Start Focus Session
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="text-center">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
            +20 Points for completing session
          </Badge>
        </div>

        {/* Audio Info */}
        <div className="text-center text-xs text-gray-500">
          <p>🔊 Soft tick sounds play in the final minute</p>
          <p>🎵 Completion chime when session ends</p>
        </div>
      </CardContent>
    </Card>
  )
}
