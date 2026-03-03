/**
 * Disciplex Notification System
 * Handles Weekly Reckoning and Milestone notifications
 *
 * Reference: disciplex.md Section 9 - Retention Strategy
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Constants } from 'expo-constants';

// Check if running in Expo Go (limited notification support)
const IS_EXPO_GO = !!Constants.expoConfig;

// Notification channel IDs (Android)
const RECKONING_CHANNEL_ID = 'weekly-reckoning';
const MILESTONE_CHANNEL_ID = 'milestones';

// Notification identifiers
const RECKONING_NOTIFICATION_ID = 'weekly-reckoning';
const MILESTONE_7DAY_NOTIFICATION_ID = 'milestone-7day';

/**
 * Configure notification channels and behavior
 * Call this on app start
 */
export async function configureNotifications(): Promise<void> {
  // Skip full setup in Expo Go (limited support)
  if (IS_EXPO_GO) {
    console.log('Notifications: Running in Expo Go with limited functionality');
    return;
  }

  // Set notification handler to show notifications even when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    // Weekly Reckoning Channel - High priority
    await Notifications.setNotificationChannelAsync(RECKONING_CHANNEL_ID, {
      name: 'Weekly Reckoning',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C', // Gold
      sound: 'default',
      description: 'Your weekly AI verdict notification',
    });

    // Milestone Channel - Medium priority
    await Notifications.setNotificationChannelAsync(MILESTONE_CHANNEL_ID, {
      name: 'Milestones',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#2A7A4B', // Success green
      sound: 'default',
      description: '7-day streak and other milestone notifications',
    });
  }
}

/**
 * Request notification permissions from user
 * Returns true if granted, false if denied
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync({
      android: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: false,
        allowCriticalAlerts: true,
        allowAnnouncements: false,
      },
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowDisplayInCarPlay: true,
        allowCriticalAlerts: true,
      },
    });

    return status === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
}

/**
 * Schedule the Weekly Reckoning notification
 * Fires every Sunday at the specified time
 * @param time - Time in HH:MM format (e.g., "20:00")
 * @param weekNumber - Current week number for personalized copy
 */
export async function scheduleWeeklyReckoning(
  time: string,
  weekNumber: number,
  estimatedScore?: number,
): Promise<string | null> {
  try {
    // Cancel any existing reckoning notification
    await Notifications.cancelScheduledNotificationAsync(RECKONING_NOTIFICATION_ID);

    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time format:', time);
      return null;
    }

    // Calculate next Sunday at the specified time
    const triggerDate = getNextSundayAtTime(hours, minutes);

    // Build notification content
    const scoreText = estimatedScore != null ? `Score: ${Math.round(estimatedScore)}.` : '';
    const content = `Your Week ${weekNumber} Reckoning is ready. ${scoreText}`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: RECKONING_NOTIFICATION_ID,
      content: {
        title: 'Weekly Reckoning',
        body: content,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'reckoning',
          weekNumber,
          screen: 'insights',
        },
        ...(Platform.OS === 'android' && {
          channelId: RECKONING_CHANNEL_ID,
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate.getTime(),
        channelId: Platform.OS === 'android' ? RECKONING_CHANNEL_ID : undefined,
      },
    });

    console.log('Weekly Reckoning scheduled:', notificationId, 'for', triggerDate);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule weekly reckoning:', error);
    return null;
  }
}

/**
 * Cancel the Weekly Reckoning notification
 */
export async function cancelWeeklyReckoning(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(RECKONING_NOTIFICATION_ID);
    console.log('Weekly Reckoning notification cancelled');
  } catch (error) {
    console.error('Failed to cancel weekly reckoning:', error);
  }
}

/**
 * Schedule the 7-day milestone notification
 * Fires once when user hits 7 days of data
 */
export async function schedule7DayMilestone(): Promise<string | null> {
  try {
    // Cancel any existing milestone notification
    await Notifications.cancelScheduledNotificationAsync(MILESTONE_7DAY_NOTIFICATION_ID);

    // Fire in 2 hours from now (gives time for reflection)
    const triggerDate = new Date();
    triggerDate.setHours(triggerDate.getHours() + 2);

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: MILESTONE_7DAY_NOTIFICATION_ID,
      content: {
        title: '7 Days of Data',
        body: '7 days of data. Your Reckoning is building.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'milestone',
          milestone: '7day',
          screen: 'insights',
        },
        ...(Platform.OS === 'android' && {
          channelId: MILESTONE_CHANNEL_ID,
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate.getTime(),
      },
    });

    console.log('7-day milestone scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule 7-day milestone:', error);
    return null;
  }
}

/**
 * Cancel the 7-day milestone notification
 */
export async function cancel7DayMilestone(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(MILESTONE_7DAY_NOTIFICATION_ID);
    console.log('7-day milestone notification cancelled');
  } catch (error) {
    console.error('Failed to cancel 7-day milestone:', error);
  }
}

/**
 * Send an immediate notification (for testing or instant feedback)
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data,
        ...(Platform.OS === 'android' && {
          channelId: RECKONING_CHANNEL_ID,
        }),
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Failed to send immediate notification:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
}

/**
 * Helper: Calculate next Sunday at specified time
 */
function getNextSundayAtTime(hours: number, minutes: number): Date {
  const now = new Date();
  const result = new Date(now);
  
  // Set the time
  result.setHours(hours, minutes, 0, 0);
  
  // Calculate days until Sunday (Sunday = 0)
  const daysUntilSunday = (7 - now.getDay()) % 7;
  
  // If today is Sunday and time has passed, schedule for next Sunday
  if (daysUntilSunday === 0 && result.getTime() <= now.getTime()) {
    result.setDate(result.getDate() + 7);
  } else {
    result.setDate(result.getDate() + daysUntilSunday);
  }
  
  return result;
}

/**
 * Helper: Calculate week number since user started
 */
export function calculateWeekNumber(startDate: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Helper: Check if user has 7 consecutive days of data
 */
export function hasSevenDayMilestone(scoreHistory: Array<{ date: string; score: number }>): boolean {
  if (scoreHistory.length < 7) return false;
  
  // Check last 7 days have data
  const last7Dates = new Set<string>();
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Dates.add(d.toISOString().split('T')[0]);
  }
  
  const historyDates = new Set(scoreHistory.map((s) => s.date));
  
  // Check if all last 7 dates have at least one score entry
  for (const date of last7Dates) {
    if (!historyDates.has(date)) {
      return false;
    }
  }
  
  return true;
}
