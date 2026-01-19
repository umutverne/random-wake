import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Alarm } from '../types';
import { getNextAlarmDate } from '../utils/randomTime';
import i18n from '../i18n';

// Background task name for handling alarm notifications
export const BACKGROUND_ALARM_TASK = 'BACKGROUND_ALARM_TASK';

// Define background task for handling notifications
TaskManager.defineTask(BACKGROUND_ALARM_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  // This task runs when the app is in background and notification is received
  console.log('Background alarm task received:', data);
  return;
});

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.warn('Notifications require a physical device');
    return false;
  }

  // Skip push token registration in Expo Go (not supported since SDK 53)
  if (isExpoGo) {
    console.log('Running in Expo Go - push notifications limited');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 300, 500, 300, 500],
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      showBadge: true,
      enableLights: true,
      lightColor: '#FF0000',
    });
  }

  return true;
};

/**
 * Schedule an alarm notification
 */
export const scheduleAlarmNotification = async (
  alarm: Alarm
): Promise<string | null> => {
  const nextAlarmDate = getNextAlarmDate(alarm.startTime, alarm.endTime, alarm.repeatDays);

  if (!nextAlarmDate) {
    console.warn('Could not calculate next alarm date');
    return null;
  }

  // Cancel existing notifications for this alarm
  await cancelAlarmNotification(alarm.id);

  // Get notification text based on current language
  const notificationBody = alarm.label || i18n.t('ring.notificationBody');

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'RandomWake',
      body: notificationBody,
      data: {
        alarmId: alarm.id,
        type: 'alarm',
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'alarm',
      sticky: true,
      autoDismiss: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextAlarmDate,
      channelId: 'alarms',
    },
  });

  console.log(`Alarm scheduled for ${nextAlarmDate.toISOString()}, notification ID: ${notificationId}`);

  return notificationId;
};

/**
 * Schedule a pre-alarm notification (for gradual wake)
 */
export const schedulePreAlarmNotification = async (
  alarm: Alarm,
  minutesBefore: number
): Promise<string | null> => {
  const nextAlarmDate = getNextAlarmDate(alarm.startTime, alarm.endTime, alarm.repeatDays);

  if (!nextAlarmDate) {
    return null;
  }

  const preAlarmDate = new Date(nextAlarmDate.getTime() - minutesBefore * 60 * 1000);

  // Don't schedule if pre-alarm time has passed
  if (preAlarmDate <= new Date()) {
    return null;
  }

  const preAlarmBody = i18n.t('ring.preAlarm', { minutes: minutesBefore });

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'RandomWake',
      body: preAlarmBody,
      data: {
        alarmId: alarm.id,
        type: 'pre-alarm',
      },
      sound: false,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: preAlarmDate,
    },
  });

  return notificationId;
};

/**
 * Cancel alarm notification
 */
export const cancelAlarmNotification = async (alarmId: string): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    if (notification.content.data?.alarmId === alarmId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Add notification response listener
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Dismiss all notifications
 */
export const dismissAllNotifications = async (): Promise<void> => {
  await Notifications.dismissAllNotificationsAsync();
};
