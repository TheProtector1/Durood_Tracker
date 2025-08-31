/**
 * Timezone utilities for Pakistan (Asia/Karachi)
 * Standard pattern: Store UTC timestamps, convert to Asia/Karachi for business logic and display
 */

const PAKISTAN_TIMEZONE = 'Asia/Karachi'

/**
 * Get current UTC date/time
 * @returns Current UTC Date object
 */
export function getCurrentUTC(): Date {
  return new Date()
}

/**
 * Convert UTC date to Pakistan timezone date string (YYYY-MM-DD)
 * @param utcDate - UTC date to convert
 * @returns Date string in YYYY-MM-DD format for Pakistan timezone
 */
export function getPakistanDate(utcDate?: Date): string {
  const date = utcDate || getCurrentUTC()

  // Use Intl.DateTimeFormat for proper timezone handling
  const pakistanFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PAKISTAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return pakistanFormatter.format(date)
}

/**
 * Get current date in Pakistan timezone (YYYY-MM-DD)
 * @returns Current date string in Pakistan timezone
 */
export function getCurrentPakistanDate(): string {
  return getPakistanDate()
}

/**
 * Get Pakistan timezone date and time
 * @param utcDate - UTC date to convert (defaults to current UTC)
 * @returns Date object representing time in Pakistan timezone
 */
export function getPakistanDateTime(utcDate?: Date): Date {
  const date = utcDate || getCurrentUTC()

  // Use Intl.DateTimeFormat to get components in Pakistan timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PAKISTAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const parts = formatter.formatToParts(date)
  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  const hour = parts.find(p => p.type === 'hour')?.value
  const minute = parts.find(p => p.type === 'minute')?.value
  const second = parts.find(p => p.type === 'second')?.value

  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
}

/**
 * Convert UTC timestamp to Pakistan timezone date string
 * @param utcDate - UTC date/timestamp to convert
 * @returns Date string in YYYY-MM-DD format for Pakistan timezone
 */
export function convertUTCToPakistanDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  return getPakistanDate(date)
}

/**
 * Check if it's a new day in Pakistan timezone
 * @param lastPakistanDate - Last recorded date in YYYY-MM-DD format (Pakistan timezone)
 * @returns boolean indicating if it's a new day
 */
export function isNewDayInPakistan(lastPakistanDate: string): boolean {
  const currentPakistanDate = getCurrentPakistanDate()
  return currentPakistanDate !== lastPakistanDate
}

/**
 * Get the start of day in Pakistan timezone (midnight Pakistan time)
 * @param utcDate - UTC date to get start of day for (defaults to current)
 * @returns UTC Date object representing midnight in Pakistan timezone
 */
export function getPakistanDayStart(utcDate?: Date): Date {
  const date = utcDate || getCurrentUTC()

  // Get Pakistan date components
  const pakistanDateStr = getPakistanDate(date)
  const [year, month, day] = pakistanDateStr.split('-').map(Number)

  // Create UTC date for Pakistan midnight
  // Pakistan midnight is 19:00 UTC the previous day (UTC-5)
  const utcMidnight = new Date(Date.UTC(year, month - 1, day))
  utcMidnight.setUTCHours(19, 0, 0, 0) // 19:00 UTC = 00:00 PKT

  return utcMidnight
}

/**
 * Format date for display in Pakistan timezone
 * @param utcDate - UTC date to format
 * @returns Formatted date string in Pakistan timezone
 */
export function formatPakistanDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate

  const formatter = new Intl.DateTimeFormat('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: PAKISTAN_TIMEZONE
  })

  return formatter.format(date)
}

/**
 * Get current time in Pakistan timezone
 * @returns Time string in HH:MM format for Pakistan timezone
 */
export function getPakistanTime(): string {
  const now = getCurrentUTC()

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PAKISTAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return formatter.format(now)
}

/**
 * Get Pakistan timezone date with time for a specific UTC date
 * @param utcDate - UTC date
 * @returns Formatted date and time string in Pakistan timezone
 */
export function formatPakistanDateTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate

  const formatter = new Intl.DateTimeFormat('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PAKISTAN_TIMEZONE
  })

  return formatter.format(date)
}

/**
 * Check if a UTC timestamp falls within a specific Pakistan date
 * @param utcDate - UTC timestamp to check
 * @param pakistanDate - Pakistan date in YYYY-MM-DD format
 * @returns boolean indicating if the UTC date falls on the Pakistan date
 */
export function isUTCDateOnPakistanDate(utcDate: Date | string, pakistanDate: string): boolean {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  const convertedDate = getPakistanDate(date)
  return convertedDate === pakistanDate
}

/**
 * Get the Pakistan date range for a given UTC date
 * @param utcDate - UTC date
 * @returns Object with start and end UTC dates for the Pakistan day
 */
export function getPakistanDateRange(utcDate: Date | string): { start: Date; end: Date } {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  const pakistanDateStr = getPakistanDate(date)
  const [year, month, day] = pakistanDateStr.split('-').map(Number)

  // Pakistan day starts at 19:00 UTC the previous day
  const start = new Date(Date.UTC(year, month - 1, day))
  start.setUTCHours(19, 0, 0, 0)

  // Pakistan day ends at 18:59:59.999 UTC the same day
  const end = new Date(Date.UTC(year, month - 1, day + 1))
  end.setUTCHours(18, 59, 59, 999)

  return { start, end }
}
