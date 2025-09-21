/**
 * Daily Reminder Service
 * Handles sending daily durood recitation reminders to users
 */

import { PrismaClient } from '@prisma/client';
import { sendDailyReminderEmail } from './email';

const prisma = new PrismaClient();


// Interface for reminder data
interface UserReminderData {
  userId: string;
  email: string;
  username: string;
  displayName: string | null;
}

// Get users who should receive daily reminders
async function getUsersForReminders(): Promise<UserReminderData[]> {
  try {
    // Get all verified users (you might want to add a preference setting later)
    const users = await prisma.user.findMany({
      where: {
        emailVerified: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true
      }
    });

    // Filter users to only include those with valid emails
    const validUsers = users.filter(user => user.email && user.email.trim() !== '');

    return validUsers.map(user => ({
      userId: user.id,
      email: user.email!,
      username: user.username,
      displayName: user.displayName
    }));
  } catch (error) {
    console.error('Error fetching users for reminders:', error);
    return [];
  }
}

// Get user's durood statistics
async function getUserDuroodStats(userId: string, date: Date) {
  try {
    // Format date as YYYY-MM-DD string for database queries
    const dateString = date.toISOString().split('T')[0];

    // Today's count - since dates are stored as strings, we can use direct equality
    const todayCount = await prisma.duroodEntry.aggregate({
      where: {
        userId,
        date: dateString
      },
      _sum: {
        count: true
      }
    });

    // Week count (last 7 days)
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartString = weekStart.toISOString().split('T')[0];

    const weekCount = await prisma.duroodEntry.aggregate({
      where: {
        userId,
        date: {
          gte: weekStartString,
          lte: dateString
        }
      },
      _sum: {
        count: true
      }
    });

    // Month count (last 30 days)
    const monthStart = new Date(date);
    monthStart.setDate(monthStart.getDate() - 30);
    const monthStartString = monthStart.toISOString().split('T')[0];

    const monthCount = await prisma.duroodEntry.aggregate({
      where: {
        userId,
        date: {
          gte: monthStartString,
          lte: dateString
        }
      },
      _sum: {
        count: true
      }
    });

    // Total count
    const totalCount = await prisma.duroodEntry.aggregate({
      where: {
        userId
      },
      _sum: {
        count: true
      }
    });

    return {
      todayCount: todayCount._sum.count || 0,
      weekCount: weekCount._sum.count || 0,
      monthCount: monthCount._sum.count || 0,
      totalCount: totalCount._sum.count || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      todayCount: 0,
      weekCount: 0,
      monthCount: 0,
      totalCount: 0
    };
  }
}

// Format date in Arabic
function formatDateArabic(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return date.toLocaleDateString('ar-SA', options);
}

// Send reminder to a single user
async function sendUserReminder(userData: UserReminderData): Promise<boolean> {
  try {
    const today = new Date();
    const stats = await getUserDuroodStats(userData.userId, today);

    const reminderData = {
      userName: userData.displayName || userData.username,
      currentDate: formatDateArabic(today),
      todayCount: Number(stats.todayCount) || 0,
      weekCount: Number(stats.weekCount) || 0,
      monthCount: Number(stats.monthCount) || 0,
      totalCount: Number(stats.totalCount) || 0,
      appLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/`,
      statsLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile`
    };

    await sendDailyReminderEmail(userData.email, reminderData);

    console.log(`✅ Daily reminder sent to ${userData.email} (${userData.username})`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send reminder to ${userData.email}:`, error);
    return false;
  }
}

// Send daily reminders to all eligible users
export async function sendDailyReminders(): Promise<{ success: number; failed: number; total: number }> {
  console.log('🔔 Starting daily reminder process...');

  const startTime = Date.now();
  let successCount = 0;
  let failedCount = 0;

  try {
    // Get all users eligible for reminders
    const users = await getUsersForReminders();
    console.log(`📧 Found ${users.length} users eligible for reminders`);

    if (users.length === 0) {
      console.log('⚠️  No users found for reminders');
      return { success: 0, failed: 0, total: 0 };
    }

    // Send reminders to each user
    const promises = users.map(user => sendUserReminder(user));

    // Wait for all reminders to be sent
    const results = await Promise.allSettled(promises);

    // Count results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      } else {
        failedCount++;
        console.error(`Failed to send reminder to user ${index + 1}`);
      }
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Daily reminders completed in ${duration.toFixed(2)}s`);
    console.log(`📊 Results: ${successCount} successful, ${failedCount} failed, ${users.length} total`);

    return {
      success: successCount,
      failed: failedCount,
      total: users.length
    };

  } catch (error) {
    console.error('❌ Daily reminder process failed:', error);
    return {
      success: successCount,
      failed: failedCount,
      total: 0
    };
  }
}

// Check if it's the right time to send reminders (4 hours before end of day)
export function shouldSendDailyReminders(): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  // Send at 8 PM (20:00) which is 4 hours before midnight
  return currentHour === 20;
}

// Main function to be called by cron job
export async function processDailyReminders(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🔔 DAILY REMINDER SYSTEM');
  console.log('='.repeat(60));

  const result = await sendDailyReminders();

  console.log('='.repeat(60));
  if (result.success > 0) {
    console.log('🎉 DAILY REMINDERS SENT SUCCESSFULLY');
    console.log(`   ✅ Successful: ${result.success}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    console.log(`   📊 Total: ${result.total}`);
  } else {
    console.log('⚠️  NO REMINDERS SENT');
    if (result.total === 0) {
      console.log('   No eligible users found');
    }
  }
  console.log('='.repeat(60));
}

// Get reminder statistics for monitoring
export async function getReminderStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  todayReminders: number;
  weeklyReminders: number;
  monthlyReminders: number;
}> {
  try {
    // Get total verified users
    const totalUsers = await prisma.user.count({
      where: { emailVerified: true }
    });

    // Get active users (users with durood entries in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.user.count({
      where: {
        emailVerified: true,
        duroodEntries: {
          some: {
            date: {
              gte: thirtyDaysAgo.toISOString().split('T')[0]
            }
          }
        }
      }
    });

    // Get today's reminders count (users who should receive reminders today)
    const todayReminders = totalUsers; // All verified users get reminders

    // Get weekly activity (users with entries in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyReminders = await prisma.user.count({
      where: {
        emailVerified: true,
        duroodEntries: {
          some: {
            date: {
              gte: sevenDaysAgo.toISOString().split('T')[0]
            }
          }
        }
      }
    });

    // Monthly activity (already calculated as activeUsers)
    const monthlyReminders = activeUsers;

    return {
      totalUsers,
      activeUsers,
      todayReminders,
      weeklyReminders,
      monthlyReminders
    };
  } catch (error) {
    console.error('Error getting reminder stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      todayReminders: 0,
      weeklyReminders: 0,
      monthlyReminders: 0
    };
  }
}

// Export for testing
export { getUsersForReminders, getUserDuroodStats, sendUserReminder };