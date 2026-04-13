// Vault — Local push notification service
// Notifications are delivered locally only. No data leaves the device.
// No external push notification services or analytics.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AnomalyAlert } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('anomaly-alerts', {
      name: 'Anomaly Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function sendAnomalyNotification(alert: AnomalyAlert): Promise<void> {
  const severityEmoji =
    alert.severity === 'high' ? '' :
    alert.severity === 'medium' ? '' : '';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${severityEmoji} Vault Alert`,
      body: alert.message,
      data: { alertId: alert.id, type: alert.type },
      sound: true,
    },
    trigger: null, // Immediate delivery
  });
}

export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.setBadgeCountAsync(0);
}
