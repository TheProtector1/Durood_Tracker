'use client'

import { useState, useEffect } from 'react'
import { getCurrentUTC, getPakistanDate, getPakistanTime, getPakistanDateTime } from '@/lib/timezone'

interface TimezoneDisplayProps {
  variant?: 'compact' | 'full'
  className?: string
}

export default function TimezoneDisplay({ variant = 'compact', className = '' }: TimezoneDisplayProps) {
  const [pakistanTime, setPakistanTime] = useState('')
  const [pakistanDate, setPakistanDate] = useState('')
  const [isDayTime, setIsDayTime] = useState(true)
  const [weekday, setWeekday] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      // Get current UTC time and convert to Pakistan timezone for display
      const now = getCurrentUTC()
      const time = getPakistanTime()
      const date = getPakistanDate(now)
      const dateTime = getPakistanDateTime(now)

      setPakistanTime(time)
      setPakistanDate(date)

      // Determine if it's daytime (6 AM to 6 PM Pakistan time)
      const hour = dateTime.getHours()
      setIsDayTime(hour >= 6 && hour < 18)

      // Get detailed date information in Pakistan timezone
      const weekdayName = dateTime.toLocaleDateString('en-US', { weekday: 'long' })
      const monthName = dateTime.toLocaleDateString('en-US', { month: 'short' })
      const dayNumber = dateTime.getDate()

      setWeekday(weekdayName)
      setMonth(monthName)
      setDay(dayNumber)
    }

    updateTime()
    // Update every second for real-time clock
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-400 hover:shadow-2xl transition-all duration-300 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🇵🇰</span>
            <div className="text-left">
              <div className="font-bold text-sm leading-tight">Pakistan</div>
              <div className="text-xs opacity-90">PKT (UTC+5)</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-mono font-bold">
              {pakistanTime}
            </div>
            <div className="text-xs opacity-90">
              {weekday}, {month} {day}
            </div>
          </div>

          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            isDayTime
              ? 'bg-yellow-400/20 text-yellow-100'
              : 'bg-blue-400/20 text-blue-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isDayTime ? 'bg-yellow-300' : 'bg-blue-300'} animate-pulse`} />
            <span className="text-xs font-medium">
              {isDayTime ? '☀️' : '🌙'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 rounded-2xl shadow-2xl border border-emerald-400 hover:shadow-3xl transition-all duration-300 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-3xl">🇵🇰</span>
          <div>
            <div className="font-bold text-xl">Pakistan Time</div>
            <div className="text-sm opacity-90">Live Clock</div>
          </div>
        </div>

        <div className="text-5xl font-mono font-bold mb-2 drop-shadow-lg">
          {pakistanTime}
        </div>

        <div className="text-lg font-semibold mb-1 opacity-95">
          {weekday}, {month} {day}
        </div>

        <div className="text-sm opacity-85 mb-4">
          {pakistanDate}
        </div>

        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            isDayTime
              ? 'bg-yellow-400/20 text-yellow-100'
              : 'bg-blue-400/20 text-blue-100'
          }`}>
            <div className={`w-3 h-3 rounded-full ${isDayTime ? 'bg-yellow-300' : 'bg-blue-300'} animate-pulse`} />
            <span className="text-sm font-medium">
              {isDayTime ? '☀️ Daylight Hours' : '🌙 Night Time'}
            </span>
          </div>
        </div>

        <div className="border-t border-white/20 pt-4">
          <div className="text-xs opacity-75 space-y-1">
            <div className="font-semibold">Pakistan Standard Time (PKT)</div>
            <div>UTC+5 • No Daylight Saving Time</div>
            <div className="text-emerald-200 font-medium">
              Used for all daily resets and counters
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
