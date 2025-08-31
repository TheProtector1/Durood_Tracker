/**
 * Timezone utilities for Pakistan (PKT/PST)
 * Pakistan Standard Time is UTC+5 year-round
 */

const PAKISTAN_TIMEZONE = 'Asia/Karachi'
const PAKISTAN_OFFSET_HOURS = 5 // UTC+5

/**
 * Get current date in Pakistan timezone
 * @returns Date string in YYYY-MM-DD format for Pakistan timezone
 */
export function getPakistanDate(): string {
  // Create a date in Pakistan timezone
  const now = new Date()
  const pakistanTime = new Date(now.getTime() + (PAKISTAN_OFFSET_HOURS * 60 * 60 * 1000))

  const year = pakistanTime.getUTCFullYear()
  const month = String(pakistanTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(pakistanTime.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Get current date and time in Pakistan timezone
 * @returns Date object representing current time in Pakistan
 */
export function getPakistanDateTime(): Date {
  const now = new Date()
  return new Date(now.getTime() + (PAKISTAN_OFFSET_HOURS * 60 * 60 * 1000))
}

/**
 * Convert a UTC date to Pakistan timezone date string
 * @param utcDate - UTC date to convert
 * @returns Date string in YYYY-MM-DD format for Pakistan timezone
 */
export function convertUTCToPakistanDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  const pakistanTime = new Date(date.getTime() + (PAKISTAN_OFFSET_HOURS * 60 * 60 * 1000))

  const year = pakistanTime.getUTCFullYear()
  const month = String(pakistanTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(pakistanTime.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Check if it's a new day in Pakistan timezone
 * @param lastDate - Last recorded date (YYYY-MM-DD format)
 * @returns boolean indicating if it's a new day
 */
export function isNewDayInPakistan(lastDate: string): boolean {
  const currentPakistanDate = getPakistanDate()
  return currentPakistanDate !== lastDate
}

/**
 * Get the start of day in Pakistan timezone (midnight Pakistan time)
 * @returns Date object for midnight Pakistan time
 */
export function getPakistanDayStart(): Date {
  const now = new Date()
  const pakistanTime = new Date(now.getTime() + (PAKISTAN_OFFSET_HOURS * 60 * 60 * 1000))

  // Set to midnight Pakistan time
  pakistanTime.setUTCHours(0, 0, 0, 0)

  return pakistanTime
}

/**
 * Format date for display in Pakistan timezone
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatPakistanDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const pakistanTime = new Date(dateObj.getTime() + (PAKISTAN_OFFSET_HOURS * 60 * 60 * 1000))

  return pakistanTime.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: PAKISTAN_TIMEZONE
  })
}

/**
 * Get current time in Pakistan timezone
 * @returns Time string in HH:MM format for Pakistan timezone
 */
export function getPakistanTime(): string {
  const now = new Date()
  const pakistanTime = new Date(now.getTime() + (PAKISTAN_OFFSET_HOURS * 60 * 60 * 1000))

  const hours = String(pakistanTime.getUTCHours()).padStart(2, '0')
  const minutes = String(pakistanTime.getUTCMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}
