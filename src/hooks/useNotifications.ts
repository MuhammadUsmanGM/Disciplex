/**
 * useNotifications Hook
 * Manages notification permissions, scheduling, and milestone tracking
 */

import { useCallback, useEffect, useState } from 'react';

import {
    cancel7DayMilestone,
    cancelWeeklyReckoning,
    checkNotificationPermission,
    configureNotifications,
    hasSevenDayMilestone,
    requestNotificationPermission,
    schedule7DayMilestone,
    scheduleWeeklyReckoning
} from '@/src/lib/notifications';

interface UseNotificationsReturn {
  permissionGranted: boolean;
  loading: boolean;
  milestone7DayReached: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleReckoning: (time: string, estimatedScore?: number) => Promise<void>;
  cancelReckoning: () => Promise<void>;
  checkAndScheduleMilestone: (scoreHistory: Array<{ date: string; score: number }>) => Promise<void>;
  cancelMilestone: () => Promise<void>;
}

/**
 * Hook for managing all notification-related functionality
 */
export function useNotifications(): UseNotificationsReturn {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [milestone7DayReached, setMilestone7DayReached] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    const init = async () => {
      // Configure notification channels
      await configureNotifications();

      // Check permission status
      const hasPermission = await checkNotificationPermission();
      setPermissionGranted(hasPermission);
      setLoading(false);
    };

    init();
  }, []);

  /**
   * Request notification permission from user
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  /**
   * Schedule weekly reckoning notification
   */
  const scheduleReckoning = useCallback(
    async (time: string, estimatedScore?: number): Promise<void> => {
      // Check actual permission again to handle race conditions during toggle
      const hasPermission = await checkNotificationPermission();
      if (!hasPermission) {
        console.warn('Cannot schedule reckoning: permission not granted');
        return;
      }

      // Calculate week number from app start (using first score date as proxy)
      const weekNumber = 1; // TODO: Get from user data

      await scheduleWeeklyReckoning(time, weekNumber, estimatedScore);
    },
    [permissionGranted],
  );

  /**
   * Cancel weekly reckoning notification
   */
  const cancelReckoning = useCallback(async (): Promise<void> => {
    await cancelWeeklyReckoning();
  }, []);

  /**
   * Check if 7-day milestone is reached and schedule notification
   */
  const checkAndScheduleMilestone = useCallback(
    async (scoreHistory: Array<{ date: string; score: number }>): Promise<void> => {
      const hasPermission = await checkNotificationPermission();
      if (!hasPermission) {
        return;
      }

      const hasMilestone = hasSevenDayMilestone(scoreHistory);
      setMilestone7DayReached(hasMilestone);

      if (hasMilestone) {
        await schedule7DayMilestone();
      } else {
        await cancel7DayMilestone();
      }
    },
    [permissionGranted],
  );

  /**
   * Cancel 7-day milestone notification
   */
  const cancelMilestone = useCallback(async (): Promise<void> => {
    await cancel7DayMilestone();
    setMilestone7DayReached(false);
  }, []);

  return {
    permissionGranted,
    loading,
    milestone7DayReached,
    requestPermission,
    scheduleReckoning,
    cancelReckoning,
    checkAndScheduleMilestone,
    cancelMilestone,
  };
}
