'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'

export default function PointsDisplay() {
  const { data: session } = useSession()
  const [points, setPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const loadPoints = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch('/api/user/points')
        if (response.ok) {
          const data = await response.json()
          setPoints(data.points || 0)
        }
      } catch (error) {
        console.error('Error loading points:', error)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPoints()

    // Refresh points every 5 seconds for better responsiveness
    const interval = setInterval(loadPoints, 5000)
    return () => clearInterval(interval)
  }, [session])

  // Also refresh when the component mounts or session changes
  useEffect(() => {
    if (session?.user?.id) {
      loadPoints()
    }
  }, [session])

  if (!session?.user?.id || loading) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Badge
        variant="secondary"
        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg px-4 py-2 text-sm font-semibold hover:scale-105 transition-transform"
      >
        <span className="mr-2">💎</span>
        {points.toLocaleString()} pts
      </Badge>
    </div>
  )
}
