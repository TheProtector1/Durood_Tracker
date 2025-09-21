import { NextRequest, NextResponse } from 'next/server'
import { sendDailyReminders, getReminderStats, shouldSendDailyReminders } from '@/lib/daily-reminder'

export async function GET(request: NextRequest) {
  try {
    // Get reminder statistics
    const stats = await getReminderStats()

    return NextResponse.json({
      success: true,
      stats,
      shouldSend: shouldSendDailyReminders()
    })
  } catch (error) {
    console.error('Get daily reminders stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get reminder statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'send') {
      // Check if it's the right time to send reminders
      if (!shouldSendDailyReminders()) {
        return NextResponse.json({
          success: false,
          message: 'Not the right time to send reminders (should be 8 PM)',
          shouldSend: false
        })
      }

      // Send daily reminders
      const result = await sendDailyReminders()

      return NextResponse.json({
        success: true,
        message: 'Daily reminders sent successfully',
        result
      })
    }

    if (action === 'stats') {
      // Get reminder statistics
      const stats = await getReminderStats()

      return NextResponse.json({
        success: true,
        stats
      })
    }

    if (action === 'force') {
      // Force send reminders regardless of time
      console.log('🚀 FORCE SENDING DAILY REMINDERS')
      const result = await sendDailyReminders()

      return NextResponse.json({
        success: true,
        message: 'Daily reminders sent successfully (forced)',
        result
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: send, stats, or force' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Send daily reminders error:', error)
    return NextResponse.json(
      { error: 'Failed to send daily reminders' },
      { status: 500 }
    )
  }
}
